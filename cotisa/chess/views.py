"""
Views for COTISA
Serves existing HTML templates with Django authentication
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.contrib import messages
from django.utils import timezone
import json

from .models import (
    Player, TournamentActive, Match, Notification,
    TournamentRegistration, PlayerTitle, Title, Achievement
)
from .helpers import admin_required, gateway_required


def prelogin_view(request):
    """Admin gateway - only admins can access the site"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Check if user has admin panel access
            if user.role.can_access_admin_panel:
                # Store admin session flag
                request.session['admin_gateway_passed'] = True
                login(request, user)
                return redirect('welcome')
            else:
                return render(request, 'prelogin.html', {
                    'error': True, 
                    'error_message': 'Pristup dozvoljen samo administratorima!'
                })
        else:
            return render(request, 'prelogin.html', {
                'error': True,
                'error_message': 'Neispravno korisničko ime ili lozinka!'
            })
    
    return render(request, 'prelogin.html')


def welcome_view(request):
    """Welcome page after admin gateway - shows login/register options"""
    # Check if admin gateway was passed
    if not request.session.get('admin_gateway_passed'):
        return redirect('prelogin')
    
    # If already logged in as regular user, go to index
    if request.user.is_authenticated:
        return redirect('index')
    
    return render(request, 'welcome.html')


def user_login_view(request):
    """Regular user login"""
    # Check if admin gateway was passed
    if not request.session.get('admin_gateway_passed'):
        return redirect('prelogin')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            return render(request, 'login.html', {
                'error': True,
                'error_message': 'Neispravno korisničko ime ili lozinka!'
            })
    
    return render(request, 'login.html')


def register_view(request):
    """User registration"""
    # Check if admin gateway was passed
    if not request.session.get('admin_gateway_passed'):
        return redirect('prelogin')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        full_name = request.POST.get('full_name', '')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        
        # Validation
        if password != password2:
            return render(request, 'register.html', {
                'error': True,
                'error_message': 'Lozinke se ne podudaraju!'
            })
        
        if Player.objects.filter(username=username).exists():
            return render(request, 'register.html', {
                'error': True,
                'error_message': 'Korisničko ime već postoji!'
            })
        
        if Player.objects.filter(email=email).exists():
            return render(request, 'register.html', {
                'error': True,
                'error_message': 'Email adresa već postoji!'
            })
        
        # Create user
        user = Player.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        if full_name:
            user.full_name = full_name
            user.save()
        
        messages.success(request, 'Registracija uspješna! Možete se prijaviti.')
        return redirect('user_login')
    
    return render(request, 'register.html')


def logout_view(request):
    """Handle user logout"""
    logout(request)
    return redirect('prelogin')


@login_required
def index_view(request):
    """Main dashboard after login"""
    context = {
        'player': request.user,
        'tournaments': TournamentActive.objects.filter(tournament_status__in=['upcoming', 'in_progress'])[:5],
        'recent_matches': Match.objects.filter(match_status='completed').order_by('-match_date')[:5],
        'notifications': Notification.objects.filter(player=request.user, is_read=False)[:5],
    }
    return render(request, 'index.html', context)


@login_required
def profile_view(request):
    """User profile page"""
    player = request.user
    titles = PlayerTitle.objects.filter(player=player, is_unlocked=True).select_related('title')
    matches = Match.objects.filter(
        white_player=player
    ) | Match.objects.filter(
        black_player=player
    )
    matches = matches.order_by('-match_date')[:10]
    
    context = {
        'player': player,
        'titles': titles,
        'recent_matches': matches,
    }
    return render(request, 'profile.html', context)


@login_required
def tournaments_view(request):
    """Join tournament page"""
    tournaments = TournamentActive.objects.filter(
        tournament_status__in=['upcoming', 'in_progress']
    ).order_by('start_date')
    
    # Check which tournaments user has already registered for
    user_registrations = TournamentRegistration.objects.filter(
        player=request.user
    ).values_list('tournament_id', flat=True)
    
    context = {
        'tournaments': tournaments,
        'user_registrations': list(user_registrations),
    }
    return render(request, 'join-tournament.html', context)


@login_required
def create_tournament_view(request):
    """Create new tournament page"""
    return render(request, 'create-tournament.html')


@login_required
@admin_required
def manage_tournaments_view(request):
    """Manage tournaments (admin only)"""
    tournaments = TournamentActive.objects.all().order_by('-created_at')
    context = {
        'tournaments': tournaments,
    }
    return render(request, 'manage-tournaments.html', context)


@login_required
def history_view(request):
    """Match history page"""
    matches = Match.objects.filter(
        white_player=request.user
    ) | Match.objects.filter(
        black_player=request.user
    )
    matches = matches.filter(match_status='completed').order_by('-match_date')
    
    context = {
        'matches': matches,
    }
    return render(request, 'history.html', context)


@login_required
def player_database_view(request):
    """Player database/leaderboard"""
    players = Player.objects.filter(is_active=True).order_by('-elo_rating')[:100]
    context = {
        'players': players,
    }
    return render(request, 'player_database.html', context)


def about_view(request):
    """About page"""
    return render(request, 'about.html')


def help_view(request):
    """Help page"""
    return render(request, 'help.html')


# API endpoints for AJAX requests
@login_required
@require_POST
@csrf_protect
def api_register_tournament(request, tournament_id):
    """API endpoint to register for tournament"""
    tournament = get_object_or_404(TournamentActive, tournament_id=tournament_id)
    
    # Check if already registered
    existing = TournamentRegistration.objects.filter(
        tournament=tournament,
        player=request.user
    ).first()
    
    if existing:
        return JsonResponse({'error': 'Već ste registrovani za ovaj turnir'}, status=400)
    
    # Create registration
    TournamentRegistration.objects.create(
        tournament=tournament,
        player=request.user,
        player_rating_at_registration=request.user.elo_rating,
        terms_accepted=True,
        status='pending'
    )
    
    return JsonResponse({'success': True, 'message': 'Uspješno ste se prijavili za turnir'})


@login_required
def api_notifications(request):
    """API endpoint to get user notifications"""
    notifications = Notification.objects.filter(
        player=request.user
    ).order_by('-created_at')[:20]
    
    data = [{
        'id': n.notification_id,
        'type': n.type,
        'title': n.title,
        'message': n.message,
        'is_read': n.is_read,
        'created_at': n.created_at.isoformat(),
    } for n in notifications]
    
    return JsonResponse({'notifications': data})


@login_required
@require_POST
@csrf_protect
def api_mark_notification_read(request, notification_id):
    """API endpoint to mark notification as read"""
    notification = get_object_or_404(Notification, 
                                      notification_id=notification_id,
                                      player=request.user)
    notification.is_read = True
    notification.read_at = timezone.now()
    notification.save()
    
    return JsonResponse({'success': True})
