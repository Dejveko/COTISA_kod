"""
Tournament Helper Functions
Time control validation and pairing logic
"""

# Official FIDE time control definitions
TIME_CONTROL_LIMITS = {
    'bullet': {
        'min_minutes': 0,
        'max_minutes': 3,
        'description': 'Bullet - brza partija ispod 3 minute',
        'examples': ['1+0', '1+1', '2+1']
    },
    'blitz': {
        'min_minutes': 3,
        'max_minutes': 10,
        'description': 'Blitz - između 3 i 10 minuta',
        'examples': ['3+0', '3+2', '5+0', '5+3']
    },
    'rapid': {
        'min_minutes': 10,
        'max_minutes': 60,
        'description': 'Rapid - između 10 i 60 minuta',
        'examples': ['10+0', '15+10', '25+10', '30+0']
    },
    'daily': {
        'min_minutes': 0,  # Not applicable for correspondence
        'max_minutes': 0,  # Days-based system
        'description': 'Daily/Correspondence - više dana po potezu',
        'examples': ['1 dan po potezu', '3 dana po potezu']
    }
}


def validate_time_control(time_type, minutes, increment=0):
    """
    Validate if time control matches the selected type
    
    Args:
        time_type: 'bullet', 'blitz', 'rapid', or 'daily'
        minutes: Base time in minutes
        increment: Increment per move in seconds
        
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    if time_type not in TIME_CONTROL_LIMITS:
        return False, f"Nevažeći tip vremenske kontrole: {time_type}"
    
    if time_type == 'daily':
        # Daily chess doesn't use standard time controls
        return True, None
    
    limits = TIME_CONTROL_LIMITS[time_type]
    
    # Calculate total time (base + average increment contribution)
    # Assume average game is 40 moves = 20 moves per player
    total_time = minutes + (increment * 20 / 60)
    
    if total_time < limits['min_minutes']:
        return False, f"{time_type.capitalize()} mora biti najmanje {limits['min_minutes']} minuta"
    
    if total_time > limits['max_minutes']:
        return False, f"{time_type.capitalize()} mora biti najviše {limits['max_minutes']} minuta"
    
    return True, None


def get_player_elo_for_tournament(player, time_control_type):
    """
    Get player's ELO rating for specific tournament type
    
    Args:
        player: Player model instance
        time_control_type: 'bullet', 'blitz', 'rapid', 'daily'
        
    Returns:
        int: Player's ELO for that time control
    """
    elo_field_map = {
        'bullet': 'elo_bullet',
        'blitz': 'elo_blitz',
        'rapid': 'elo_rapid',
        'daily': 'elo_daily',
    }
    
    field_name = elo_field_map.get(time_control_type)
    if field_name:
        return getattr(player, field_name, player.elo_rating)
    
    return player.elo_rating


def generate_random_pairings(participants):
    """
    Generate random pairings for tournament round
    
    Args:
        participants: List of Player objects
        
    Returns:
        list: List of tuples (player1, player2)
    """
    import random
    shuffled = list(participants)
    random.shuffle(shuffled)
    
    pairings = []
    for i in range(0, len(shuffled) - 1, 2):
        pairings.append((shuffled[i], shuffled[i + 1]))
    
    # If odd number of players, last one gets a bye
    if len(shuffled) % 2 == 1:
        pairings.append((shuffled[-1], None))  # None = bye
    
    return pairings


def generate_rating_based_pairings(participants, time_control_type):
    """
    Pair players by similar rating
    
    Args:
        participants: List of Player objects
        time_control_type: Tournament time control type
        
    Returns:
        list: List of tuples (player1, player2)
    """
    # Sort by appropriate ELO
    sorted_players = sorted(
        participants, 
        key=lambda p: get_player_elo_for_tournament(p, time_control_type),
        reverse=True
    )
    
    pairings = []
    for i in range(0, len(sorted_players) - 1, 2):
        pairings.append((sorted_players[i], sorted_players[i + 1]))
    
    if len(sorted_players) % 2 == 1:
        pairings.append((sorted_players[-1], None))
    
    return pairings


def generate_swiss_pairings(participants, round_number, previous_matches):
    """
    Generate Swiss system pairings
    
    Args:
        participants: List of Player objects
        round_number: Current round number
        previous_matches: List of previous Match objects
        
    Returns:
        list: List of tuples (player1, player2)
    """
    # Calculate scores for each player
    scores = {}
    played_against = {}
    
    for participant in participants:
        scores[participant.player_id] = 0
        played_against[participant.player_id] = set()
    
    # Count wins/draws
    for match in previous_matches:
        if match.result == 'white_win':
            scores[match.white_player.player_id] += 1
        elif match.result == 'black_win':
            scores[match.black_player.player_id] += 1
        elif match.result == 'draw':
            scores[match.white_player.player_id] += 0.5
            scores[match.black_player.player_id] += 0.5
        
        played_against[match.white_player.player_id].add(match.black_player.player_id)
        played_against[match.black_player.player_id].add(match.white_player.player_id)
    
    # Sort by score (highest first)
    sorted_players = sorted(
        participants,
        key=lambda p: scores[p.player_id],
        reverse=True
    )
    
    pairings = []
    paired = set()
    
    for player in sorted_players:
        if player.player_id in paired:
            continue
        
        # Find opponent with similar score who hasn't played yet
        for opponent in sorted_players:
            if (opponent.player_id != player.player_id and 
                opponent.player_id not in paired and
                opponent.player_id not in played_against[player.player_id]):
                
                pairings.append((player, opponent))
                paired.add(player.player_id)
                paired.add(opponent.player_id)
                break
    
    # Handle unpaired player (bye)
    unpaired = [p for p in sorted_players if p.player_id not in paired]
    if unpaired:
        pairings.append((unpaired[0], None))
    
    return pairings


def format_time_control_display(time_type, minutes, increment=0):
    """
    Format time control for display
    
    Args:
        time_type: Time control type
        minutes: Base minutes
        increment: Increment seconds
        
    Returns:
        str: Formatted string (e.g., "5+3 Blitz")
    """
    if time_type == 'daily':
        return f"Daily ({minutes} dan/a po potezu)"
    
    return f"{minutes}+{increment} {time_type.capitalize()}"


def check_round_complete_and_advance(tournament, match):
    """
    Check if current round is complete and advance to next round if needed.
    For elimination tournaments, generates next round with winners.
    For round_robin, checks if all rounds are done.
    For swiss, generates new pairings.
    
    Args:
        tournament: TournamentActive instance
        match: Match that just completed
        
    Returns:
        dict: Status info about round advancement
    """
    from .models import Match, TournamentParticipant, TournamentRound
    import math
    from django.utils import timezone
    import logging
    
    logger = logging.getLogger(__name__)
    
    current_round = tournament.current_round
    tournament_type = tournament.tournament_type
    
    logger.info(f"[ROUND_CHECK] Tournament {tournament.tournament_id}, type={tournament_type}, current_round={current_round}")
    
    # Get all matches for current round
    current_round_matches = Match.objects.filter(
        tournament=tournament,
        round_number=current_round
    )
    
    total_matches = current_round_matches.count()
    completed_matches = current_round_matches.filter(match_status='completed').count()
    
    logger.info(f"[ROUND_CHECK] Round {current_round}: {completed_matches}/{total_matches} matches completed")
    
    # Debug: log each match status
    for m in current_round_matches:
        logger.info(f"  Match {m.match_id}: {m.white_player.username} vs {m.black_player.username if m.black_player else 'BYE'}, status={m.match_status}, winner={m.winner}")
    
    # If not all matches in current round are done, don't advance
    if completed_matches < total_matches:
        return {
            'round_complete': False,
            'completed': completed_matches,
            'total': total_matches,
            'message': f'Runda {current_round}: {completed_matches}/{total_matches} mečeva završeno'
        }
    
    # All matches in current round are complete!
    logger.info(f"[ROUND_CHECK] Round {current_round} COMPLETE! Advancing tournament...")
    
    # ELIMINATION TOURNAMENT
    if tournament_type == 'elimination':
        # Get winners from current round
        winners = []
        for m in current_round_matches:
            if m.winner:
                winners.append(m.winner)
        
        logger.info(f"[ROUND_CHECK] Elimination: {len(winners)} winners from round {current_round}")
        
        # If only 1 winner (or 0), tournament is done
        if len(winners) <= 1:
            tournament.tournament_status = 'completed'
            tournament.end_date = timezone.now()
            tournament.save()
            logger.info(f"[ROUND_CHECK] Tournament COMPLETED! Winner: {winners[0].username if winners else 'None'}")
            return {
                'round_complete': True,
                'tournament_complete': True,
                'winner': winners[0] if winners else None,
                'message': 'Turnir završen!'
            }
        
        # Generate next round with winners
        next_round = current_round + 1
        tournament.current_round = next_round
        tournament.save()
        
        logger.info(f"[ROUND_CHECK] Creating round {next_round} with {len(winners)} winners")
        
        # Create matches for next round
        # Pair winners: 1st vs last, 2nd vs 2nd-last, etc.
        new_matches = []
        for i in range(0, len(winners) // 2):
            p1 = winners[i]
            p2 = winners[len(winners) - 1 - i]
            
            new_match = Match.objects.create(
                tournament=tournament,
                white_player=p1,
                black_player=p2,
                round_number=next_round,
                match_status='scheduled',
                white_elo_before=p1.elo_rating,
                black_elo_before=p2.elo_rating
            )
            new_matches.append(new_match)
            logger.info(f"[ROUND_CHECK] Created match: {p1.username} vs {p2.username}")
        
        # If odd number, one gets a bye to next round
        if len(winners) % 2 == 1:
            bye_player = winners[len(winners) // 2]
            logger.info(f"[ROUND_CHECK] Odd number of winners, {bye_player.username} gets a bye")
            # Auto-advance to next round or mark as special
        
        logger.info(f"[ROUND_CHECK] Round {next_round} created with {len(new_matches)} matches")
        
        # Create notifications for all participants
        try:
            from .models import TournamentParticipant, Notification
            
            participants = TournamentParticipant.objects.filter(tournament=tournament)
            for participant in participants:
                Notification.objects.create(
                    player=participant.player,
                    notification_type='tournament_start',
                    title=f'Nova runda u turniru {tournament.tournament_name}',
                    message=f'Runda {next_round} je kreirana! Provjerite svoje parove.',
                    related_tournament=tournament
                )
            logger.info(f"[ROUND_CHECK] Created {participants.count()} notifications for new round")
        except Exception as e:
            logger.error(f"[ROUND_CHECK] Error creating notifications: {e}")
        
        # Send WebSocket notification to all tournament participants
        try:
            from .consumers import send_websocket_message
            from .models import TournamentParticipant
            
            # Notify tournament group
            send_websocket_message(
                f'tournament_{tournament.tournament_id}',
                'tournament_round_update',
                {
                    'tournament_id': tournament.tournament_id,
                    'round_number': next_round,
                    'message': f'Nova runda {next_round} je kreirana!',
                    'matches': [{'player1': m.white_player.username, 'player2': m.black_player.username} for m in new_matches]
                }
            )
            
            # Notify each participant individually
            participants = TournamentParticipant.objects.filter(tournament=tournament)
            for participant in participants:
                send_websocket_message(
                    f'user_{participant.player.player_id}',
                    'new_round',
                    {
                        'tournament_id': tournament.tournament_id,
                        'round_number': next_round,
                        'message': f'Nova runda {next_round} u turniru {tournament.tournament_name}!'
                    }
                )
            
            logger.info(f"[ROUND_CHECK] WebSocket notifications sent for new round {next_round}")
        except Exception as e:
            logger.error(f"[ROUND_CHECK] Error sending WebSocket notification: {e}")
        
        return {
            'round_complete': True,
            'tournament_complete': False,
            'next_round': next_round,
            'matches_created': len(new_matches),
            'message': f'Runda {current_round} završena! Sljedeća runda ({next_round}) kreirana s {len(new_matches)} mečeva.'
        }
    
    # ROUND ROBIN TOURNAMENT
    elif tournament_type == 'round_robin':
        # Check if there are more rounds scheduled
        total_participants = TournamentParticipant.objects.filter(tournament=tournament).count()
        total_rounds = total_participants - 1 if total_participants % 2 == 0 else total_participants
        
        if current_round >= total_rounds:
            tournament.tournament_status = 'completed'
            tournament.end_date = timezone.now()
            tournament.save()
            return {
                'round_complete': True,
                'tournament_complete': True,
                'message': 'Round Robin turnir završen!'
            }
        
        # Advance to next round (matches should already be pre-generated)
        tournament.current_round = current_round + 1
        tournament.save()
        
        return {
            'round_complete': True,
            'tournament_complete': False,
            'next_round': current_round + 1,
            'message': f'Runda {current_round} završena! Sljedeća runda: {current_round + 1}'
        }
    
    # SWISS TOURNAMENT
    elif tournament_type == 'swiss':
        settings = getattr(tournament, 'settings', None)
        max_rounds = settings.max_rounds if settings else math.ceil(math.log2(
            TournamentParticipant.objects.filter(tournament=tournament).count()
        ))
        
        if current_round >= max_rounds:
            tournament.tournament_status = 'completed'
            tournament.end_date = timezone.now()
            tournament.save()
            return {
                'round_complete': True,
                'tournament_complete': True,
                'message': 'Swiss turnir završen!'
            }
        
        # Generate Swiss pairings for next round
        next_round = current_round + 1
        tournament.current_round = next_round
        tournament.save()
        
        participants = [tp.player for tp in TournamentParticipant.objects.filter(
            tournament=tournament, is_eliminated=False
        )]
        previous_matches = Match.objects.filter(tournament=tournament)
        
        pairings = generate_swiss_pairings(participants, next_round, previous_matches)
        
        new_matches = []
        for p1, p2 in pairings:
            if p2:  # Not a bye
                new_match = Match.objects.create(
                    tournament=tournament,
                    white_player=p1,
                    black_player=p2,
                    round_number=next_round,
                    match_status='scheduled',
                    white_elo_before=p1.elo_rating,
                    black_elo_before=p2.elo_rating
                )
                new_matches.append(new_match)
        
        return {
            'round_complete': True,
            'tournament_complete': False,
            'next_round': next_round,
            'matches_created': len(new_matches),
            'message': f'Runda {current_round} završena! Sljedeća runda ({next_round}) kreirana.'
        }
    
    # Unknown tournament type - mark as complete
    tournament.tournament_status = 'completed'
    tournament.end_date = timezone.now()
    tournament.save()
    return {
        'round_complete': True,
        'tournament_complete': True,
        'message': 'Turnir završen!'
    }
