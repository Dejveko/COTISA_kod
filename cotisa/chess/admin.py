"""
Admin configuration for COTISA
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Role, Player, Title, PlayerTitle, TournamentActive, TournamentParticipant,
    Match, MatchHistory, PlayerPreference, TournamentSetting,
    Notification, Achievement, PlayerAchievement, TournamentRegistration,
    TournamentRound, MatchPairing, PrizeDistribution, PlayerStatsHistory, AdminLog
)


class PlayerAdmin(BaseUserAdmin):
    """Custom admin for Player model"""
    list_display = ('username', 'email', 'full_name', 'elo_rating', 'wins', 'losses', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'full_name')
    ordering = ('-elo_rating',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'full_name', 'profile_picture')}),
        ('Role & Permissions', {'fields': ('role', 'is_active')}),
        ('Chess Stats', {'fields': ('elo_rating', 'wins', 'losses', 'draws', 'total_matches')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )


@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ('title_name', 'required_elo', 'required_wins', 'display_order')
    ordering = ('display_order',)


@admin.register(PlayerTitle)
class PlayerTitleAdmin(admin.ModelAdmin):
    list_display = ('player', 'title', 'is_unlocked', 'awarded_date', 'auto_unlocked')
    list_filter = ('is_unlocked', 'auto_unlocked')
    search_fields = ('player__username', 'title__title_name')


@admin.register(TournamentActive)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('tournament_name', 'tournament_status', 'start_date', 'current_participants', 'max_participants')
    list_filter = ('tournament_status', 'tournament_type')
    search_fields = ('tournament_name', 'description')
    date_hierarchy = 'start_date'


@admin.register(TournamentParticipant)
class TournamentParticipantAdmin(admin.ModelAdmin):
    list_display = ('player', 'tournament', 'joined_date', 'is_eliminated', 'placement')
    list_filter = ('is_eliminated', 'tournament')
    search_fields = ('player__username', 'tournament__tournament_name')


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('white_player', 'black_player', 'match_status', 'result', 'match_date', 'tournament')
    list_filter = ('match_status', 'result')
    search_fields = ('white_player__username', 'black_player__username')
    date_hierarchy = 'match_date'


@admin.register(MatchHistory)
class MatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('player', 'opponent', 'result', 'player_color', 'elo_change', 'match_date')
    list_filter = ('result', 'player_color')
    search_fields = ('player__username', 'opponent__username')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('player', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('player__username', 'title', 'message')
    date_hierarchy = 'created_at'


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('achievement_name', 'category', 'requirement_type', 'requirement_value', 'points')
    list_filter = ('category', 'requirement_type')
    ordering = ('display_order',)


@admin.register(PlayerAchievement)
class PlayerAchievementAdmin(admin.ModelAdmin):
    list_display = ('player', 'achievement', 'is_unlocked', 'progress', 'unlocked_date')
    list_filter = ('is_unlocked',)
    search_fields = ('player__username', 'achievement__achievement_name')


@admin.register(TournamentRegistration)
class TournamentRegistrationAdmin(admin.ModelAdmin):
    list_display = ('player', 'tournament', 'status', 'payment_status', 'registration_date')
    list_filter = ('status', 'payment_status')
    search_fields = ('player__username', 'tournament__tournament_name')


@admin.register(TournamentRound)
class TournamentRoundAdmin(admin.ModelAdmin):
    list_display = ('tournament', 'round_number', 'round_status', 'start_time')
    list_filter = ('round_status',)


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ('admin', 'action_type', 'target_player', 'created_at')
    list_filter = ('action_type',)
    search_fields = ('admin__username', 'details')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'description', 'can_access_admin_panel', 'can_manage_tournament', 'is_active')
    list_filter = ('can_access_admin_panel', 'can_manage_tournament', 'is_active')
    search_fields = ('role_name', 'description')
    fieldsets = (
        ('Basic Info', {'fields': ('role_name', 'description', 'is_active')}),
        ('Tournament Permissions', {
            'fields': ('can_create_tournament', 'can_manage_tournament', 'can_delete_tournament')
        }),
        ('User Management', {
            'fields': ('can_manage_users', 'can_award_titles')
        }),
        ('Match & Reports', {
            'fields': ('can_view_all_matches', 'can_edit_match_results', 'can_view_reports')
        }),
        ('Admin Access', {
            'fields': ('can_access_admin_panel',)
        }),
    )


# Register remaining models
admin.site.register(Player, PlayerAdmin)
admin.site.register(PlayerPreference)
admin.site.register(TournamentSetting)
admin.site.register(MatchPairing)
admin.site.register(PrizeDistribution)
admin.site.register(PlayerStatsHistory)

# Customize admin site
admin.site.site_header = "COTISA Admin"
admin.site.site_title = "COTISA"
admin.site.index_title = "Chess Tournament Management"
