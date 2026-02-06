"""
REST API Views for COTISA
All endpoints return JSON - NO template rendering!
"""
from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.contrib import messages
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
import json
import random
import secrets
import logging
from functools import wraps

logger = logging.getLogger(__name__)

from .models import (
    Player, Role, TournamentActive, Match, Notification,
    TournamentRegistration, TournamentParticipant, PlayerTitle, Title, Achievement
)
from .helpers import admin_required, permission_required


def get_player_profile_picture(player):
    """Get player profile picture URL - only uploaded pictures, no external sources"""
    if player.profile_picture:
        try:
            pic_name = str(player.profile_picture)
            # Only return if it's an actual uploaded picture, not default
            if pic_name and pic_name != 'default-avatar.png' and 'profile_pictures/' in pic_name:
                return player.profile_picture.url
        except:
            pass
    return None


# Token-based authentication decorator
def token_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Get token from X-Auth-Token header
        auth_token = request.headers.get('X-Auth-Token')
        
        if not auth_token:
            return JsonResponse({'error': 'Authentication required - no token provided'}, status=401)
        
        try:
            # Find user by token
            player = Player.objects.get(auth_token=auth_token, is_active=True)
            # Attach player to request
            request.user = player
            return view_func(request, *args, **kwargs)
        except Player.DoesNotExist:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)
    
    return wrapper


# Custom authentication decorator for API that returns JSON instead of redirect
def api_login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


# ============================================
# AUTHENTICATION API
# ============================================

@require_POST
@csrf_exempt
def api_register(request):
    """
    POST /api/register/
    Register new player account
    Body: {username, email, password, full_name?, experience_level?}
    """
    try:
        from .elo_rating import get_initial_rating
        
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        experience_level = data.get('experience_level', 'intermediate')
        
        # Validation
        if not username or not email or not password:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        if Player.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if Player.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Validate experience level
        if experience_level not in ['beginner', 'intermediate', 'advanced']:
            experience_level = 'intermediate'
        
        # Get player role
        player_role = Role.objects.get(role_name='player')
        
        # Get initial rating based on experience
        initial_rating = get_initial_rating(experience_level)
        
        # Create user
        user = Player.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=player_role
        )
        
        # Set experience level and initial ratings
        user.experience_level = experience_level
        user.elo_rating = initial_rating
        user.elo_bullet = initial_rating
        user.elo_blitz = initial_rating
        user.elo_rapid = initial_rating
        user.elo_daily = initial_rating
        user.elo_puzzle = initial_rating
        user.is_provisional = True
        user.matches_played = 0
        
        if full_name:
            user.full_name = full_name
        
        # Generate auth token for auto-login
        auth_token = secrets.token_urlsafe(32)
        user.auth_token = auth_token
        user.save()
        
        # Send welcome email (async - don't block registration)
        try:
            from .email_service import send_welcome_email
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Sending welcome email to new user: {user.email}")
            result = send_welcome_email(user)
            logger.info(f"Welcome email result: {result}")
        except Exception as email_error:
            # Log but don't fail registration if email fails
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Warning: Could not send welcome email to {user.email}: {email_error}")
        
        # Auto-login the user
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Registration successful',
            'auth_token': auth_token,
            'user': {
                'id': user.player_id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role.role_name,
                'elo_rating': user.elo_rating,
                'elo_rapid': user.elo_rapid,
                'elo_blitz': user.elo_blitz,
                'elo_bullet': user.elo_bullet,
                'experience_level': user.experience_level,
                'is_provisional': user.is_provisional,
                'wins': user.wins,
                'losses': user.losses,
                'draws': user.draws,
                'matches_played': user.matches_played
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Role.DoesNotExist:
        return JsonResponse({'error': 'Player role not configured'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@csrf_exempt
def api_login(request):
    """
    POST /api/login/
    Login user with username or Chess.com username
    Body: {username, password}
    Returns: user data + auth_token
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Korisničko ime i lozinka su obavezni'}, status=400)
        
        # Try to authenticate with regular username
        user = authenticate(request, username=username, password=password)
        
        # If failed, try to find user by Chess.com username and authenticate
        if user is None:
            try:
                player = Player.objects.get(chesscom_username__iexact=username)
                user = authenticate(request, username=player.username, password=password)
            except Player.DoesNotExist:
                pass
        
        if user is not None:
            # Generate authentication token
            auth_token = secrets.token_urlsafe(32)
            user.auth_token = auth_token
            user.save(update_fields=['auth_token'])
            
            # Still use session-based auth as fallback
            login(request, user)
            
            return JsonResponse({
                'success': True,
                'message': 'Uspješna prijava',
                'auth_token': auth_token,  # NEW: Return token for storage
                'user': {
                    'id': user.player_id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.full_name,
                    'chesscom_username': user.chesscom_username,
                    'role': user.role.role_name,
                    'elo_rating': user.elo_rating,
                    'elo_rapid': user.elo_rapid,
                    'elo_blitz': user.elo_blitz,
                    'elo_bullet': user.elo_bullet,
                    'elo_daily': user.elo_daily,
                    'elo_puzzle': user.elo_puzzle,
                    'wins': user.wins,
                    'losses': user.losses,
                    'draws': user.draws,
                    'matches_played': user.matches_played,
                    'is_provisional': user.is_provisional,
                    'experience_level': user.experience_level,
                    'profile_picture': get_player_profile_picture(user),
                    'active_title': {
                        'id': user.active_title.title_id,
                        'name': user.active_title.title_name,
                        'icon': user.active_title.icon_class,
                        'color': user.active_title.color_code
                    } if user.active_title else None,
                    'date_joined': user.date_joined.isoformat(),
                    'created_at': user.date_joined.isoformat()  # Alias for frontend
                }
            })
        else:
            return JsonResponse({'error': 'Neispravno korisničko ime ili lozinka'}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Nevažeći JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
def api_logout(request):
    """
    POST /api/logout/
    Logout current user and clear their auth token
    """
    # Clear token if user is authenticated
    if hasattr(request, 'user') and request.user.is_authenticated:
        try:
            player = Player.objects.get(player_id=request.user.player_id)
            player.auth_token = None
            player.save(update_fields=['auth_token'])
        except Player.DoesNotExist:
            pass
    
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


@csrf_exempt
def api_delete_account(request):
    """
    POST /api/delete-account/
    Permanently delete the current user's account
    Body: {password: "user_password"} for confirmation
    """
    # Check HTTP method first and return JSON error
    if request.method != 'POST':
        return JsonResponse({
            'error': 'Metoda nije dozvoljena. Koristite POST.'
        }, status=405)
    
    try:
        # Check auth token
        auth_token = request.headers.get('X-Auth-Token')
        if not auth_token:
            return JsonResponse({'error': 'Niste prijavljeni'}, status=401)
        
        try:
            user = Player.objects.get(auth_token=auth_token)
        except Player.DoesNotExist:
            return JsonResponse({'error': 'Nevažeći token'}, status=401)
        
        # Parse request body
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Neispravan format podataka'}, status=400)
        
        password = data.get('password', '')
        
        if not password:
            return JsonResponse({'error': 'Lozinka je obavezna za potvrdu brisanja'}, status=400)
        
        # Verify password
        if not user.check_password(password):
            return JsonResponse({'error': 'Neispravna lozinka'}, status=400)
        
        # Delete the user
        username = user.username
        user.delete()
        
        # Logout session
        logout(request)
        
        return JsonResponse({
            'success': True,
            'message': f'Račun "{username}" je uspješno izbrisan'
        })
        
    except Exception as e:
        logger.error(f"Delete account error: {str(e)}")
        return JsonResponse({'error': 'Greška pri brisanju računa'}, status=500)


@require_POST
@csrf_exempt
def api_google_login(request):
    """
    POST /api/google-login/
    Login/Register with Google OAuth token
    Body: {token: "google_id_token"}
    """
    try:
        from .google_auth import verify_google_token, get_or_create_google_user
        
        data = json.loads(request.body)
        token = data.get('token')
        
        if not token:
            return JsonResponse({'error': 'Google token required'}, status=400)
        
        # Verify token with Google
        google_info = verify_google_token(token)
        if not google_info:
            return JsonResponse({'error': 'Invalid Google token'}, status=401)
        
        # Check if email is verified
        if not google_info.get('email_verified', False):
            return JsonResponse({'error': 'Email not verified with Google'}, status=400)
        
        # Get or create user
        user, created = get_or_create_google_user(google_info)
        
        # Generate auth token
        auth_token = secrets.token_urlsafe(32)
        user.auth_token = auth_token
        user.save(update_fields=['auth_token'])
        
        # Login user
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Google login successful' if not created else 'Account created with Google',
            'created': created,
            'auth_token': auth_token,
            'user': {
                'id': user.player_id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role.role_name,
                'elo_rating': user.elo_rating,
                'wins': user.wins,
                'losses': user.losses,
                'draws': user.draws,
                'profile_picture': get_player_profile_picture(user),
                'active_title': {
                    'id': user.active_title.title_id,
                    'name': user.active_title.title_name,
                    'icon': user.active_title.icon_class,
                    'color': user.active_title.color_code
                } if user.active_title else None
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@csrf_exempt
def api_chesscom_login(request):
    """
    POST /api/chesscom-login/
    Register with Chess.com username + password
    Body: {chesscom_username: "username", password: "password", email: "optional"}
    """
    try:
        from .chesscom_auth import verify_chesscom_user
        
        data = json.loads(request.body)
        chesscom_username = data.get('chesscom_username', '').strip()
        password = data.get('password', '')
        user_email = data.get('email', '').strip()
        
        # Validation
        if not chesscom_username:
            return JsonResponse({'error': 'Chess.com korisničko ime je obavezno'}, status=400)
        
        if not password or len(password) < 6:
            return JsonResponse({'error': 'Lozinka mora imati najmanje 6 znakova'}, status=400)
        
        # Check if Chess.com username already linked
        if Player.objects.filter(chesscom_username__iexact=chesscom_username).exists():
            return JsonResponse({'error': 'Ovaj Chess.com račun je već povezan'}, status=400)
        
        # Verify Chess.com username exists
        chesscom_data = verify_chesscom_user(chesscom_username)
        if not chesscom_data:
            return JsonResponse({
                'error': f'Chess.com korisnik "{chesscom_username}" nije pronađen. Provjerite ime i pokušajte ponovo.'
            }, status=404)
        
        # Create username from Chess.com username
        base_username = chesscom_username.lower()
        username = base_username
        counter = 1
        while Player.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Generate email if not provided
        if not user_email or '@' not in user_email:
            user_email = f"{username}@chesscom.cotisa.local"
        else:
            # Check if email already exists
            if Player.objects.filter(email=user_email).exists():
                return JsonResponse({'error': 'Email već postoji'}, status=400)
        
        # Get player role
        player_role = Role.objects.get(role_name='player')
        
        # Extract stats from Chess.com
        profile = chesscom_data.get('profile', {})
        stats = chesscom_data.get('stats', {})
        
        # Calculate ELO ratings by type
        elo_rapid = 1200
        elo_blitz = 1200
        elo_bullet = 1200
        elo_daily = 1200
        elo_puzzle = 1200
        
        # Extract ratings from Chess.com stats
        if 'chess_rapid' in stats and 'last' in stats['chess_rapid']:
            elo_rapid = stats['chess_rapid']['last'].get('rating', 1200)
        
        if 'chess_blitz' in stats and 'last' in stats['chess_blitz']:
            elo_blitz = stats['chess_blitz']['last'].get('rating', 1200)
        
        if 'chess_bullet' in stats and 'last' in stats['chess_bullet']:
            elo_bullet = stats['chess_bullet']['last'].get('rating', 1200)
        
        if 'chess_daily' in stats and 'last' in stats['chess_daily']:
            elo_daily = stats['chess_daily']['last'].get('rating', 1200)
        
        if 'tactics' in stats and 'highest' in stats['tactics']:
            elo_puzzle = stats['tactics']['highest'].get('rating', 1200)
        
        # Calculate average ELO from available ratings
        elo_ratings = [r for r in [elo_rapid, elo_blitz, elo_bullet, elo_daily] if r != 1200]
        avg_elo = int(sum(elo_ratings) / len(elo_ratings)) if elo_ratings else 1200
        
        # Calculate totals
        total_wins = 0
        total_losses = 0
        total_draws = 0
        
        for game_mode in ['chess_rapid', 'chess_blitz', 'chess_bullet', 'chess_daily']:
            if game_mode in stats and 'record' in stats[game_mode]:
                record = stats[game_mode]['record']
                total_wins += record.get('win', 0)
                total_losses += record.get('loss', 0)
                total_draws += record.get('draw', 0)
        
        total_matches = total_wins + total_losses + total_draws
        
        # Create player
        user = Player.objects.create_user(
            username=username,
            email=user_email,
            password=password,
            full_name=profile.get('name', chesscom_username),
            role=player_role,
            elo_rating=avg_elo,
            elo_rapid=elo_rapid,
            elo_blitz=elo_blitz,
            elo_bullet=elo_bullet,
            elo_daily=elo_daily,
            elo_puzzle=elo_puzzle,
            wins=total_wins,
            losses=total_losses,
            draws=total_draws,
            total_matches=total_matches,
            chesscom_username=chesscom_username,
            chesscom_id=profile.get('player_id'),
            chesscom_avatar=profile.get('avatar')
        )
        
        # Login user
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': f'Uspješno kreiran račun s Chess.com statistikama!',
            'login_info': f'Za prijavu koristi Chess.com ime "{chesscom_username}" ili "{username}"',
            'stats_imported': True,
            'user': {
                'id': user.player_id,
                'username': user.username,
                'chesscom_username': user.chesscom_username,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role.role_name,
                'elo_rating': user.elo_rating,
                'elo_rapid': user.elo_rapid,
                'elo_blitz': user.elo_blitz,
                'elo_bullet': user.elo_bullet,
                'elo_daily': user.elo_daily,
                'elo_puzzle': user.elo_puzzle,
                'wins': user.wins,
                'losses': user.losses,
                'draws': user.draws,
                'total_matches': user.total_matches,
                'profile_picture': get_player_profile_picture(user),
                'active_title': {
                    'id': user.active_title.title_id,
                    'name': user.active_title.title_name,
                    'icon': user.active_title.icon_class,
                    'color': user.active_title.color_code
                } if user.active_title else None
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Nevažeći JSON'}, status=400)
    except Role.DoesNotExist:
        return JsonResponse({'error': 'Systemska greška: uloga igrača ne postoji'}, status=500)
    except Exception as e:
        print(f"Chess.com login error: {e}")
        return JsonResponse({'error': f'Greška: {str(e)}'}, status=500)


@require_POST
@token_required
def api_sync_chesscom_stats(request):
    """
    POST /api/sync-chesscom-stats/
    Sync current user's stats from Chess.com
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        from .chesscom_auth import sync_chesscom_stats
        
        if not request.user.chesscom_username:
            logger.warning(f"User {request.user.username} has no Chess.com username")
            return JsonResponse({'error': 'No Chess.com account linked', 'success': False}, status=400)
        
        logger.info(f"Starting sync for user {request.user.username}, Chess.com: {request.user.chesscom_username}")
        success = sync_chesscom_stats(request.user)
        
        if success:
            # Refresh user data
            request.user.refresh_from_db()
            
            logger.info(f"Sync successful for {request.user.username}")
            return JsonResponse({
                'success': True,
                'message': 'Statistike sinkronizirane s Chess.com',
                'user': {
                    'elo_rating': request.user.elo_rating,
                    'elo_rapid': request.user.elo_rapid,
                    'elo_blitz': request.user.elo_blitz,
                    'elo_bullet': request.user.elo_bullet,
                    'elo_daily': request.user.elo_daily,
                    'elo_puzzle': request.user.elo_puzzle,
                    'wins': request.user.wins,
                    'losses': request.user.losses,
                    'draws': request.user.draws,
                    'total_matches': request.user.total_matches
                }
            })
        else:
            logger.error(f"Sync failed for {request.user.username}")
            return JsonResponse({
                'error': 'Nije moguće sinkronizirati s Chess.com. Molimo pokušajte ponovo.',
                'success': False
            }, status=500)
            
    except Exception as e:
        logger.exception(f"Exception during sync for {request.user.username}: {str(e)}")
        return JsonResponse({
            'error': f'Greška pri sinkronizaciji: {str(e)}',
            'success': False
        }, status=500)


@require_POST
@csrf_exempt
def api_link_chesscom(request):
    """
    POST /api/link-chesscom/
    Link Chess.com account to existing logged-in user
    Body: {username: "chesscom_username"}
    """
    try:
        from .chesscom_auth import verify_chesscom_user, ChessComAPI
        
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Must be logged in'}, status=401)
        
        data = json.loads(request.body)
        chesscom_username = data.get('username')
        
        if not chesscom_username:
            return JsonResponse({'error': 'Chess.com username required'}, status=400)
        
        # Check if username is already linked to another account
        if Player.objects.filter(chesscom_username=chesscom_username).exclude(player_id=request.user.player_id).exists():
            return JsonResponse({'error': 'This Chess.com account is already linked to another user'}, status=400)
        
        # Verify username with Chess.com API
        chesscom_data = verify_chesscom_user(chesscom_username)
        if not chesscom_data:
            return JsonResponse({'error': 'Chess.com user not found or API unavailable'}, status=404)
        
        # Link account and import stats
        request.user.chesscom_username = chesscom_username
        request.user.chesscom_id = chesscom_data.get('chesscom_id', '')
        request.user.chesscom_avatar = chesscom_data.get('avatar', '')
        request.user.elo_rating = chesscom_data['rating']
        request.user.wins = chesscom_data['wins']
        request.user.losses = chesscom_data['losses']
        request.user.draws = chesscom_data['draws']
        request.user.total_matches = chesscom_data['total_matches']
        request.user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Chess.com account linked and stats imported',
            'user': {
                'chesscom_username': request.user.chesscom_username,
                'elo_rating': request.user.elo_rating,
                'wins': request.user.wins,
                'losses': request.user.losses,
                'draws': request.user.draws,
                'total_matches': request.user.total_matches
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================
# TOURNAMENT API
# ============================================

@require_POST
@token_required
@csrf_exempt
def api_create_tournament(request):
    """
    POST /api/tournaments/create/
    Create new tournament with 6-digit join code
    Body: {
        tournament_name/name, 
        tournament_type/type, 
        max_players/max_participants,
        pairing_system,
        time_control_type,
        time_control_minutes,
        time_increment_seconds,
        start_date?,
        end_date?,
        description?,
        entry_fee?
    }
    """
    try:
        data = json.loads(request.body)
        
        tournament_name = data.get('tournament_name') or data.get('name')
        tournament_type = data.get('tournament_type') or data.get('type', 'elimination')
        max_participants = int(data.get('max_players') or data.get('max_participants', 16))
        pairing_system = data.get('pairing_system', 'random')
        time_control_type = data.get('time_control_type', 'rapid')
        time_control_minutes = int(data.get('time_control_minutes', 10))
        time_increment_seconds = int(data.get('time_increment_seconds', 0))
        is_public = data.get('is_public', True)  # Default to public
        creator_plays = data.get('creator_plays', True)  # Whether creator joins as player
        
        if not tournament_name:
            return JsonResponse({'error': 'Tournament name required'}, status=400)
        
        if tournament_type not in ['elimination', 'round_robin']:
            return JsonResponse({'error': 'Type must be "elimination" or "round_robin"'}, status=400)
        
        if pairing_system not in ['random', 'rating', 'swiss', 'manual']:
            pairing_system = 'random'
        
        # Parse dates if provided
        start_date = data.get('start_date')
        
        if start_date:
            from datetime import datetime
            try:
                # Parse ISO format datetime string
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                # Make it timezone aware if it isn't
                if timezone.is_naive(start_date):
                    start_date = timezone.make_aware(start_date)
            except:
                start_date = timezone.now()
        else:
            start_date = timezone.now()
        
        # Create tournament (no end_date - tournament ends when all matches are completed)
        tournament = TournamentActive.objects.create(
            tournament_name=tournament_name,
            description=data.get('description', ''),
            created_by=request.user,
            tournament_type=tournament_type,
            max_participants=max_participants,
            pairing_system=pairing_system,
            time_control_type=time_control_type,
            time_control_minutes=time_control_minutes,
            time_increment_seconds=time_increment_seconds,
            time_control=f"{time_control_minutes}+{time_increment_seconds}",
            start_date=start_date,
            is_public=is_public,
        )
        
        # Automatically join creator as player if they want to play
        if creator_plays:
            TournamentParticipant.objects.create(
                tournament=tournament,
                player=request.user,
                seed_number=1
            )
            tournament.current_participants = 1
            tournament.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Tournament created successfully',
            'tournament': {
                'id': tournament.tournament_id,
                'code': tournament.tournament_code,  # 6-digit join code
                'tournament_code': tournament.tournament_code,
                'name': tournament.tournament_name,
                'type': tournament.tournament_type,
                'max_participants': tournament.max_participants,
                'current_participants': tournament.current_participants,
                'status': tournament.tournament_status,
                'pairing_system': tournament.pairing_system,
                'time_control_type': tournament.time_control_type,
                'created_by': request.user.username
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_join_tournament(request):
    """
    POST /api/tournaments/join/
    Join tournament with 6-digit code
    Body: {tournament_code}
    """
    try:
        data = json.loads(request.body)
        code = data.get('tournament_code') or data.get('code')
        
        if not code or len(code) != 6:
            return JsonResponse({'error': 'Valid 6-digit code required'}, status=400)
        
        # Find tournament
        try:
            tournament = TournamentActive.objects.get(tournament_code=code)
        except TournamentActive.DoesNotExist:
            return JsonResponse({'error': 'Invalid tournament code'}, status=404)
        
        # Check if code is still valid
        if tournament.tournament_status == 'completed':
            return JsonResponse({'error': 'Tournament has ended, code is no longer valid'}, status=400)
        
        # Check if already joined
        if TournamentParticipant.objects.filter(tournament=tournament, player=request.user).exists():
            return JsonResponse({'error': 'You are already in this tournament'}, status=400)
        
        # Check if full
        if tournament.current_participants >= tournament.max_participants:
            return JsonResponse({'error': 'Tournament is full'}, status=400)
        
        # Join tournament
        TournamentParticipant.objects.create(
            tournament=tournament,
            player=request.user,
            seed_number=tournament.current_participants + 1
        )
        
        tournament.current_participants += 1
        tournament.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Joined {tournament.tournament_name}',
            'tournament': {
                'id': tournament.tournament_id,
                'name': tournament.tournament_name,
                'type': tournament.tournament_type,
                'current_participants': tournament.current_participants,
                'max_participants': tournament.max_participants
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_GET
def api_all_tournaments(request):
    """
    GET /api/tournaments/
    Get all active PUBLIC tournaments (no auth required)
    Supports pagination: ?page=1&per_page=20
    """
    tournaments = TournamentActive.objects.filter(
        tournament_status__in=['registration', 'active', 'upcoming'],
        is_public=True  # Only show public tournaments
    ).select_related('created_by').order_by('-created_at')
    
    # Check if pagination is requested
    page = request.GET.get('page')
    if page:
        from .pagination import paginate_queryset, serialize_tournament
        return paginate_queryset(
            tournaments, request, 
            per_page=20, 
            serializer_func=serialize_tournament,
            data_key='tournaments'
        )
    
    data = [{
        'id': t.tournament_id,
        'code': t.tournament_code,
        'tournament_code': t.tournament_code,
        'name': t.tournament_name,
        'tournament_name': t.tournament_name,
        'type': t.tournament_type,
        'tournament_status': t.tournament_status,
        'status': t.tournament_status,
        'current_players': t.current_participants,
        'participants': t.current_participants,
        'max_players': t.max_participants,
        'max_participants': t.max_participants,
        'start_date': t.start_date.isoformat() if t.start_date else None,
        'created_at': t.created_at.isoformat(),
        'created_by': t.created_by.username,
        'is_public': t.is_public
    } for t in tournaments]
    
    return JsonResponse({'success': True, 'tournaments': data})


@require_GET
@token_required
def api_my_tournaments(request):
    """
    GET /api/tournaments/my/
    Get tournaments created by current user
    """
    tournaments = TournamentActive.objects.filter(
        created_by=request.user
    ).order_by('-created_at')
    
    data = [{
        'id': t.tournament_id,
        'code': t.tournament_code,
        'tournament_code': t.tournament_code,
        'name': t.tournament_name,
        'tournament_name': t.tournament_name,
        'type': t.tournament_type,
        'tournament_status': t.tournament_status,
        'status': t.tournament_status,
        'current_players': t.current_participants,
        'participants': t.current_participants,
        'max_players': t.max_participants,
        'max_participants': t.max_participants,
        'start_date': t.start_date.isoformat() if t.start_date else None,
        'created_at': t.created_at.isoformat()
    } for t in tournaments]
    
    return JsonResponse({'success': True, 'tournaments': data})


@require_GET
@token_required
def api_tournament_detail(request, tournament_id):
    """
    GET /api/tournaments/<id>/
    Get tournament details with optimized queries
    """
    tournament = get_object_or_404(
        TournamentActive.objects.select_related('created_by'),
        tournament_id=tournament_id
    )
    
    # Get participants with optimized query
    participants = TournamentParticipant.objects.filter(
        tournament=tournament
    ).select_related('player', 'player__active_title').order_by('seed_number')
    
    # Get matches with optimized query
    matches = Match.objects.filter(tournament=tournament).select_related(
        'white_player', 'black_player', 'winner'
    ).order_by('round_number', 'match_id')
    
    return JsonResponse({
        'success': True,
        'tournament': {
            'id': tournament.tournament_id,
            'code': tournament.tournament_code,
            'tournament_code': tournament.tournament_code,
            'name': tournament.tournament_name,
            'tournament_name': tournament.tournament_name,
            'description': tournament.description,
            'type': tournament.tournament_type,
            'tournament_type': tournament.tournament_type,
            'status': tournament.tournament_status,
            'tournament_status': tournament.tournament_status,
            'current_participants': tournament.current_participants,
            'max_participants': tournament.max_participants,
            'start_date': tournament.start_date.isoformat() if tournament.start_date else None,
            'created_at': tournament.created_at.isoformat() if tournament.created_at else None,
            'created_by': tournament.created_by.username,
            'creator_id': tournament.created_by.player_id
        },
        'participants': [{
            'id': p.player.player_id,
            'username': p.player.username,
            'elo_rating': p.player.elo_rating,
            'seed': p.seed_number,
            'is_eliminated': p.is_eliminated,
            'is_provisional': p.player.is_provisional,
            'matches_played': p.player.matches_played
        } for p in participants],
        'matches': [{
            'id': m.match_id,
            'tournament_id': m.tournament.tournament_id,
            'round_number': m.round_number,
            'player1_id': m.white_player.player_id if m.white_player else None,
            'player1_name': m.white_player.username if m.white_player else 'TBD',
            'player1_is_provisional': m.white_player.is_provisional if m.white_player else False,
            'player2_id': m.black_player.player_id if m.black_player else None,
            'player2_name': m.black_player.username if m.black_player else 'TBD',
            'player2_is_provisional': m.black_player.is_provisional if m.black_player else False,
            'winner_id': m.winner.player_id if m.winner else None,
            'status': m.match_status,
            'scheduled_time': m.match_date.isoformat() if m.match_date else None
        } for m in matches]
    })


@require_GET
@csrf_exempt
def api_tournament_by_code(request, tournament_code):
    """
    GET /api/tournaments/<code>/
    Get tournament details by code
    """
    tournament = get_object_or_404(TournamentActive, tournament_code=tournament_code)
    
    # Get participants
    participants = TournamentParticipant.objects.filter(
        tournament=tournament
    ).select_related('player').order_by('seed_number')
    
    return JsonResponse({
        'success': True,
        'tournament': {
            'id': tournament.tournament_id,
            'tournament_code': tournament.tournament_code,
            'tournament_name': tournament.tournament_name,
            'description': tournament.description or '',
            'tournament_type': tournament.tournament_type,
            'status': tournament.tournament_status,
            'current_participants': tournament.current_participants,
            'max_players': tournament.max_participants,
            'start_date': tournament.start_date.isoformat() if tournament.start_date else None,
            'entry_fee': float(tournament.entry_fee) if tournament.entry_fee else 0,
            'created_by': tournament.created_by.username if tournament.created_by else 'N/A'
        },
        'players': [{
            'username': p.player.username,
            'full_name': p.player.full_name or '',
            'elo_rating': p.player.elo_rating,
            'seed': p.seed_number,
            'is_eliminated': p.is_eliminated,
            'joined_date': p.registration_date.isoformat() if hasattr(p, 'registration_date') and p.registration_date else 'N/A'
        } for p in participants]
    })


@require_POST
@token_required
@csrf_exempt
def api_start_tournament(request):
    """
    POST /api/tournaments/start/
    Start a tournament (changes status to 'in_progress')
    Body: {tournament_code}
    """
    try:
        data = json.loads(request.body)
        tournament_code = data.get('tournament_code')
        
        if not tournament_code:
            return JsonResponse({'success': False, 'error': 'Tournament code required'}, status=400)
        
        tournament = get_object_or_404(TournamentActive, tournament_code=tournament_code)
        
        # Check if user is the creator
        if tournament.created_by != request.user:
            return JsonResponse({'success': False, 'error': 'Only tournament creator can start the tournament'}, status=403)
        
        # Check minimum players
        if tournament.current_participants < 2:
            return JsonResponse({'success': False, 'error': 'Need at least 2 players to start'}, status=400)
        
        # Update status
        tournament.tournament_status = 'in_progress'
        tournament.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Tournament started successfully',
            'tournament': {
                'code': tournament.tournament_code,
                'status': tournament.tournament_status
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_start_tournament_by_id(request, tournament_id):
    """
    POST /api/tournaments/<id>/start/
    Start a tournament by ID (changes status to 'in_progress' and generates matches + games)
    """
    from .models import Game
    
    try:
        tournament = get_object_or_404(TournamentActive, tournament_id=tournament_id)
        
        # Check if user is the creator
        if tournament.created_by != request.user:
            return JsonResponse({'success': False, 'error': 'Samo kreator turnira može pokrenuti turnir'}, status=403)
        
        # Check if already started
        if tournament.tournament_status == 'in_progress':
            return JsonResponse({'success': False, 'error': 'Turnir je već pokrenut'}, status=400)
        
        # Check minimum players
        if tournament.current_participants < 2:
            return JsonResponse({'success': False, 'error': 'Potrebno je najmanje 2 igrača za pokretanje turnira'}, status=400)
        
        # Get all participants - shuffle for random pairing
        import random
        participants = list(TournamentParticipant.objects.filter(
            tournament=tournament
        ).select_related('player'))
        
        # Sort by seed if rating-based, otherwise shuffle
        if tournament.pairing_system == 'rating':
            participants.sort(key=lambda p: p.player.elo_rating, reverse=True)
        elif tournament.pairing_system == 'random':
            random.shuffle(participants)
        # manual and swiss use default order
        
        # Get time control from tournament
        time_control_minutes = tournament.time_control_minutes or 10
        time_increment_seconds = tournament.time_increment_seconds or 0
        
        # Generate matches and games based on tournament type
        matches_created = []
        games_created = []
        
        def create_match_and_game(white_participant, black_participant, round_number=1):
            """Helper to create match and game together"""
            match = Match.objects.create(
                tournament=tournament,
                white_player=white_participant.player,
                black_player=black_participant.player,
                match_status='scheduled',
                round_number=round_number,
                time_control=f"{time_control_minutes}+{time_increment_seconds}",
                white_elo_before=white_participant.player.elo_rating,
                black_elo_before=black_participant.player.elo_rating
            )
            
            # Create game for this match
            game = Game.objects.create(
                tournament=tournament,
                match=match,
                white_player=white_participant.player,
                black_player=black_participant.player,
                status='waiting',
                time_control_minutes=time_control_minutes,
                time_increment_seconds=time_increment_seconds,
                white_time_remaining=time_control_minutes * 60,
                black_time_remaining=time_control_minutes * 60
            )
            
            # Send notifications to both players with game link
            opponent_name_white = black_participant.player.username
            opponent_name_black = white_participant.player.username
            
            Notification.objects.create(
                player=white_participant.player,
                notification_type='pairing_update',
                title='🎮 Turnir je započeo!',
                message=f'Tvoj protivnik je {opponent_name_white}. Igraš bijelim figurama! Klikni za početak igre.',
                related_tournament=tournament,
                related_match=match
            )
            
            Notification.objects.create(
                player=black_participant.player,
                notification_type='pairing_update',
                title='🎮 Turnir je započeo!',
                message=f'Tvoj protivnik je {opponent_name_black}. Igraš crnim figurama! Klikni za početak igre.',
                related_tournament=tournament,
                related_match=match
            )
            
            return match, game
        
        if tournament.tournament_type == 'round_robin':
            # Round-robin: everyone plays everyone
            for i, p1 in enumerate(participants):
                for p2 in participants[i+1:]:
                    match, game = create_match_and_game(p1, p2, round_number=1)
                    matches_created.append(match)
                    games_created.append(game)
        
        elif tournament.tournament_type in ['knockout', 'elimination']:
            # Knockout/Elimination: pair players for first round
            for i in range(0, len(participants), 2):
                if i + 1 < len(participants):
                    match, game = create_match_and_game(participants[i], participants[i+1], round_number=1)
                    matches_created.append(match)
                    games_created.append(game)
                else:
                    # Odd player gets a bye (auto-advance)
                    participants[i].is_eliminated = False
                    participants[i].save()
        
        elif tournament.tournament_type == 'swiss':
            # Swiss: first round pairs top vs bottom half
            half = len(participants) // 2
            for i in range(half):
                if i + half < len(participants):
                    match, game = create_match_and_game(participants[i], participants[i + half], round_number=1)
                    matches_created.append(match)
                    games_created.append(game)
        
        # Update tournament status
        tournament.tournament_status = 'in_progress'
        tournament.start_date = timezone.now()
        tournament.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Turnir uspješno pokrenut! Kreirano {len(matches_created)} mečeva.',
            'tournament': {
                'id': tournament.tournament_id,
                'code': tournament.tournament_code,
                'status': tournament.tournament_status
            },
            'matches_created': len(matches_created),
            'games_created': len(games_created)
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_delete_tournament(request):
    """
    POST /api/tournaments/delete/
    Delete a tournament (only creator can delete)
    Body: {tournament_code}
    """
    try:
        data = json.loads(request.body)
        tournament_code = data.get('tournament_code')
        
        if not tournament_code:
            return JsonResponse({'success': False, 'error': 'Tournament code required'}, status=400)
        
        tournament = get_object_or_404(TournamentActive, tournament_code=tournament_code)
        
        # Check if user is the creator
        if tournament.created_by != request.user:
            return JsonResponse({'success': False, 'error': 'Only tournament creator can delete the tournament'}, status=403)
        
        # Delete related participants first
        TournamentParticipant.objects.filter(tournament=tournament).delete()
        
        # Delete tournament
        tournament.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Tournament deleted successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# PLAYER API
# ============================================

@require_GET
@token_required
def api_profile(request):
    """
    GET /api/profile/
    Get current user profile
    """
    user = request.user
    
    return JsonResponse({
        'user': {
            'id': user.player_id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'elo_rating': user.elo_rating,
            'wins': user.wins,
            'losses': user.losses,
            'draws': user.draws,
            'total_matches': user.total_matches,
            'role': user.role.role_name,
            'date_joined': user.date_joined.isoformat(),
            'profile_picture': get_player_profile_picture(user)
        }
    })


@require_GET
@token_required
def api_profile_stats(request):
    """
    GET /api/profile/stats/
    Get current user's statistics
    """
    user = request.user
    
    # Get tournament participation
    tournaments_participated = TournamentParticipant.objects.filter(player=user).count()
    tournaments_won = TournamentParticipant.objects.filter(player=user, placement=1).count()
    
    return JsonResponse({
        'success': True,
        'stats': {
            'tournaments_participated': tournaments_participated,
            'tournaments_won': tournaments_won,
            'total_matches': user.total_matches,
            'wins': user.wins,
            'losses': user.losses,
            'draws': user.draws,
            'win_rate': round((user.wins / user.total_matches * 100) if user.total_matches > 0 else 0, 1),
            'elo_rating': user.elo_rating,
            'elo_rapid': user.elo_rapid,
            'elo_blitz': user.elo_blitz,
            'elo_bullet': user.elo_bullet,
            'elo_daily': user.elo_daily,
            'elo_puzzle': user.elo_puzzle
        }
    })


@require_GET
@token_required
def api_profile_history(request):
    """
    GET /api/profile/history/
    Get current user's tournament history
    """
    user = request.user
    
    # Get tournaments user participated in
    participations = TournamentParticipant.objects.filter(
        player=user
    ).select_related('tournament').order_by('-tournament__created_at')[:20]
    
    history = []
    for participation in participations:
        tournament = participation.tournament
        history.append({
            'id': tournament.tournament_id,
            'name': tournament.tournament_name,
            'status': tournament.tournament_status,
            'created_at': tournament.created_at.isoformat(),
            'started_at': tournament.start_date.isoformat() if tournament.start_date else None,
            'ended_at': tournament.end_date.isoformat() if tournament.end_date else None,
            'total_players': tournament.current_participants,
            'your_position': participation.placement,
            'your_points': 0  # Points field doesn't exist in model
        })
    
    return JsonResponse({
        'success': True,
        'history': history
    })


@require_GET
def api_leaderboard(request):
    """
    GET /api/leaderboard/
    Get top players by ELO with pagination support
    ?page=1&per_page=50
    """
    limit = int(request.GET.get('limit', 50))
    page = request.GET.get('page')
    
    players = Player.objects.filter(
        is_active=True
    ).select_related('role', 'active_title').order_by('-elo_rating')
    
    # If pagination requested
    if page:
        from .pagination import paginate_queryset
        return paginate_queryset(
            players, request,
            per_page=limit,
            serializer_func=lambda p: {
                'rank': None,  # Will be calculated client-side with pagination
                'id': p.player_id,
                'username': p.username,
                'full_name': p.full_name,
                'elo_rating': p.elo_rating,
                'wins': p.wins,
                'losses': p.losses,
                'draws': p.draws,
                'total_matches': p.total_matches,
                'is_provisional': p.is_provisional,
                'active_title': p.active_title.title_name if p.active_title else None
            },
            data_key='leaderboard'
        )
    
    # Without pagination (legacy support)
    players = players[:limit]
    
    data = [{
        'rank': idx + 1,
        'id': p.player_id,
        'username': p.username,
        'elo_rating': p.elo_rating,
        'wins': p.wins,
        'losses': p.losses,
        'draws': p.draws,
        'is_provisional': p.is_provisional,
        'active_title': p.active_title.title_name if p.active_title else None
    } for idx, p in enumerate(players)]
    
    return JsonResponse({'leaderboard': data})


# ============================================
# MATCH API
# ============================================

@require_GET
@token_required
def api_my_matches(request):
    """
    GET /api/matches/my/
    Get current user's match history with optimized queries
    Supports pagination: ?page=1&per_page=20
    """
    matches = Match.objects.filter(
        Q(white_player=request.user) | Q(black_player=request.user)
    ).select_related(
        'white_player', 'black_player', 'winner', 'tournament'
    ).order_by('-match_date')
    
    # Check for pagination
    page = request.GET.get('page')
    if page:
        from .pagination import paginate_queryset, serialize_match
        return paginate_queryset(
            matches, request,
            per_page=20,
            serializer_func=serialize_match,
            data_key='matches'
        )
    
    # Without pagination (limit to 50)
    matches = matches[:50]
    
    data = [{
        'id': m.match_id,
        'white_player': m.white_player.username,
        'black_player': m.black_player.username,
        'result': m.result,
        'status': m.match_status,
        'date': m.match_date.isoformat(),
        'tournament_name': m.tournament.tournament_name if m.tournament else None
    } for m in matches]
    
    return JsonResponse({'matches': data})


# ============================================
# ADMIN API
# ============================================

@require_GET
@token_required
@admin_required
def api_admin_dashboard(request):
    """
    GET /api/admin/dashboard/
    Get admin dashboard stats
    """
    total_players = Player.objects.count()
    total_tournaments = TournamentActive.objects.count()
    active_tournaments = TournamentActive.objects.filter(
        tournament_status='in_progress'
    ).count()
    total_matches = Match.objects.count()
    
    return JsonResponse({
        'stats': {
            'total_players': total_players,
            'total_tournaments': total_tournaments,
            'active_tournaments': active_tournaments,
            'total_matches': total_matches
        }
    })


@require_GET
@token_required
def api_admin_players(request):
    """
    GET /api/admin/players/
    Get all players for admin management
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    players = Player.objects.select_related('role').all().order_by('-date_joined')
    
    data = [{
        'id': p.player_id,
        'username': p.username,
        'email': p.email,
        'full_name': p.full_name or '',
        'elo_rating': p.elo_rating,
        'wins': p.wins,
        'losses': p.losses,
        'draws': p.draws,
        'role': p.role.role_name if p.role else 'player',
        'created_at': p.date_joined.isoformat() if p.date_joined else None
    } for p in players]
    
    return JsonResponse({'success': True, 'players': data})


@require_POST
@token_required
@csrf_exempt
def api_admin_delete_player(request):
    """
    POST /api/admin/players/delete/
    Delete a player (admin only)
    Body: {player_id}
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    try:
        data = json.loads(request.body)
        player_id = data.get('player_id')
        
        if not player_id:
            return JsonResponse({'success': False, 'error': 'Player ID required'}, status=400)
        
        player = get_object_or_404(Player, player_id=player_id)
        
        # Don't allow deleting yourself
        if player.player_id == request.user.player_id:
            return JsonResponse({'success': False, 'error': 'Cannot delete yourself'}, status=400)
        
        username = player.username
        player.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Player {username} deleted successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_admin_make_admin(request):
    """
    POST /api/admin/make-admin/
    Make a player an admin
    Body: {player_id or username}
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    try:
        data = json.loads(request.body)
        player_id = data.get('player_id')
        username = data.get('username')
        
        if not player_id and not username:
            return JsonResponse({'success': False, 'error': 'Player ID or username required'}, status=400)
        
        # Find player
        if player_id:
            player = get_object_or_404(Player, player_id=player_id)
        else:
            player = get_object_or_404(Player, username=username)
        
        # Get admin role
        admin_role = Role.objects.filter(role_name='admin').first()
        if not admin_role:
            return JsonResponse({'success': False, 'error': 'Admin role not found'}, status=500)
        
        player.role = admin_role
        player.save()
        
        return JsonResponse({
            'success': True,
            'message': f'{player.username} is now an admin'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Player.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Player not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_player_profile(request, player_id):
    """
    GET /api/players/<player_id>/profile/
    Get public player profile
    """
    try:
        player = get_object_or_404(Player, player_id=player_id)
        
        return JsonResponse({
            'success': True,
            'player': {
                'id': player.player_id,
                'username': player.username,
                'full_name': player.full_name or '',
                'elo_rating': player.elo_rating,
                'elo_bullet': player.elo_bullet,
                'elo_blitz': player.elo_blitz,
                'elo_rapid': player.elo_rapid,
                'elo_daily': player.elo_daily,
                'wins': player.wins,
                'losses': player.losses,
                'draws': player.draws,
                'total_matches': player.total_matches,
                'matches_played': player.matches_played,
                'is_provisional': player.is_provisional,
                'experience_level': player.experience_level,
                'role': player.role.role_name if player.role else 'player',
                'profile_picture': get_player_profile_picture(player),
                'active_title': {
                    'id': player.active_title.title_id,
                    'name': player.active_title.title_name,
                    'icon': player.active_title.icon_class,
                    'color': player.active_title.color_code
                } if player.active_title else None,
                'created_at': player.date_joined.isoformat() if player.date_joined else None
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_all_players(request):
    """
    GET /api/players/all/
    Get all players (for browsing)
    """
    players = Player.objects.select_related('role').filter(
        is_active=True
    ).order_by('-elo_rating')[:100]
    
    data = [{
        'id': p.player_id,
        'username': p.username,
        'elo_rating': p.elo_rating,
        'wins': p.wins,
        'losses': p.losses,
        'draws': p.draws,
        'is_provisional': p.is_provisional,
        'matches_played': p.matches_played,
        'role': p.role.role_name if p.role else 'player'
    } for p in players]
    
    return JsonResponse({'success': True, 'players': data})


@require_GET
@token_required
def api_admin_titles(request):
    """
    GET /api/admin/titles/
    Get all available titles
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    titles = Title.objects.all().order_by('display_order', 'required_elo')
    
    data = [{
        'id': t.title_id,
        'name': t.title_name,
        'description': t.description or '',
        'required_elo': t.required_elo,
        'required_wins': t.required_wins,
        'icon': t.icon_class or '',
        'color': t.color_code or ''
    } for t in titles]
    
    return JsonResponse({'success': True, 'titles': data})


@require_POST
@token_required
@csrf_exempt
def api_admin_award_title(request):
    """
    POST /api/admin/titles/award/
    Award a title to a player (admin only)
    Body: {player_id, title_id}
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    try:
        data = json.loads(request.body)
        player_id = data.get('player_id')
        title_id = data.get('title_id')
        
        if not player_id or not title_id:
            return JsonResponse({'success': False, 'error': 'Player ID and Title ID required'}, status=400)
        
        player = get_object_or_404(Player, player_id=player_id)
        title = get_object_or_404(Title, title_id=title_id)
        
        # Check if already awarded
        existing = PlayerTitle.objects.filter(player=player, title=title).first()
        if existing:
            if existing.is_unlocked:
                return JsonResponse({'success': False, 'error': 'Title already awarded to this player'}, status=400)
            else:
                # Unlock existing title
                existing.is_unlocked = True
                existing.awarded_by = request.user
                existing.auto_unlocked = False
                existing.save()
        else:
            # Create new title award
            PlayerTitle.objects.create(
                player=player,
                title=title,
                awarded_by=request.user,
                is_unlocked=True,
                auto_unlocked=False
            )
        
        return JsonResponse({
            'success': True,
            'message': f'Title {title.title_name} awarded to {player.username}'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_delete_tournament(request):
    """
    POST /api/tournament/delete/
    Delete a tournament (admin or creator only)
    Body: {tournament_id}
    """
    try:
        data = json.loads(request.body)
        tournament_id = data.get('tournament_id')
        
        if not tournament_id:
            return JsonResponse({'success': False, 'error': 'Tournament ID required'}, status=400)
        
        tournament = get_object_or_404(TournamentActive, tournament_id=tournament_id)
        
        # Check permission: admin or creator
        is_admin = request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')
        is_creator = tournament.created_by == request.user
        
        if not is_admin and not is_creator:
            return JsonResponse({'success': False, 'error': 'Samo admin ili kreator mogu obrisati turnir'}, status=403)
        
        tournament_name = tournament.tournament_name
        
        # Delete all related data (matches, participants, games, etc.)
        # This will cascade delete related records due to ForeignKey on_delete=CASCADE
        tournament.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Turnir "{tournament_name}" je obrisan'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_admin_delete_title(request):
    """
    POST /api/admin/titles/delete/
    Delete a title (admin only)
    Body: {title_id}
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    try:
        data = json.loads(request.body)
        title_id = data.get('title_id')
        
        if not title_id:
            return JsonResponse({'success': False, 'error': 'Title ID required'}, status=400)
        
        title = get_object_or_404(Title, title_id=title_id)
        title_name = title.title_name
        
        # Delete the title (will cascade delete PlayerTitle entries)
        title.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Titula "{title_name}" je obrisana'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_admin_matches(request):
    """
    GET /api/admin/matches/
    Get all matches for admin management
    """
    # Check if user is admin
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    matches = Match.objects.select_related(
        'player_white', 'player_black', 'tournament'
    ).all().order_by('-match_date')[:100]  # Last 100 matches
    
    data = [{
        'id': m.match_id,
        'white_player': m.player_white.username if m.player_white else 'N/A',
        'black_player': m.player_black.username if m.player_black else 'N/A',
        'result': m.result,
        'tournament': m.tournament.tournament_name if m.tournament else 'Casual',
        'match_date': m.match_date.isoformat() if m.match_date else None,
        'round_number': m.round_number
    } for m in matches]
    
    return JsonResponse({'success': True, 'matches': data})


# ============================================

@require_POST
@token_required
@csrf_exempt
def api_upload_profile_picture(request):
    """
    POST /api/profile/upload-picture/
    Upload profile picture
    """
    try:
        if 'picture' not in request.FILES:
            return JsonResponse({'success': False, 'error': 'No picture provided'}, status=400)
        
        picture = request.FILES['picture']
        
        # Validate file size (max 5MB)
        if picture.size > 5 * 1024 * 1024:
            return JsonResponse({'success': False, 'error': 'File too large (max 5MB)'}, status=400)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if picture.content_type not in allowed_types:
            return JsonResponse({'success': False, 'error': 'Invalid file type (allowed: JPG, PNG, GIF)'}, status=400)
        
        # Save picture and set source to uploaded
        request.user.profile_picture = picture
        request.user.profile_picture_source = 'uploaded'
        request.user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile picture uploaded',
            'picture_url': request.user.profile_picture.url if request.user.profile_picture else None,
            'profile_picture_source': 'uploaded'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_set_profile_picture_source(request):
    """
    POST /api/profile/picture-source/
    Set which profile picture source to use
    Body: {source: 'uploaded' | 'google' | 'chesscom'}
    """
    try:
        data = json.loads(request.body)
        source = data.get('source', 'uploaded')
        
        valid_sources = ['uploaded', 'google', 'chesscom']
        if source not in valid_sources:
            return JsonResponse({'success': False, 'error': f'Invalid source. Must be one of: {valid_sources}'}, status=400)
        
        # Check if the source is available
        if source == 'google' and not request.user.google_picture:
            return JsonResponse({'success': False, 'error': 'No Google profile picture available. Please link your Google account first.'}, status=400)
        
        if source == 'chesscom' and not request.user.chesscom_avatar:
            return JsonResponse({'success': False, 'error': 'No Chess.com avatar available. Please sync your Chess.com profile first.'}, status=400)
        
        request.user.profile_picture_source = source
        request.user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Profile picture source updated',
            'profile_picture_source': source,
            'profile_picture': get_player_profile_picture(request.user)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_get_available_picture_sources(request):
    """
    GET /api/profile/picture-sources/
    Get available profile picture sources for current user
    """
    try:
        sources = []
        
        # Uploaded - check if has a valid uploaded picture (not default)
        uploaded_url = None
        has_uploaded = False
        if request.user.profile_picture:
            try:
                pic_name = str(request.user.profile_picture)
                # Check if it's not the default avatar
                if pic_name and pic_name != 'default-avatar.png' and 'profile_pictures/' in pic_name:
                    uploaded_url = request.user.profile_picture.url
                    has_uploaded = True
            except:
                pass
        sources.append({
            'id': 'uploaded',
            'name': 'Uploadana slika',
            'available': has_uploaded,
            'url': uploaded_url
        })
        
        # Google
        sources.append({
            'id': 'google',
            'name': 'Google',
            'available': bool(request.user.google_picture),
            'url': request.user.google_picture
        })
        
        # Chess.com
        sources.append({
            'id': 'chesscom',
            'name': 'Chess.com',
            'available': bool(request.user.chesscom_avatar),
            'url': request.user.chesscom_avatar
        })
        
        return JsonResponse({
            'success': True,
            'sources': sources,
            'current_source': request.user.profile_picture_source or 'uploaded'
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_challenge_player(request):
    """
    POST /api/players/challenge/
    Challenge another player to a match
    Body: {opponent_id, time_control, time_control_minutes?, time_increment_seconds?, preferred_color?}
    """
    try:
        # Log who is sending the challenge
        print(f"[CHALLENGE] User {request.user.username} (ID: {request.user.player_id}) is sending challenge")
        print(f"[CHALLENGE] Session key: {request.session.session_key}")
        
        data = json.loads(request.body)
        opponent_id = data.get('opponent_id')
        time_control = data.get('time_control', 'blitz')
        time_control_minutes = data.get('time_control_minutes')
        time_increment_seconds = data.get('time_increment_seconds', 0)
        preferred_color = data.get('preferred_color', 'random')
        
        if not opponent_id:
            return JsonResponse({'success': False, 'error': 'Opponent ID required'}, status=400)
        
        opponent = get_object_or_404(Player, player_id=opponent_id)
        
        print(f"[CHALLENGE] Opponent: {opponent.username} (ID: {opponent.player_id})")
        print(f"[CHALLENGE] Time: {time_control_minutes}+{time_increment_seconds}, Color: {preferred_color}")
        
        if opponent.player_id == request.user.player_id:
            return JsonResponse({'success': False, 'error': 'Cannot challenge yourself'}, status=400)
        
        # Determine player colors
        if preferred_color == 'white':
            white_player = request.user
            black_player = opponent
        elif preferred_color == 'black':
            white_player = opponent
            black_player = request.user
        else:  # random
            if random.choice([True, False]):
                white_player = request.user
                black_player = opponent
            else:
                white_player = opponent
                black_player = request.user
        
        # Default time settings if not provided
        if time_control_minutes is None:
            time_defaults = {
                'bullet': 1,
                'blitz': 5,
                'rapid': 10,
                'classical': 30,
                'daily': 1440  # 24 hours
            }
            time_control_minutes = time_defaults.get(time_control, 10)
        
        # Create a match
        from .models import Match
        match = Match.objects.create(
            white_player=white_player,
            black_player=black_player,
            match_status='scheduled',
            time_control=f"{time_control_minutes}+{time_increment_seconds}",
            white_elo_before=white_player.elo_rating,
            black_elo_before=black_player.elo_rating
        )
        
        # Build challenge message with time details
        time_str = f"{time_control_minutes} min"
        if time_increment_seconds:
            time_str += f" + {time_increment_seconds} sek"
        
        # Create notification for opponent
        try:
            Notification.objects.create(
                player=opponent,
                notification_type='challenge',
                title='Novi izazov!',
                message=f'{request.user.username} te je izazvao na meč! ({time_str})',
                related_match=match
            )
            print(f"[CHALLENGE] Notification created for {opponent.username}")
        except Exception as e:
            print(f"[CHALLENGE] Error creating notification: {e}")
        
        return JsonResponse({
            'success': True,
            'message': f'Izazov poslan korisniku {opponent.username} ({time_str})',
            'match_id': match.match_id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_player_titles(request, player_id=None):
    """
    GET /api/players/<player_id>/titles/
    Get all titles for a player
    """
    try:
        if player_id:
            player = get_object_or_404(Player, player_id=player_id)
        else:
            player = request.user
        
        player_titles = PlayerTitle.objects.filter(player=player).select_related('title')
        
        titles = [{
            'id': pt.title.title_id,
            'name': pt.title.title_name,
            'description': pt.title.description,
            'icon': pt.title.icon_class,
            'color': pt.title.color_code,
            'awarded_date': pt.awarded_date.isoformat() if pt.awarded_date else None,
            'is_active': player.active_title_id == pt.title.title_id if player.active_title else False
        } for pt in player_titles]
        
        return JsonResponse({'success': True, 'titles': titles})
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_set_active_title(request):
    """
    POST /api/profile/set-active-title/
    Set active/displayed title
    Body: {title_id} (null to clear)
    """
    try:
        data = json.loads(request.body)
        title_id = data.get('title_id')
        
        if title_id is None:
            request.user.active_title = None
            request.user.save()
            return JsonResponse({'success': True, 'message': 'Title cleared'})
        
        # Verify player has this title
        player_title = PlayerTitle.objects.filter(
            player=request.user,
            title_id=title_id
        ).first()
        
        if not player_title:
            return JsonResponse({'success': False, 'error': 'You do not have this title'}, status=403)
        
        title = get_object_or_404(Title, title_id=title_id)
        request.user.active_title = title
        request.user.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Active title set to {title.title_name}'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_admin_create_title(request):
    """
    POST /api/admin/titles/create/
    Create a new title (admin only)
    Body: {title_name, description, required_elo, required_wins, icon_class, color_code}
    """
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    try:
        data = json.loads(request.body)
        
        title = Title.objects.create(
            title_name=data['title_name'],
            description=data.get('description', ''),
            required_elo=data.get('required_elo', 0),
            required_wins=data.get('required_wins', 0),
            icon_class=data.get('icon_class', ''),
            color_code=data.get('color_code', '#ffffff')
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Title {title.title_name} created',
            'title_id': title.title_id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt  
def api_admin_award_title_to_player(request):
    """
    POST /api/admin/titles/award/
    Award a title to a player (admin only)
    Body: {player_id, title_id}
    """
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    try:
        data = json.loads(request.body)
        player_id = data.get('player_id')
        title_id = data.get('title_id')
        
        if not player_id or not title_id:
            return JsonResponse({'success': False, 'error': 'Player ID and Title ID required'}, status=400)
        
        player = get_object_or_404(Player, player_id=player_id)
        title = get_object_or_404(Title, title_id=title_id)
        
        # Check if already has this title
        existing = PlayerTitle.objects.filter(player=player, title=title).first()
        if existing:
            return JsonResponse({'success': False, 'error': 'Player already has this title'}, status=400)
        
        # Award title
        PlayerTitle.objects.create(
            player=player,
            title=title,
            awarded_by=request.user,
            is_unlocked=True,
            auto_unlocked=False
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Title {title.title_name} awarded to {player.username}'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_admin_all_titles(request):
    """
    GET /api/admin/titles/all/
    Get all titles (admin only)
    """
    if not (request.user.role and (request.user.role.role_name == 'admin' or request.user.role.role_name == 'Administrator')):
        return JsonResponse({'success': False, 'error': 'Admin access required'}, status=403)
    
    titles = Title.objects.all().order_by('display_order', 'required_elo')
    
    data = [{
        'id': t.title_id,
        'name': t.title_name,
        'description': t.description,
        'required_elo': t.required_elo,
        'required_wins': t.required_wins,
        'icon': t.icon_class,
        'color': t.color_code
    } for t in titles]
    
    return JsonResponse({'success': True, 'titles': data})


# NOTIFICATIONS
# ============================================

@require_GET
@token_required
def api_get_notifications(request):
    """
    GET /api/notifications/
    Get all unread notifications for current user
    """
    try:
        print(f"[NOTIFICATIONS] User {request.user.username} (ID: {request.user.player_id}) checking notifications")
        print(f"[NOTIFICATIONS] Session key: {request.session.session_key}")
        
        notifications = Notification.objects.filter(
            player=request.user,
            is_read=False
        ).order_by('-created_at')[:10]
        
        data = [{
            'id': n.notification_id,
            'type': n.notification_type,
            'message': n.message,
            'created_at': n.created_at.isoformat(),
            'related_match_id': n.related_match_id
        } for n in notifications]
        
        return JsonResponse({
            'success': True,
            'notifications': data,
            'count': len(data)
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
def api_mark_notification_read(request, notification_id):
    """
    POST /api/notifications/<notification_id>/read/
    Mark notification as read
    """
    try:
        notification = get_object_or_404(
            Notification,
            notification_id=notification_id,
            player=request.user
        )
        notification.is_read = True
        notification.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
def api_mark_all_notifications_read(request):
    """
    POST /api/notifications/read-all/
    Mark all notifications as read
    """
    try:
        Notification.objects.filter(
            player=request.user,
            is_read=False
        ).update(is_read=True)
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# HEALTH CHECK
# ============================================

@require_GET
def api_health(request):
    """GET /api/health/ - Health check with database connectivity test"""
    from django.db import connection
    
    db_status = 'ok'
    db_error = None
    
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as e:
        db_status = 'error'
        db_error = str(e)
    
    status = 'ok' if db_status == 'ok' else 'degraded'
    
    response_data = {
        'status': status,
        'service': 'COTISA API',
        'version': '2.0',
        'database': {
            'status': db_status,
        }
    }
    
    if db_error:
        response_data['database']['error'] = db_error
    
    return JsonResponse(response_data, status=200 if status == 'ok' else 503)


# FRIENDS / FRIENDSHIPS
# ============================================

from .models import Friendship

@require_GET
@token_required
def api_get_friends(request):
    """
    GET /api/friends/
    Get list of friends for current user
    """
    try:
        # Get accepted friendships where user is either sender or receiver
        friendships = Friendship.objects.filter(
            Q(from_player=request.user, status='accepted') | 
            Q(to_player=request.user, status='accepted')
        ).select_related('from_player', 'to_player')
        
        friends = []
        for f in friendships:
            friend = f.to_player if f.from_player == request.user else f.from_player
            friends.append({
                'id': friend.player_id,
                'username': friend.username,
                'full_name': friend.full_name,
                'elo_rating': friend.elo_rating,
                'profile_picture': get_player_profile_picture(friend),
                'is_provisional': friend.is_provisional,
                'friendship_since': f.updated_at.isoformat()
            })
        
        return JsonResponse({
            'success': True,
            'friends': friends,
            'count': len(friends)
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_get_friend_requests(request):
    """
    GET /api/friends/requests/
    Get pending friend requests for current user
    """
    try:
        # Get pending requests received
        received = Friendship.objects.filter(
            to_player=request.user,
            status='pending'
        ).select_related('from_player')
        
        # Get pending requests sent
        sent = Friendship.objects.filter(
            from_player=request.user,
            status='pending'
        ).select_related('to_player')
        
        received_list = [{
            'id': f.friendship_id,
            'from_player': {
                'id': f.from_player.player_id,
                'username': f.from_player.username,
                'elo_rating': f.from_player.elo_rating,
                'profile_picture': get_player_profile_picture(f.from_player)
            },
            'created_at': f.created_at.isoformat()
        } for f in received]
        
        sent_list = [{
            'id': f.friendship_id,
            'to_player': {
                'id': f.to_player.player_id,
                'username': f.to_player.username,
                'elo_rating': f.to_player.elo_rating,
                'profile_picture': get_player_profile_picture(f.to_player)
            },
            'created_at': f.created_at.isoformat()
        } for f in sent]
        
        return JsonResponse({
            'success': True,
            'received': received_list,
            'sent': sent_list
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_send_friend_request(request):
    """
    POST /api/friends/add/
    Send a friend request
    Body: {player_id}
    """
    try:
        data = json.loads(request.body)
        player_id = data.get('player_id')
        
        if not player_id:
            return JsonResponse({'success': False, 'error': 'Player ID required'}, status=400)
        
        if player_id == request.user.player_id:
            return JsonResponse({'success': False, 'error': 'Ne možete dodati sebe kao prijatelja'}, status=400)
        
        target_player = get_object_or_404(Player, player_id=player_id)
        
        # Check if friendship already exists
        existing = Friendship.objects.filter(
            Q(from_player=request.user, to_player=target_player) |
            Q(from_player=target_player, to_player=request.user)
        ).first()
        
        if existing:
            if existing.status == 'accepted':
                return JsonResponse({'success': False, 'error': 'Već ste prijatelji'}, status=400)
            elif existing.status == 'pending':
                # If target already sent request to us, accept it
                if existing.from_player == target_player:
                    existing.status = 'accepted'
                    existing.save()
                    return JsonResponse({'success': True, 'message': 'Zahtjev za prijateljstvo prihvaćen!'})
                else:
                    return JsonResponse({'success': False, 'error': 'Zahtjev već poslan'}, status=400)
            elif existing.status == 'declined':
                # Can resend after decline
                existing.status = 'pending'
                existing.from_player = request.user
                existing.to_player = target_player
                existing.save()
                return JsonResponse({'success': True, 'message': 'Zahtjev za prijateljstvo poslan!'})
            elif existing.status == 'blocked':
                return JsonResponse({'success': False, 'error': 'Ne možete dodati ovog igrača'}, status=400)
        
        # Create new friendship request
        Friendship.objects.create(
            from_player=request.user,
            to_player=target_player,
            status='pending'
        )
        
        # Create notification for target player
        Notification.objects.create(
            player=target_player,
            notification_type='system',
            title='Novi zahtjev za prijateljstvo',
            message=f'{request.user.username} vam je poslao zahtjev za prijateljstvo!'
        )
        
        return JsonResponse({'success': True, 'message': 'Zahtjev za prijateljstvo poslan!'})
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_respond_friend_request(request, friendship_id):
    """
    POST /api/friends/<friendship_id>/respond/
    Accept or decline a friend request
    Body: {action: 'accept' | 'decline'}
    """
    try:
        data = json.loads(request.body)
        action = data.get('action')
        
        if action not in ['accept', 'decline']:
            return JsonResponse({'success': False, 'error': 'Invalid action'}, status=400)
        
        friendship = get_object_or_404(
            Friendship,
            friendship_id=friendship_id,
            to_player=request.user,
            status='pending'
        )
        
        if action == 'accept':
            friendship.status = 'accepted'
            friendship.save()
            
            # Notify the sender
            Notification.objects.create(
                player=friendship.from_player,
                notification_type='system',
                title='Zahtjev prihvaćen',
                message=f'{request.user.username} je prihvatio vaš zahtjev za prijateljstvo!'
            )
            
            return JsonResponse({'success': True, 'message': 'Prijateljstvo prihvaćeno!'})
        else:
            friendship.status = 'declined'
            friendship.save()
            return JsonResponse({'success': True, 'message': 'Zahtjev odbijen'})
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_remove_friend(request, player_id):
    """
    POST /api/friends/<player_id>/remove/
    Remove a friend
    """
    try:
        friendship = Friendship.objects.filter(
            Q(from_player=request.user, to_player_id=player_id, status='accepted') |
            Q(from_player_id=player_id, to_player=request.user, status='accepted')
        ).first()
        
        if not friendship:
            return JsonResponse({'success': False, 'error': 'Prijateljstvo ne postoji'}, status=404)
        
        friendship.delete()
        
        return JsonResponse({'success': True, 'message': 'Prijatelj uklonjen'})
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@require_GET
@token_required
def api_check_friendship(request, player_id):
    """
    GET /api/friends/check/<player_id>/
    Check friendship status with a player
    """
    try:
        friendship = Friendship.objects.filter(
            Q(from_player=request.user, to_player_id=player_id) |
            Q(from_player_id=player_id, to_player=request.user)
        ).first()
        
        if not friendship:
            return JsonResponse({
                'success': True,
                'status': 'none',
                'friendship_id': None
            })
        
        # Determine if we sent or received the request
        is_sender = friendship.from_player == request.user
        
        return JsonResponse({
            'success': True,
            'status': friendship.status,
            'friendship_id': friendship.friendship_id,
            'is_sender': is_sender
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# PASSWORD RESET API
# ============================================

@require_POST
@csrf_exempt
def api_request_password_reset(request):
    """
    POST /api/password-reset/request/
    Request a password reset email.
    Body: {email}
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        
        if not email:
            return JsonResponse({'error': 'Email je obavezan'}, status=400)
        
        # Always return success to prevent email enumeration
        try:
            player = Player.objects.get(email__iexact=email, is_active=True)
            
            # Generate token using Django's built-in token generator
            token = default_token_generator.make_token(player)
            uid = urlsafe_base64_encode(force_bytes(player.pk))
            
            # Combine uid and token for the reset link (use - separator, not : to avoid URL issues)
            reset_token = f"{uid}-{token}"
            
            # Send the email
            from .email_service import send_password_reset_email
            send_password_reset_email(player, reset_token)
            
        except Player.DoesNotExist:
            # Don't reveal that the email doesn't exist
            pass
        
        return JsonResponse({
            'success': True,
            'message': 'Ako račun s tom email adresom postoji, link za resetiranje lozinke je poslan.'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@csrf_exempt
def api_reset_password(request):
    """
    POST /api/password-reset/confirm/
    Reset password using token from email.
    Body: {token, password, password_confirm}
    """
    try:
        data = json.loads(request.body)
        reset_token = data.get('token', '')
        password = data.get('password', '')
        password_confirm = data.get('password_confirm', '')
        
        if not reset_token or not password or not password_confirm:
            return JsonResponse({'error': 'Sva polja su obavezna'}, status=400)
        
        if password != password_confirm:
            return JsonResponse({'error': 'Lozinke se ne podudaraju'}, status=400)
        
        if len(password) < 6:
            return JsonResponse({'error': 'Lozinka mora imati najmanje 6 znakova'}, status=400)
        
        # Parse the token (supports both - and : separators for backwards compatibility)
        try:
            if '-' in reset_token:
                uid_str, token = reset_token.split('-', 1)
            else:
                uid_str, token = reset_token.split(':', 1)
            uid = force_str(urlsafe_base64_decode(uid_str))
            player = Player.objects.get(pk=uid)
        except (ValueError, Player.DoesNotExist, Exception):
            return JsonResponse({'error': 'Nevažeći ili istekli link za resetiranje'}, status=400)
        
        # Verify the token
        if not default_token_generator.check_token(player, token):
            return JsonResponse({'error': 'Link za resetiranje je istekao. Zatražite novi.'}, status=400)
        
        # Set new password
        player.set_password(password)
        player.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Lozinka je uspješno promijenjena! Sada se možete prijaviti s novom lozinkom.'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@csrf_exempt
def api_change_password(request):
    """
    POST /api/change-password/
    Change password for authenticated user.
    Body: {current_password, new_password, new_password_confirm}
    Requires: X-Auth-Token header
    """
    # Get token from header
    auth_token = request.headers.get('X-Auth-Token')
    if not auth_token:
        return JsonResponse({'error': 'Autentifikacija je obavezna'}, status=401)
    
    try:
        player = Player.objects.get(auth_token=auth_token, is_active=True)
    except Player.DoesNotExist:
        return JsonResponse({'error': 'Nevažeći token'}, status=401)
    
    try:
        data = json.loads(request.body)
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        new_password_confirm = data.get('new_password_confirm', '')
        
        if not current_password or not new_password or not new_password_confirm:
            return JsonResponse({'error': 'Sva polja su obavezna'}, status=400)
        
        # Verify current password
        if not player.check_password(current_password):
            return JsonResponse({'error': 'Trenutna lozinka nije ispravna'}, status=400)
        
        if new_password != new_password_confirm:
            return JsonResponse({'error': 'Nove lozinke se ne podudaraju'}, status=400)
        
        if len(new_password) < 6:
            return JsonResponse({'error': 'Nova lozinka mora imati najmanje 6 znakova'}, status=400)
        
        if current_password == new_password:
            return JsonResponse({'error': 'Nova lozinka mora biti različita od trenutne'}, status=400)
        
        # Set new password
        player.set_password(new_password)
        player.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Lozinka je uspješno promijenjena!'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
