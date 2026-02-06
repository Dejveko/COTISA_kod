"""
ELO Rating System Implementation
Based on standard ELO formula used by FIDE and chess.com
"""

import math


def calculate_expected_score(rating_a, rating_b):
    """
    Calculate expected score for player A against player B
    
    Formula: E_A = 1 / (1 + 10^((R_B - R_A) / 400))
    
    Args:
        rating_a: ELO rating of player A
        rating_b: ELO rating of player B
    
    Returns:
        Expected score (0 to 1) for player A
    """
    return 1 / (1 + math.pow(10, (rating_b - rating_a) / 400))


def get_k_factor(matches_played, rating):
    """
    Get K-factor based on number of matches played and rating
    
    K-factor determines how much ratings change after each game:
    - Higher K for new players (more volatile ratings)
    - Lower K for established players (more stable ratings)
    
    Args:
        matches_played: Number of rated matches the player has played
        rating: Current ELO rating
    
    Returns:
        K-factor value
    """
    # Provisional players (< 5 matches): High K-factor for quick calibration
    if matches_played < 5:
        return 40
    
    # New players (5-30 matches): Medium-high K-factor
    if matches_played < 30:
        return 32
    
    # Strong players (rating >= 2400): Lower K-factor for stability
    if rating >= 2400:
        return 16
    
    # Regular players: Standard K-factor
    return 24


def calculate_new_rating(current_rating, opponent_rating, actual_score, matches_played):
    """
    Calculate new ELO rating after a match
    
    Formula: R'_A = R_A + K * (S_A - E_A)
    
    Args:
        current_rating: Player's current ELO rating
        opponent_rating: Opponent's current ELO rating
        actual_score: Actual result (1.0 = win, 0.5 = draw, 0.0 = loss)
        matches_played: Number of rated matches the player has played
    
    Returns:
        New ELO rating (rounded to nearest integer)
    """
    # Calculate expected score
    expected_score = calculate_expected_score(current_rating, opponent_rating)
    
    # Get K-factor
    k_factor = get_k_factor(matches_played, current_rating)
    
    # Calculate rating change
    rating_change = k_factor * (actual_score - expected_score)
    
    # Calculate new rating
    new_rating = current_rating + rating_change
    
    # Round to nearest integer and ensure it doesn't go below 100
    new_rating = max(100, round(new_rating))
    
    return new_rating


def update_player_ratings(winner, loser, is_draw=False, time_control_type='rapid'):
    """
    Update ELO ratings for both players after a game
    
    Args:
        winner: Player object who won (or first player if draw)
        loser: Player object who lost (or second player if draw)
        is_draw: Boolean indicating if game was a draw
        time_control_type: Type of time control (bullet, blitz, rapid, daily)
    
    Returns:
        Dictionary with rating changes:
        {
            'player1_old': int,
            'player1_new': int,
            'player1_change': int,
            'player2_old': int,
            'player2_new': int,
            'player2_change': int
        }
    """
    # Use clearer names
    player1 = winner
    player2 = loser
    
    # Determine actual scores
    if is_draw:
        player1_score = 0.5
        player2_score = 0.5
    else:
        player1_score = 1.0
        player2_score = 0.0
    
    # Get appropriate ELO ratings based on time control
    rating_field = f'elo_{time_control_type}'
    
    # Get current ratings (fallback to general elo_rating if specific doesn't exist)
    player1_current = getattr(player1, rating_field, None) or player1.elo_rating
    player2_current = getattr(player2, rating_field, None) or player2.elo_rating
    
    # Get current matches_played (default to 0)
    player1_matches = player1.matches_played or 0
    player2_matches = player2.matches_played or 0
    
    # Calculate new ratings
    player1_new = calculate_new_rating(
        player1_current,
        player2_current,
        player1_score,
        player1_matches
    )
    
    player2_new = calculate_new_rating(
        player2_current,
        player1_current,
        player2_score,
        player2_matches
    )
    
    # Update player objects - specific rating field
    if hasattr(player1, rating_field):
        setattr(player1, rating_field, player1_new)
    if hasattr(player2, rating_field):
        setattr(player2, rating_field, player2_new)
    
    # Also update general rating (weighted average of all ratings)
    # Only include ratings that are set (not default 1200)
    for player in [player1, player2]:
        ratings = []
        for field in ['elo_bullet', 'elo_blitz', 'elo_rapid', 'elo_daily']:
            val = getattr(player, field, 1200)
            if val is not None:
                ratings.append(val)
        if ratings:
            player.elo_rating = round(sum(ratings) / len(ratings))
    
    # Update match counts and stats
    player1.matches_played = player1_matches + 1
    player2.matches_played = player2_matches + 1
    
    if is_draw:
        player1.draws = (player1.draws or 0) + 1
        player2.draws = (player2.draws or 0) + 1
    else:
        player1.wins = (player1.wins or 0) + 1
        player2.losses = (player2.losses or 0) + 1
    
    player1.total_matches = (player1.total_matches or 0) + 1
    player2.total_matches = (player2.total_matches or 0) + 1
    
    # Update provisional status (no longer provisional after 5 matches)
    if player1.matches_played >= 5:
        player1.is_provisional = False
    if player2.matches_played >= 5:
        player2.is_provisional = False
    
    # Save changes
    player1.save()
    player2.save()
    
    # Log the rating changes
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"ELO updated - {player1.username}: {player1_current} -> {player1_new} ({player1_new - player1_current:+d})")
    logger.info(f"ELO updated - {player2.username}: {player2_current} -> {player2_new} ({player2_new - player2_current:+d})")
    
    return {
        'player1_old': player1_current,
        'player1_new': player1_new,
        'player1_change': player1_new - player1_current,
        'player2_old': player2_current,
        'player2_new': player2_new,
        'player2_change': player2_new - player2_current
    }


def get_initial_rating(experience_level):
    """
    Get initial ELO rating based on experience level
    
    Args:
        experience_level: 'beginner', 'intermediate', or 'advanced'
    
    Returns:
        Initial ELO rating
    """
    ratings = {
        'beginner': 400,
        'intermediate': 700,
        'advanced': 1000
    }
    return ratings.get(experience_level, 700)
