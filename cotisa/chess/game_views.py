"""
Game API views - Chess game endpoints
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import models
from functools import wraps
from .models import Game, Player, TournamentActive, Match
from . import elo_rating
import json
import logging

logger = logging.getLogger(__name__)


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


# Token-based authentication decorator (same as in api_views)
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


@require_http_methods(["GET"])
@token_required
@csrf_exempt
def api_game_detail(request, game_id):
    """
    GET /api/game/<game_id>/
    Get game details
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player', 'tournament').get(game_id=game_id)
        
        # Provjeri je li korisnik igrač u ovoj igri
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Potrebna autentifikacija'}, status=401)
        
        if request.user.player_id != game.white_player.player_id and request.user.player_id != game.black_player.player_id:
            return JsonResponse({'error': 'Nisi igrač u ovoj igri'}, status=403)
        
        # Izračunaj trenutno vrijeme ako je igra u tijeku
        white_time = game.white_time_remaining
        black_time = game.black_time_remaining
        
        if game.status == 'in_progress' and game.time_control_minutes and game.last_move_time:
            time_elapsed = int((timezone.now() - game.last_move_time).total_seconds())
            
            # Oduzmi vrijeme od igrača koji je trenutno na redu
            if game.current_turn == 'white':
                white_time = max(0, white_time - time_elapsed)
            else:
                black_time = max(0, black_time - time_elapsed)
        
        # Get tournament type if this is a tournament game
        tournament_type = None
        if game.tournament:
            tournament_type = game.tournament.tournament_type
        
        return JsonResponse({
            'game_id': game.game_id,
            'tournament_id': game.tournament.tournament_id if game.tournament else None,
            'tournament_name': game.tournament.tournament_name if game.tournament else None,
            'tournament_type': tournament_type,
            'white_player': {
                'id': game.white_player.player_id,
                'username': game.white_player.username,
                'elo_rating': game.white_player.elo_rating,
                'profile_picture': get_player_profile_picture(game.white_player),
            },
            'black_player': {
                'id': game.black_player.player_id,
                'username': game.black_player.username,
                'elo_rating': game.black_player.elo_rating,
                'profile_picture': get_player_profile_picture(game.black_player),
            },
            'status': game.status,
            'result': game.result,
            'fen': game.fen,
            'pgn': game.pgn,
            'current_turn': game.current_turn,
            'move_count': game.move_count,
            'move_history': game.move_history,
            'time_control_minutes': game.time_control_minutes,
            'time_increment_seconds': game.time_increment_seconds,
            'white_time_remaining': white_time,
            'black_time_remaining': black_time,
            'white_joined': game.white_joined,
            'black_joined': game.black_joined,
            'white_offers_draw': game.white_offers_draw,
            'black_offers_draw': game.black_offers_draw,
            'started_at': game.started_at.isoformat() if game.started_at else None,
            'completed_at': game.completed_at.isoformat() if game.completed_at else None,
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error fetching game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
@token_required
@csrf_exempt
def api_game_spectate(request, game_id):
    """
    GET /api/game/<game_id>/spectate/
    Get game details as a spectator (read-only view)
    Anyone can spectate games in tournaments they're part of
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player', 'tournament').get(game_id=game_id)
        
        # If it's a tournament game, check if user is a tournament participant
        if game.tournament:
            from .models import TournamentParticipant
            is_participant = TournamentParticipant.objects.filter(
                tournament=game.tournament,
                player=request.user
            ).exists()
            
            is_creator = game.tournament.created_by == request.user
            
            if not is_participant and not is_creator:
                return JsonResponse({'error': 'Nisi sudionik ovog turnira'}, status=403)
        else:
            # Non-tournament games - for now only players can view
            if request.user.player_id != game.white_player.player_id and request.user.player_id != game.black_player.player_id:
                return JsonResponse({'error': 'Možeš promatrati samo turnirske igre u kojima sudjeluješ'}, status=403)
        
        # Calculate current time if game is in progress
        white_time = game.white_time_remaining
        black_time = game.black_time_remaining
        
        if game.status == 'in_progress' and game.time_control_minutes and game.last_move_time:
            time_elapsed = int((timezone.now() - game.last_move_time).total_seconds())
            
            if game.current_turn == 'white':
                white_time = max(0, white_time - time_elapsed)
            else:
                black_time = max(0, black_time - time_elapsed)
        
        return JsonResponse({
            'game_id': game.game_id,
            'tournament_id': game.tournament.tournament_id if game.tournament else None,
            'tournament_name': game.tournament.tournament_name if game.tournament else None,
            'white_player': {
                'id': game.white_player.player_id,
                'username': game.white_player.username,
                'elo_rating': game.white_player.elo_rating,
                'profile_picture': get_player_profile_picture(game.white_player),
            },
            'black_player': {
                'id': game.black_player.player_id,
                'username': game.black_player.username,
                'elo_rating': game.black_player.elo_rating,
                'profile_picture': get_player_profile_picture(game.black_player),
            },
            'status': game.status,
            'result': game.result,
            'fen': game.fen,
            'pgn': game.pgn,
            'current_turn': game.current_turn,
            'move_count': game.move_count,
            'move_history': game.move_history,
            'time_control_minutes': game.time_control_minutes,
            'time_increment_seconds': game.time_increment_seconds,
            'white_time_remaining': white_time,
            'black_time_remaining': black_time,
            'is_spectator': True,  # Important flag for frontend
            'started_at': game.started_at.isoformat() if game.started_at else None,
            'completed_at': game.completed_at.isoformat() if game.completed_at else None,
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error fetching spectator view for game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
@token_required
@csrf_exempt
def api_tournament_ongoing_games(request, tournament_id):
    """
    GET /api/tournaments/<tournament_id>/games/
    Get all ongoing games in a tournament (for spectating)
    """
    try:
        tournament = TournamentActive.objects.get(tournament_id=tournament_id)
        
        # Check if user is a participant or creator
        from .models import TournamentParticipant
        is_participant = TournamentParticipant.objects.filter(
            tournament=tournament,
            player=request.user
        ).exists()
        
        is_creator = tournament.created_by == request.user
        
        if not is_participant and not is_creator:
            return JsonResponse({'error': 'Nisi sudionik ovog turnira'}, status=403)
        
        # Get ongoing and recently completed games
        games = Game.objects.filter(
            tournament=tournament
        ).select_related('white_player', 'black_player').order_by('-created_at')
        
        # Get matches with games
        matches = Match.objects.filter(tournament=tournament).select_related(
            'white_player', 'black_player', 'winner'
        ).order_by('round_number', 'match_id')
        
        # Check if current user has a bye or is idle
        user_has_active_game = Game.objects.filter(
            tournament=tournament,
            status='in_progress'
        ).filter(
            models.Q(white_player=request.user) | models.Q(black_player=request.user)
        ).exists()
        
        # Find user's current match status
        user_current_round = None
        for match in matches:
            if match.match_status != 'completed' and (
                (match.white_player and match.white_player.player_id == request.user.player_id) or
                (match.black_player and match.black_player.player_id == request.user.player_id)
            ):
                user_current_round = match.round_number
                break
        
        games_data = []
        for game in games:
            # Calculate current time
            white_time = game.white_time_remaining
            black_time = game.black_time_remaining
            
            if game.status == 'in_progress' and game.time_control_minutes and game.last_move_time:
                time_elapsed = int((timezone.now() - game.last_move_time).total_seconds())
                if game.current_turn == 'white':
                    white_time = max(0, white_time - time_elapsed)
                else:
                    black_time = max(0, black_time - time_elapsed)
            
            games_data.append({
                'game_id': game.game_id,
                'white_player': {
                    'id': game.white_player.player_id,
                    'username': game.white_player.username,
                    'elo_rating': game.white_player.elo_rating,
                },
                'black_player': {
                    'id': game.black_player.player_id,
                    'username': game.black_player.username,
                    'elo_rating': game.black_player.elo_rating,
                },
                'status': game.status,
                'result': game.result,
                'fen': game.fen,
                'current_turn': game.current_turn,
                'move_count': game.move_count,
                'white_time_remaining': white_time,
                'black_time_remaining': black_time,
            })
        
        return JsonResponse({
            'success': True,
            'tournament_id': tournament_id,
            'tournament_name': tournament.tournament_name,
            'can_spectate': not user_has_active_game,
            'user_is_playing': user_has_active_game,
            'games': games_data
        })
        
    except TournamentActive.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error fetching tournament games: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_game_move(request, game_id):
    """
    POST /api/game/<game_id>/move/
    Make a move in the game
    Body: {from, to, promotion, san, fen}
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player').get(game_id=game_id)
        
        # Provjeri je li igra u tijeku
        if game.status == 'waiting':
            return JsonResponse({'error': 'Igra još nije započela. Čeka se drugi igrač.'}, status=400)
        
        if game.status != 'in_progress':
            return JsonResponse({'error': 'Igra nije u tijeku'}, status=400)
        
        # Provjeri je li red trenutnog igrača
        if game.current_turn == 'white' and request.user.player_id != game.white_player.player_id:
            return JsonResponse({'error': 'Nije tvoj red'}, status=403)
        if game.current_turn == 'black' and request.user.player_id != game.black_player.player_id:
            return JsonResponse({'error': 'Nije tvoj red'}, status=403)
        
        data = json.loads(request.body)
        
        # Save who just moved BEFORE changing turn
        player_who_moved = game.current_turn  # 'white' or 'black'
        
        # Update game state
        game.fen = data['fen']
        game.current_turn = 'black' if game.current_turn == 'white' else 'white'
        game.move_count += 1
        
        # Add move to history
        move_history = json.loads(game.move_history) if game.move_history else []
        move_history.append({
            'from': data['from'],
            'to': data['to'],
            'san': data['san'],
            'promotion': data.get('promotion'),
            'timestamp': timezone.now().isoformat()
        })
        game.move_history = json.dumps(move_history)
        
        # Update time - deduct from the player who just moved and add increment
        if game.time_control_minutes:
            time_elapsed = 0
            if game.last_move_time:
                time_elapsed = int((timezone.now() - game.last_move_time).total_seconds())
            
            if player_who_moved == 'white':  # White just moved
                game.white_time_remaining = max(0, game.white_time_remaining - time_elapsed + game.time_increment_seconds)
            else:  # Black just moved
                game.black_time_remaining = max(0, game.black_time_remaining - time_elapsed + game.time_increment_seconds)
            
            game.last_move_time = timezone.now()
        
        game.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Potez zabilježen',
            'fen': game.fen,
            'current_turn': game.current_turn,
            'move_count': game.move_count,
            'white_time_remaining': game.white_time_remaining,
            'black_time_remaining': game.black_time_remaining
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error making move in game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_game_resign(request, game_id):
    """
    POST /api/game/<game_id>/resign/
    Resign from the game
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player').get(game_id=game_id)
        
        # Odredi rezultat
        if request.user.player_id == game.white_player.player_id:
            game.result = 'black_win'
        elif request.user.player_id == game.black_player.player_id:
            game.result = 'white_win'
        else:
            return JsonResponse({'error': 'Nisi igrač u ovoj igri'}, status=403)
        
        game.status = 'completed'
        game.completed_at = timezone.now()
        game.save()
        
        # Update match result if this is a tournament game
        if game.match:
            match = game.match
            match.match_status = 'completed'
            if game.result == 'white_win':
                match.winner = game.white_player
                match.loser = game.black_player
                match.result = 'white_win'
            elif game.result == 'black_win':
                match.winner = game.black_player
                match.loser = game.white_player
                match.result = 'black_win'
            match.is_draw = False
            match.is_played = True
            match.played_at = timezone.now()
            match.match_date = timezone.now()
            match.save()
            
            # Check round completion and possibly advance to next round
            tournament = match.tournament
            if tournament:
                tournament.refresh_from_db()
                
                if tournament.tournament_status == 'in_progress':
                    from .tournament_helpers import check_round_complete_and_advance
                    
                    round_status = check_round_complete_and_advance(tournament, match)
                    logger.info(f"Tournament {tournament.tournament_id} round check (resign): {round_status.get('message', 'N/A')}")
        
        # Update ELO ratings for resignation
        try:
            logger.info(f"[RESIGN] Updating ELO for game {game_id}, result: {game.result}")
            # Determine time control (default to 'blitz' for now)
            time_control = 'blitz'
            if game.time_control_minutes:
                if game.time_control_minutes <= 3:
                    time_control = 'bullet'
                elif game.time_control_minutes <= 10:
                    time_control = 'blitz'
                else:
                    time_control = 'rapid'
            
            # Update ratings based on result
            if game.result == 'white_win':
                elo_rating.update_player_ratings(
                    winner=game.white_player,
                    loser=game.black_player,
                    is_draw=False,
                    time_control_type=time_control
                )
            elif game.result == 'black_win':
                elo_rating.update_player_ratings(
                    winner=game.black_player,
                    loser=game.white_player,
                    is_draw=False,
                    time_control_type=time_control
                )
            
            # Record ELO after match
            if game.match:
                game.match.white_elo_after = game.white_player.elo_rating
                game.match.black_elo_after = game.black_player.elo_rating
                white_before = game.match.white_elo_before or game.white_player.elo_rating
                game.match.elo_change = abs(game.white_player.elo_rating - white_before)
                game.match.save()
                
        except Exception as e:
            logger.error(f"Error updating ELO ratings on resignation: {str(e)}", exc_info=True)
            # Don't fail the whole request if ELO update fails
        
        return JsonResponse({
            'success': True,
            'message': 'Igra predana',
            'result': game.result
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error resigning game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_game_end(request, game_id):
    """
    POST /api/game/<game_id>/end/
    End the game with result
    Body: {result, pgn}
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player', 'match').get(game_id=game_id)
        
        data = json.loads(request.body)
        
        game.result = data['result']
        game.pgn = data.get('pgn', '')
        game.status = 'completed'
        game.completed_at = timezone.now()
        game.save()
        
        # Update match result if this is a tournament game
        if game.match:
            match = game.match
            logger.info(f"[END_GAME] Match {match.match_id} prije update: status={match.match_status}")
            
            # Check if this is elimination tournament and result is draw/stalemate
            is_elimination = match.tournament and match.tournament.tournament_type == 'elimination'
            is_draw_result = game.result in ['draw', 'stalemate']
            
            if is_elimination and is_draw_result:
                # In elimination, draws are not allowed - replay the match
                logger.info(f"[END_GAME] ELIMINATION + DRAW/STALEMATE detected! Match {match.match_id} will be replayed")
                
                # Mark this game as completed but don't update match status
                # Reset match to allow replay
                match.match_status = 'scheduled'  # Reset to scheduled for replay
                match.save()
                
                logger.info(f"[END_GAME] Match {match.match_id} reset to 'scheduled' for replay due to stalemate in elimination")
                
                # Don't update ELO for stalemate in elimination
                return JsonResponse({
                    'success': True,
                    'message': 'Pat u eliminacijskom turniru - meč će se ponoviti',
                    'replay_required': True
                })
            
            # Normal match completion logic
            match.match_status = 'completed'
            match.is_played = True
            match.played_at = timezone.now()
            match.pgn_notation = game.pgn
            match.number_of_moves = game.move_count
            
            # Record ELO before match
            match.white_elo_before = game.white_player.elo_rating
            match.black_elo_before = game.black_player.elo_rating
            
            if game.result == 'white_win' or game.result == 'resignation' and game.current_turn == 'black':
                match.winner = game.white_player
                match.loser = game.black_player
                match.result = 'white_win'
                match.is_draw = False
            elif game.result == 'black_win' or game.result == 'resignation' and game.current_turn == 'white':
                match.winner = game.black_player
                match.loser = game.white_player
                match.result = 'black_win'
                match.is_draw = False
            else:  # draw, stalemate, etc.
                match.result = 'draw'
                match.winner = None
                match.is_draw = True
            
            match.match_date = timezone.now()
            match.save()
            
            logger.info(f"[END_GAME] Match {match.match_id} poslije save: status={match.match_status}, winner={match.winner}, result={match.result}")
            
            # Check round completion and possibly advance to next round
            tournament = match.tournament
            if tournament:
                # Refresh tournament to get latest data
                tournament.refresh_from_db()
                
                logger.info(f"[END_GAME] Tournament {tournament.tournament_id} status: {tournament.tournament_status}, current_round: {tournament.current_round}")
                
                if tournament.tournament_status == 'in_progress':
                    from .tournament_helpers import check_round_complete_and_advance
                    
                    round_status = check_round_complete_and_advance(tournament, match)
                    logger.info(f"[END_GAME] Tournament {tournament.tournament_id} round check result: {round_status}")
                    
                    if round_status.get('tournament_complete'):
                        logger.info(f"Tournament {tournament.tournament_id} ({tournament.tournament_name}) marked as completed")
                    elif round_status.get('next_round'):
                        logger.info(f"Tournament {tournament.tournament_id} advanced to round {round_status['next_round']}")
                else:
                    logger.warning(f"[END_GAME] Tournament {tournament.tournament_id} status is {tournament.tournament_status}, NOT checking rounds")
        
        # Update ELO ratings (this also updates wins/losses/draws/matches_played)
        try:
            logger.info(f"[END_GAME] Updating ELO for game {game_id}, result: {game.result}")
            # Determine time control (default to 'blitz' for now)
            time_control = 'blitz'
            if game.time_control_minutes:
                if game.time_control_minutes <= 3:
                    time_control = 'bullet'
                elif game.time_control_minutes <= 10:
                    time_control = 'blitz'
                else:
                    time_control = 'rapid'
            
            # Update ratings based on result
            if game.result == 'white_win':
                elo_rating.update_player_ratings(
                    winner=game.white_player,
                    loser=game.black_player,
                    is_draw=False,
                    time_control_type=time_control
                )
            elif game.result == 'black_win':
                elo_rating.update_player_ratings(
                    winner=game.black_player,
                    loser=game.white_player,
                    is_draw=False,
                    time_control_type=time_control
                )
            elif game.result in ['draw', 'stalemate']:
                elo_rating.update_player_ratings(
                    winner=game.white_player,
                    loser=game.black_player,
                    is_draw=True,
                    time_control_type=time_control
                )
            
            # Record ELO after match
            if game.match:
                game.match.white_elo_after = game.white_player.elo_rating
                game.match.black_elo_after = game.black_player.elo_rating
                game.match.elo_change = abs(game.white_player.elo_rating - (game.match.white_elo_before or game.white_player.elo_rating))
                game.match.save()
                
        except Exception as e:
            logger.error(f"Error updating ELO ratings: {str(e)}")
            # Don't fail the whole request if ELO update fails
        
        return JsonResponse({
            'success': True,
            'message': 'Igra završena',
            'result': game.result
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error ending game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_game_draw_offer(request, game_id):
    """
    POST /api/game/<game_id>/draw-offer/
    Offer or accept a draw
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player', 'match').get(game_id=game_id)
        
        # Verify game is in progress
        if game.status != 'in_progress':
            return JsonResponse({'error': 'Game is not in progress'}, status=400)
        
        # Determine which player is making the offer
        is_white = request.user.player_id == game.white_player.player_id
        is_black = request.user.player_id == game.black_player.player_id
        
        if not is_white and not is_black:
            return JsonResponse({'error': 'You are not a player in this game'}, status=403)
        
        # Check if opponent already offered draw - if so, accept it
        opponent_offers_draw = game.black_offers_draw if is_white else game.white_offers_draw
        
        if opponent_offers_draw:
            # Both players agree - end the game as draw
            game.white_offers_draw = True
            game.black_offers_draw = True
            game.result = 'draw'
            game.status = 'completed'
            game.completed_at = timezone.now()
            game.save()
            
            # Update match if tournament game
            if game.match:
                game.match.match_status = 'completed'
                game.match.result = 'draw'
                game.match.winner = None
                game.match.match_date = timezone.now()
                game.match.save()
                
                # Check round completion
                tournament = game.match.tournament
                if tournament:
                    tournament.refresh_from_db()
                    if tournament.tournament_status == 'in_progress':
                        from .tournament_helpers import check_round_complete_and_advance
                        round_status = check_round_complete_and_advance(tournament, game.match)
                        logger.info(f"Tournament {tournament.tournament_id} round check (draw): {round_status.get('message', 'N/A')}")
            
            # Update ELO for draw
            try:
                time_control = 'blitz'
                if game.time_control_minutes:
                    if game.time_control_minutes <= 3:
                        time_control = 'bullet'
                    elif game.time_control_minutes <= 10:
                        time_control = 'blitz'
                    else:
                        time_control = 'rapid'
                
                elo_rating.update_player_ratings(
                    winner=game.white_player,
                    loser=game.black_player,
                    is_draw=True,
                    time_control_type=time_control
                )
            except Exception as e:
                logger.error(f"Error updating ELO for draw: {str(e)}")
            
            return JsonResponse({
                'success': True,
                'draw_accepted': True,
                'message': 'Remi prihvaćen! Igra završena.'
            })
        
        # Set the draw offer flag
        if is_white:
            game.white_offers_draw = True
        else:
            game.black_offers_draw = True
        
        game.save()
        
        # Create notification for opponent about draw offer
        from .models import Notification
        opponent = game.black_player if is_white else game.white_player
        try:
            Notification.objects.create(
                player=opponent,
                notification_type='draw_offer',
                title='🤝 Ponuda remija',
                message=f'{request.user.username} nudi remi u igri!'
            )
            logger.info(f"Created draw offer notification for {opponent.username}")
        except Exception as e:
            logger.error(f"Error creating draw notification: {e}")
        
        return JsonResponse({
            'success': True,
            'draw_accepted': False,
            'message': 'Ponuda remija poslana. Čekam odgovor protivnika.',
            'white_offers_draw': game.white_offers_draw,
            'black_offers_draw': game.black_offers_draw
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error offering draw in game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_create_game(request):
    """
    POST /api/game/create/
    Create a new game for a match
    Body: {match_id, tournament_id}
    """
    try:
        data = json.loads(request.body)
        match_id = data.get('match_id')
        tournament_id = data.get('tournament_id')
        
        if not match_id:
            return JsonResponse({'error': 'Match ID required'}, status=400)
        
        match = Match.objects.select_related('white_player', 'black_player', 'tournament').get(match_id=match_id)
        tournament = match.tournament
        
        # Verify user is a participant in this match
        if request.user.player_id != match.white_player.player_id and request.user.player_id != match.black_player.player_id:
            return JsonResponse({'error': 'You are not a participant in this match'}, status=403)
        
        # Check if game already exists for this match
        existing_game = Game.objects.filter(match=match).first()
        if existing_game:
            # Mark current player as joined
            player_joined = False
            if request.user.player_id == match.white_player.player_id and not existing_game.white_joined:
                existing_game.white_joined = True
                player_joined = True
            elif request.user.player_id == match.black_player.player_id and not existing_game.black_joined:
                existing_game.black_joined = True
                player_joined = True
            
            if player_joined:
                # Check if both players joined - if so, start the game
                if existing_game.white_joined and existing_game.black_joined and existing_game.status == 'waiting':
                    existing_game.status = 'in_progress'
                    existing_game.started_at = timezone.now()
                    logger.info(f"[GAME_START] Game {existing_game.game_id} started - both players joined")
                existing_game.save()
            
            # Update match status if needed
            if match.match_status != 'in_progress':
                match.match_status = 'in_progress'
                match.save()
            
            return JsonResponse({
                'success': True,
                'game_id': existing_game.game_id,
                'message': 'Igra već postoji'
            })
        
        # Get time control from tournament or match
        time_control_minutes = 10  # default 10 minutes
        time_increment_seconds = 0
        
        # First try to get from match (for direct challenges)
        if match.time_control:
            try:
                parts = str(match.time_control).split('+')
                time_control_minutes = int(parts[0])
                if len(parts) > 1:
                    time_increment_seconds = int(parts[1])
            except:
                pass
        
        # Override with tournament settings if available
        if tournament:
            # Try to get time control from tournament
            if hasattr(tournament, 'time_control_minutes') and tournament.time_control_minutes:
                time_control_minutes = tournament.time_control_minutes
            if hasattr(tournament, 'time_increment_seconds') and tournament.time_increment_seconds:
                time_increment_seconds = tournament.time_increment_seconds
        
        # Create new game - starts in 'waiting' status
        game = Game.objects.create(
            tournament=tournament,
            match=match,
            white_player=match.white_player,
            black_player=match.black_player,
            status='waiting',
            time_control_minutes=time_control_minutes,
            time_increment_seconds=time_increment_seconds,
            white_time_remaining=time_control_minutes * 60,
            black_time_remaining=time_control_minutes * 60,
            white_joined=request.user.player_id == match.white_player.player_id,
            black_joined=request.user.player_id == match.black_player.player_id
        )
        
        # Update match status to in_progress
        match.match_status = 'in_progress'
        match.save()
        
        # Create notification for the other player (the one who didn't accept)
        from .models import Notification
        other_player = match.white_player if request.user.player_id == match.black_player.player_id else match.black_player
        try:
            Notification.objects.create(
                player=other_player,
                notification_type='pairing_update',
                title='Izazov prihvaćen!',
                message=f'{request.user.username} je prihvatio tvoj izazov! Igra je započela.',
                related_match=match
            )
            logger.info(f"Created notification for {other_player.username} about accepted challenge")
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
        
        return JsonResponse({
            'success': True,
            'game_id': game.game_id,
            'message': 'Igra stvorena',
            'game_url': f'/game?id={game.game_id}'
        })
        
    except Match.DoesNotExist:
        return JsonResponse({'error': 'Match not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error creating game: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_POST
@token_required
@csrf_exempt
def api_game_join(request, game_id):
    """
    POST /api/game/<game_id>/join/
    Join an existing game (mark player as ready)
    """
    try:
        game = Game.objects.select_related('white_player', 'black_player').get(game_id=game_id)
        
        # Provjeri je li korisnik igrač u ovoj igri
        if request.user.player_id != game.white_player.player_id and request.user.player_id != game.black_player.player_id:
            return JsonResponse({'error': 'Nisi igrač u ovoj igri'}, status=403)
        
        # Provjeri je li igra već u tijeku ili završena
        if game.status == 'completed':
            return JsonResponse({'error': 'Igra je već završena'}, status=400)
        
        if game.status == 'in_progress':
            # Već je započela, vrati uspjeh
            return JsonResponse({
                'success': True,
                'status': game.status,
                'white_joined': game.white_joined,
                'black_joined': game.black_joined,
                'message': 'Igra je već u tijeku'
            })
        
        # Mark player as joined
        if request.user.player_id == game.white_player.player_id:
            game.white_joined = True
        else:
            game.black_joined = True
        
        # Check if both players have joined
        if game.white_joined and game.black_joined:
            game.status = 'in_progress'
            game.started_at = timezone.now()
            game.last_move_time = timezone.now()
            logger.info(f"Game {game_id} started - both players joined")
        
        game.save()
        
        return JsonResponse({
            'success': True,
            'status': game.status,
            'white_joined': game.white_joined,
            'black_joined': game.black_joined,
            'started_at': game.started_at.isoformat() if game.started_at else None,
            'message': 'Pridružen igri' if game.status == 'waiting' else 'Igra započela'
        })
        
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Exception as e:
        logger.exception(f"Error joining game {game_id}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
