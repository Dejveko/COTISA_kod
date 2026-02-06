"""
Chess.com API Integration
Handles Chess.com player authentication and stats synchronization
"""
import requests
from django.conf import settings
from .models import Player, Role
from django.utils import timezone


class ChessComAPI:
    """Chess.com Public API wrapper"""
    BASE_URL = "https://api.chess.com/pub"
    HEADERS = {
        'User-Agent': 'COTISA-Chess-Tournament-System/1.0 (Django Application)',
        'Accept': 'application/json'
    }
    
    @staticmethod
    def get_player_profile(username):
        """
        Get player profile from Chess.com
        
        Args:
            username: Chess.com username
            
        Returns:
            dict: Player profile data or None if not found
        """
        import logging
        import time
        logger = logging.getLogger(__name__)
        
        # Try up to 3 times with exponential backoff
        for attempt in range(3):
            try:
                response = requests.get(
                    f"{ChessComAPI.BASE_URL}/player/{username}",
                    headers=ChessComAPI.HEADERS,
                    timeout=10
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:  # Rate limited
                    logger.warning(f"Rate limited by Chess.com API (attempt {attempt + 1})")
                    time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
                    continue
                else:
                    logger.error(f"Chess.com API returned status {response.status_code}")
                    return None
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout fetching Chess.com profile (attempt {attempt + 1})")
                if attempt < 2:
                    time.sleep(1)
                    continue
                return None
            except Exception as e:
                logger.error(f"Error fetching Chess.com profile: {e}")
                return None
        
        return None
    
    @staticmethod
    def get_player_stats(username):
        """
        Get player statistics from Chess.com
        
        Args:
            username: Chess.com username
            
        Returns:
            dict: Player stats data or None if not found
        """
        import logging
        import time
        logger = logging.getLogger(__name__)
        
        # Try up to 3 times with exponential backoff
        for attempt in range(3):
            try:
                response = requests.get(
                    f"{ChessComAPI.BASE_URL}/player/{username}/stats",
                    headers=ChessComAPI.HEADERS,
                    timeout=10
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:  # Rate limited
                    logger.warning(f"Rate limited by Chess.com API (attempt {attempt + 1})")
                    time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
                    continue
                else:
                    logger.error(f"Chess.com API returned status {response.status_code}")
                    return None
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout fetching Chess.com stats (attempt {attempt + 1})")
                if attempt < 2:
                    time.sleep(1)
                    continue
                return None
            except Exception as e:
                logger.error(f"Error fetching Chess.com stats: {e}")
                return None
        
        return None
    
    @staticmethod
    def get_player_games(username, year=None, month=None):
        """
        Get player games archive from Chess.com
        
        Args:
            username: Chess.com username
            year: Optional year (YYYY)
            month: Optional month (MM)
            
        Returns:
            dict: Games data or None if not found
        """
        try:
            if year and month:
                url = f"{ChessComAPI.BASE_URL}/player/{username}/games/{year}/{month:02d}"
            else:
                # Get archives list
                response = requests.get(
                    f"{ChessComAPI.BASE_URL}/player/{username}/games/archives",
                    headers=ChessComAPI.HEADERS,
                    timeout=10
                )
                if response.status_code == 200:
                    archives = response.json().get('archives', [])
                    if archives:
                        # Get the most recent archive
                        url = archives[-1]
                    else:
                        return None
                else:
                    return None
            
            response = requests.get(url, headers=ChessComAPI.HEADERS, timeout=10)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error fetching Chess.com games: {e}")
            return None
    
    @staticmethod
    def calculate_rating_from_stats(stats):
        """
        Calculate average ELO rating from Chess.com stats
        
        Args:
            stats: Chess.com stats data
            
        Returns:
            int: Average rating or 1200 if no data available
        """
        ratings = []
        
        # Collect ratings from different game modes
        for mode in ['chess_rapid', 'chess_blitz', 'chess_bullet', 'chess_daily']:
            if mode in stats:
                mode_data = stats[mode]
                if 'last' in mode_data and 'rating' in mode_data['last']:
                    ratings.append(mode_data['last']['rating'])
        
        if ratings:
            return int(sum(ratings) / len(ratings))
        
        return 1200  # Default rating
    
    @staticmethod
    def calculate_stats_from_data(stats):
        """
        Calculate wins, losses, draws from Chess.com stats
        
        Args:
            stats: Chess.com stats data
            
        Returns:
            dict: {wins, losses, draws, total_matches}
        """
        wins = 0
        losses = 0
        draws = 0
        
        # Sum up from different game modes
        for mode in ['chess_rapid', 'chess_blitz', 'chess_bullet', 'chess_daily']:
            if mode in stats:
                mode_data = stats[mode]
                record = mode_data.get('record', {})
                wins += record.get('win', 0)
                losses += record.get('loss', 0)
                draws += record.get('draw', 0)
        
        total_matches = wins + losses + draws
        
        return {
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'total_matches': total_matches
        }


def verify_chesscom_user(username):
    """
    Verify Chess.com username exists and return user data
    
    Args:
        username: Chess.com username
        
    Returns:
        dict: {'profile': profile_data, 'stats': stats_data} if valid, None otherwise
    """
    profile = ChessComAPI.get_player_profile(username)
    if not profile:
        return None
    
    stats = ChessComAPI.get_player_stats(username)
    
    return {
        'profile': profile,
        'stats': stats or {}
    }


def get_or_create_chesscom_user(chesscom_data):
    """
    Get existing user by Chess.com username or create new user
    
    Args:
        chesscom_data: Data from verify_chesscom_user()
        
    Returns:
        Player: Player object
        bool: True if created, False if existing
    """
    chesscom_username = chesscom_data['chesscom_username']
    
    # Check if user exists by Chess.com username
    try:
        player = Player.objects.get(chesscom_username=chesscom_username)
        
        # Update stats from Chess.com
        player.elo_rating = chesscom_data['rating']
        player.wins = chesscom_data['wins']
        player.losses = chesscom_data['losses']
        player.draws = chesscom_data['draws']
        player.total_matches = chesscom_data['total_matches']
        player.chesscom_avatar = chesscom_data.get('avatar', '')
        player.last_login = timezone.now()
        player.save()
        
        return player, False
        
    except Player.DoesNotExist:
        pass
    
    # Check if email exists (if we have it)
    # Note: Chess.com API doesn't provide email, so we'll need to get it from user
    
    # Get player role
    try:
        player_role = Role.objects.get(role_name='player')
    except Role.DoesNotExist:
        # Create default player role if it doesn't exist
        player_role = Role.objects.create(
            role_name='player',
            description='Regular player',
            can_create_tournament=False,
            can_view_all_matches=True
        )
    
    # Create new player from Chess.com data
    # Username will be their Chess.com username (can be changed later)
    username = chesscom_username
    email = f"{chesscom_username}@chesscom.temp"  # Temporary email, user should update
    
    player = Player.objects.create(
        username=username,
        email=email,
        full_name=chesscom_data.get('name', ''),
        role=player_role,
        elo_rating=chesscom_data['rating'],
        wins=chesscom_data['wins'],
        losses=chesscom_data['losses'],
        draws=chesscom_data['draws'],
        total_matches=chesscom_data['total_matches'],
        chesscom_username=chesscom_username,
        chesscom_id=chesscom_data.get('chesscom_id', ''),
        chesscom_avatar=chesscom_data.get('avatar', ''),
        profile_picture=chesscom_data.get('avatar', 'default-avatar.png'),
        is_active=True,
    )
    
    # Set unusable password since they log in via Chess.com
    player.set_unusable_password()
    player.save()
    
    return player, True


def sync_chesscom_stats(player):
    """
    Synchronize player stats from Chess.com
    
    Args:
        player: Player object with chesscom_username
        
    Returns:
        bool: True if successful, False otherwise
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        if not player.chesscom_username:
            logger.warning(f"Player {player.username} has no Chess.com username")
            return False
        
        logger.info(f"Syncing Chess.com stats for {player.chesscom_username}")
        chesscom_data = verify_chesscom_user(player.chesscom_username)
        
        if not chesscom_data:
            logger.error(f"Failed to verify Chess.com user {player.chesscom_username}")
            return False
        
        profile = chesscom_data.get('profile', {})
        stats = chesscom_data.get('stats', {})
        
        # Extract ELO ratings by type
        if 'chess_rapid' in stats and 'last' in stats['chess_rapid']:
            player.elo_rapid = stats['chess_rapid']['last'].get('rating', player.elo_rapid)
        
        if 'chess_blitz' in stats and 'last' in stats['chess_blitz']:
            player.elo_blitz = stats['chess_blitz']['last'].get('rating', player.elo_blitz)
        
        if 'chess_bullet' in stats and 'last' in stats['chess_bullet']:
            player.elo_bullet = stats['chess_bullet']['last'].get('rating', player.elo_bullet)
        
        if 'chess_daily' in stats and 'last' in stats['chess_daily']:
            player.elo_daily = stats['chess_daily']['last'].get('rating', player.elo_daily)
        
        if 'tactics' in stats and 'highest' in stats['tactics']:
            player.elo_puzzle = stats['tactics']['highest'].get('rating', player.elo_puzzle)
        
        # Calculate average ELO
        elo_ratings = [r for r in [player.elo_rapid, player.elo_blitz, player.elo_bullet, player.elo_daily] if r != 1200]
        if elo_ratings:
            player.elo_rating = int(sum(elo_ratings) / len(elo_ratings))
        
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
        
        player.wins = total_wins
        player.losses = total_losses
        player.draws = total_draws
        player.total_matches = total_wins + total_losses + total_draws
        player.chesscom_avatar = profile.get('avatar', player.chesscom_avatar)
        player.save()
        
        logger.info(f"Successfully synced stats for {player.chesscom_username}")
        return True
        
    except Exception as e:
        logger.error(f"Error syncing Chess.com stats for {player.username}: {str(e)}")
        return False
