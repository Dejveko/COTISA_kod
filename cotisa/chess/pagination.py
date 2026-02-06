"""
Pagination Utilities for COTISA API
===================================
Provides reusable pagination for API list endpoints.
"""

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse


class APIPaginator:
    """
    API Paginator for consistent pagination across endpoints.
    
    Usage:
        paginator = APIPaginator(queryset, request, per_page=20)
        return paginator.get_response(serializer_func)
    """
    
    def __init__(self, queryset, request, per_page=20):
        self.queryset = queryset
        self.request = request
        self.per_page = int(request.GET.get('per_page', per_page))
        self.page_number = request.GET.get('page', 1)
        
        # Limit per_page to prevent abuse
        if self.per_page > 100:
            self.per_page = 100
        if self.per_page < 1:
            self.per_page = 1
    
    def get_page(self):
        """Get the current page of results"""
        paginator = Paginator(self.queryset, self.per_page)
        
        try:
            page = paginator.page(self.page_number)
        except PageNotAnInteger:
            page = paginator.page(1)
        except EmptyPage:
            page = paginator.page(paginator.num_pages)
        
        return page, paginator
    
    def get_response(self, serializer_func, data_key='items'):
        """
        Get paginated JSON response.
        
        Args:
            serializer_func: Function that takes an item and returns a dict
            data_key: Key name for the data array in response
        
        Returns:
            JsonResponse with pagination metadata
        """
        page, paginator = self.get_page()
        
        items = [serializer_func(item) for item in page.object_list]
        
        return JsonResponse({
            'success': True,
            data_key: items,
            'pagination': {
                'current_page': page.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
                'per_page': self.per_page,
                'has_next': page.has_next(),
                'has_previous': page.has_previous(),
                'next_page': page.next_page_number() if page.has_next() else None,
                'previous_page': page.previous_page_number() if page.has_previous() else None,
            }
        })


def paginate_queryset(queryset, request, per_page=20, serializer_func=None, data_key='items'):
    """
    Convenience function for quick pagination.
    
    Usage:
        def api_list_items(request):
            items = Item.objects.all()
            return paginate_queryset(
                items, 
                request, 
                per_page=20,
                serializer_func=lambda x: {'id': x.id, 'name': x.name},
                data_key='items'
            )
    """
    paginator = APIPaginator(queryset, request, per_page)
    return paginator.get_response(serializer_func or (lambda x: x), data_key)


# Serializer functions for common models

def serialize_tournament(tournament):
    """Serialize a tournament object for API response"""
    return {
        'id': tournament.tournament_id,
        'code': tournament.tournament_code,
        'tournament_code': tournament.tournament_code,
        'name': tournament.tournament_name,
        'tournament_name': tournament.tournament_name,
        'type': tournament.tournament_type,
        'format_type': getattr(tournament, 'format_type', tournament.tournament_type),
        'tournament_status': tournament.tournament_status,
        'status': tournament.tournament_status,
        'current_players': tournament.current_participants,
        'participants': tournament.current_participants,
        'max_players': tournament.max_participants,
        'max_participants': tournament.max_participants,
        'time_control_minutes': getattr(tournament, 'time_control_minutes', 10),
        'increment_seconds': getattr(tournament, 'increment_seconds', 5),
        'start_date': tournament.start_date.isoformat() if tournament.start_date else None,
        'created_at': tournament.created_at.isoformat() if tournament.created_at else None,
        'created_by': tournament.created_by.username if tournament.created_by else None,
        'is_public': getattr(tournament, 'is_public', True),
        'is_rated': getattr(tournament, 'is_rated', True),
    }


def serialize_player(player, include_sensitive=False):
    """Serialize a player object for API response"""
    data = {
        'id': player.player_id,
        'username': player.username,
        'full_name': player.full_name,
        'elo_rating': player.elo_rating,
        'elo_rapid': player.elo_rapid,
        'elo_blitz': player.elo_blitz,
        'elo_bullet': player.elo_bullet,
        'elo_daily': player.elo_daily,
        'wins': player.wins,
        'losses': player.losses,
        'draws': player.draws,
        'total_matches': player.total_matches,
        'matches_played': player.matches_played,
        'is_provisional': player.is_provisional,
        'active_title': player.active_title.title_name if player.active_title else None,
        'date_joined': player.date_joined.isoformat() if player.date_joined else None,
    }
    
    if include_sensitive:
        data['email'] = player.email
        data['role'] = player.role.role_name if player.role else None
    
    return data


def serialize_match(match):
    """Serialize a match object for API response"""
    return {
        'id': match.match_id,
        'tournament_id': match.tournament_id,
        'round_number': match.round_number,
        'match_number': match.match_number,
        'white_player': {
            'id': match.white_player.player_id,
            'username': match.white_player.username,
            'elo': match.white_player.elo_rating
        } if match.white_player else None,
        'black_player': {
            'id': match.black_player.player_id,
            'username': match.black_player.username,
            'elo': match.black_player.elo_rating
        } if match.black_player else None,
        'winner': {
            'id': match.winner.player_id,
            'username': match.winner.username
        } if match.winner else None,
        'result': match.result,
        'status': match.status,
        'scheduled_time': match.scheduled_time.isoformat() if match.scheduled_time else None,
        'start_time': match.start_time.isoformat() if match.start_time else None,
        'end_time': match.end_time.isoformat() if match.end_time else None,
    }


def serialize_notification(notification):
    """Serialize a notification object for API response"""
    return {
        'id': notification.notification_id,
        'title': notification.title,
        'message': notification.message,
        'notification_type': notification.notification_type,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat() if notification.created_at else None,
        'link': getattr(notification, 'link', None),
    }
