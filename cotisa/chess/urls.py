"""
URL Configuration for Chess API
All endpoints return JSON - REST API only!
NO template rendering!
"""
from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from django.views.static import serve
from . import api_views
from . import game_views
import os

def serve_frontend_index(request):
    """Serve the frontend SPA index.html"""
    from django.http import HttpResponse
    frontend_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'index.html')
    with open(frontend_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content, content_type='text/html; charset=utf-8')

def serve_mobile_index(request):
    """Serve the mobile-optimized mobile.html"""
    from django.http import HttpResponse
    frontend_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'mobile.html')
    with open(frontend_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content, content_type='text/html; charset=utf-8')

def serve_test_page(request):
    """Serve test page for debugging"""
    from django.http import HttpResponse
    frontend_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'test.html')
    with open(frontend_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content, content_type='text/html; charset=utf-8')

def auto_detect_mobile(request):
    """Auto-detect mobile and redirect accordingly"""
    from django.http import HttpResponse
    from django.shortcuts import redirect
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    mobile_keywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'opera mini', 'opera mobi']
    is_mobile = any(keyword in user_agent for keyword in mobile_keywords)
    if is_mobile:
        return serve_mobile_index(request)
    return serve_frontend_index(request)

urlpatterns = [
    # Frontend - auto-detect mobile or desktop
    path('', auto_detect_mobile, name='index'),
    # Direct access to mobile version
    path('mobile/', serve_mobile_index, name='mobile'),
    path('mobile.html', serve_mobile_index, name='mobile_html'),
    # Test page for debugging
    path('test/', serve_test_page, name='test'),
    path('test.html', serve_test_page, name='test_html'),
    
    # Health check
    path('api/health/', api_views.api_health, name='api_health'),
    
    # Authentication
    path('api/register/', api_views.api_register, name='api_register'),
    path('api/login/', api_views.api_login, name='api_login'),
    path('api/logout/', api_views.api_logout, name='api_logout'),
    path('api/delete-account/', api_views.api_delete_account, name='api_delete_account'),
    path('api/google-login/', api_views.api_google_login, name='api_google_login'),
    path('api/chesscom-login/', api_views.api_chesscom_login, name='api_chesscom_login'),
    path('api/link-chesscom/', api_views.api_link_chesscom, name='api_link_chesscom'),
    path('api/sync-chesscom-stats/', api_views.api_sync_chesscom_stats, name='api_sync_chesscom_stats'),
    
    # Profile
    path('api/profile/', api_views.api_profile, name='api_profile'),
    path('api/profile/stats/', api_views.api_profile_stats, name='api_profile_stats'),
    path('api/profile/history/', api_views.api_profile_history, name='api_profile_history'),
    path('api/profile/picture-source/', api_views.api_set_profile_picture_source, name='api_set_profile_picture_source'),
    path('api/profile/picture-sources/', api_views.api_get_available_picture_sources, name='api_get_available_picture_sources'),
    path('api/leaderboard/', api_views.api_leaderboard, name='api_leaderboard'),
    
    # Tournaments
    path('api/tournaments/', api_views.api_all_tournaments, name='api_all_tournaments'),
    path('api/tournaments/create/', api_views.api_create_tournament, name='api_create_tournament'),
    path('api/tournaments/join/', api_views.api_join_tournament, name='api_join_tournament'),
    path('api/tournaments/my/', api_views.api_my_tournaments, name='api_my_tournaments'),
    path('api/tournaments/start/', api_views.api_start_tournament, name='api_start_tournament'),
    path('api/tournaments/<int:tournament_id>/start/', api_views.api_start_tournament_by_id, name='api_start_tournament_by_id'),
    path('api/tournaments/delete/', api_views.api_delete_tournament, name='api_delete_tournament'),
    path('api/tournaments/code/<str:tournament_code>/', api_views.api_tournament_by_code, name='api_tournament_by_code'),
    path('api/tournaments/<int:tournament_id>/', api_views.api_tournament_detail, name='api_tournament_detail'),
    
    # Matches
    path('api/matches/my/', api_views.api_my_matches, name='api_my_matches'),
    
    # Chess Games
    path('api/game/create/', game_views.api_create_game, name='api_create_game'),
    path('api/game/<int:game_id>/', game_views.api_game_detail, name='api_game_detail'),
    path('api/game/<int:game_id>/spectate/', game_views.api_game_spectate, name='api_game_spectate'),
    path('api/game/<int:game_id>/join/', game_views.api_game_join, name='api_game_join'),
    path('api/game/<int:game_id>/move/', game_views.api_game_move, name='api_game_move'),
    path('api/game/<int:game_id>/resign/', game_views.api_game_resign, name='api_game_resign'),
    path('api/game/<int:game_id>/end/', game_views.api_game_end, name='api_game_end'),
    path('api/game/<int:game_id>/draw-offer/', game_views.api_game_draw_offer, name='api_game_draw_offer'),
    path('api/tournaments/<int:tournament_id>/games/', game_views.api_tournament_ongoing_games, name='api_tournament_ongoing_games'),
    
    # Tournament deletion
    path('api/tournament/delete/', api_views.api_delete_tournament, name='api_delete_tournament'),
    
    # Admin
    path('api/admin/dashboard/', api_views.api_admin_dashboard, name='api_admin_dashboard'),
    path('api/admin/players/', api_views.api_admin_players, name='api_admin_players'),
    path('api/admin/players/delete/', api_views.api_admin_delete_player, name='api_admin_delete_player'),
    path('api/admin/titles/', api_views.api_admin_titles, name='api_admin_titles'),
    path('api/admin/titles/award/', api_views.api_admin_award_title, name='api_admin_award_title'),
    path('api/admin/titles/delete/', api_views.api_admin_delete_title, name='api_admin_delete_title'),
    path('api/admin/matches/', api_views.api_admin_matches, name='api_admin_matches'),
    path('api/admin/make-admin/', api_views.api_admin_make_admin, name='api_admin_make_admin'),
    path('api/players/all/', api_views.api_all_players, name='api_all_players'),
    path('api/players/<int:player_id>/profile/', api_views.api_player_profile, name='api_player_profile'),
    path('api/profile/upload-picture/', api_views.api_upload_profile_picture, name='api_upload_profile_picture'),
    path('api/profile/set-active-title/', api_views.api_set_active_title, name='api_set_active_title'),
    path('api/players/challenge/', api_views.api_challenge_player, name='api_challenge_player'),
    path('api/players/<int:player_id>/titles/', api_views.api_player_titles, name='api_player_titles'),
    path('api/admin/titles/all/', api_views.api_admin_all_titles, name='api_admin_all_titles'),
    path('api/admin/titles/create/', api_views.api_admin_create_title, name='api_admin_create_title'),
    path('api/admin/titles/award/', api_views.api_admin_award_title_to_player, name='api_admin_award_title'),
    
    # Notifications
    path('api/notifications/', api_views.api_get_notifications, name='api_get_notifications'),
    path('api/notifications/<int:notification_id>/read/', api_views.api_mark_notification_read, name='api_mark_notification_read'),
    path('api/notifications/read-all/', api_views.api_mark_all_notifications_read, name='api_mark_all_notifications_read'),
    
    # Friends
    path('api/friends/', api_views.api_get_friends, name='api_get_friends'),
    path('api/friends/requests/', api_views.api_get_friend_requests, name='api_get_friend_requests'),
    path('api/friends/add/', api_views.api_send_friend_request, name='api_send_friend_request'),
    path('api/friends/<int:friendship_id>/respond/', api_views.api_respond_friend_request, name='api_respond_friend_request'),
    path('api/friends/<int:player_id>/remove/', api_views.api_remove_friend, name='api_remove_friend'),
    path('api/friends/check/<int:player_id>/', api_views.api_check_friendship, name='api_check_friendship'),
    
    # Password Reset
    path('api/password-reset/request/', api_views.api_request_password_reset, name='api_request_password_reset'),
    path('api/password-reset/confirm/', api_views.api_reset_password, name='api_reset_password'),
    path('api/change-password/', api_views.api_change_password, name='api_change_password'),
]
