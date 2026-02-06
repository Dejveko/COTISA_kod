"""
Django models for COTISA - Chess Tournament Management System
These models match the database schema from database_schema_base.sql
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone as django_timezone
import os
import uuid


def profile_picture_path(instance, filename):
    """Generate unique filename for profile pictures using UUID"""
    ext = filename.split('.')[-1].lower()
    if ext not in ['jpg', 'jpeg', 'png', 'gif']:
        ext = 'jpg'
    new_filename = f"profile_{uuid.uuid4().hex[:12]}.{ext}"
    return f"profile_pictures/{new_filename}"


class Role(models.Model):
    """User roles - defines what permissions each user type has"""
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    
    # Permissions
    can_create_tournament = models.BooleanField(default=False)
    can_manage_tournament = models.BooleanField(default=False)
    can_delete_tournament = models.BooleanField(default=False)
    can_manage_users = models.BooleanField(default=False)
    can_view_all_matches = models.BooleanField(default=True)
    can_edit_match_results = models.BooleanField(default=False)
    can_award_titles = models.BooleanField(default=False)
    can_access_admin_panel = models.BooleanField(default=False)
    can_view_reports = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    
    class Meta:
        db_table = 'roles'
        indexes = [
            models.Index(fields=['role_name'], name='idx_role_name'),
        ]
    
    def __str__(self):
        return self.role_name
    
    @property
    def is_admin(self):
        """Check if this role has admin privileges"""
        return self.role_name == 'admin'
    
    @property
    def is_player(self):
        """Check if this is a player role"""
        return self.role_name == 'player'


class PlayerManager(BaseUserManager):
    """Custom manager for Player model"""
    
    def create_user(self, username, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create and save a superuser (admin role)"""
        # Get or create admin role
        admin_role, created = Role.objects.get_or_create(
            role_name='admin',
            defaults={
                'description': 'Administrator - full dashboard access',
                'can_create_tournament': True,
                'can_manage_tournament': True,
                'can_delete_tournament': True,
                'can_manage_users': True,
                'can_view_all_matches': True,
                'can_edit_match_results': True,
                'can_award_titles': True,
                'can_access_admin_panel': True,
                'can_view_reports': True,
            }
        )
        extra_fields['role'] = admin_role
        
        return self.create_user(username, email, password, **extra_fields)


class Player(AbstractBaseUser, PermissionsMixin):
    """Player model - extends Django's auth user"""
    player_id = models.AutoField(primary_key=True)
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, db_column='role_id')
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255, db_column='password_hash')
    full_name = models.CharField(max_length=100, null=True, blank=True)
    profile_picture = models.ImageField(upload_to=profile_picture_path, default="default-avatar.png", null=True, blank=True)
    profile_picture_source = models.CharField(
        max_length=20,
        choices=[
            ('uploaded', 'Uploadana slika'),
            ('google', 'Google'),
            ('chesscom', 'Chess.com'),
        ],
        default='uploaded',
        help_text='Source of displayed profile picture'
    )
    active_title = models.ForeignKey("Title", on_delete=models.SET_NULL, null=True, blank=True, related_name="active_for_players", db_column="active_title_id", help_text="Currently displayed title")
    google_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    google_picture = models.CharField(max_length=500, null=True, blank=True)
    chesscom_username = models.CharField(max_length=100, null=True, blank=True, unique=True)
    chesscom_id = models.CharField(max_length=100, null=True, blank=True)
    chesscom_avatar = models.CharField(max_length=500, null=True, blank=True)
    date_joined = models.DateTimeField(default=django_timezone.now)
    
    # ELO ratings by game type
    elo_rating = models.IntegerField(default=1200)  # General/default rating
    elo_bullet = models.IntegerField(default=1200)   # < 3 minutes
    elo_blitz = models.IntegerField(default=1200)    # 3-10 minutes
    elo_rapid = models.IntegerField(default=1200)    # 10-60 minutes
    elo_daily = models.IntegerField(default=1200)    # Correspondence (daily)
    elo_puzzle = models.IntegerField(default=1200)   # Puzzle rating
    
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    total_matches = models.IntegerField(default=0)
    matches_played = models.IntegerField(default=0, help_text='Number of rated matches played')
    
    # Provisional status - shows yellow dot until 5 matches played
    is_provisional = models.BooleanField(default=True, help_text='True if player has played less than 5 matches')
    experience_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Novi (400 ELO)'),
            ('intermediate', 'Poznajem igru (700 ELO)'),
            ('advanced', 'Iskusan (1000 ELO)')
        ],
        default='intermediate',
        help_text='Initial experience level set during registration'
    )
    
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    auth_token = models.CharField(max_length=64, null=True, blank=True, unique=True, help_text='Authentication token for API requests')
    
    objects = PlayerManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'players'
        indexes = [
            models.Index(fields=['username'], name='idx_username'),
            models.Index(fields=['email'], name='idx_email'),
            models.Index(fields=['elo_rating'], name='idx_elo'),
            models.Index(fields=['role'], name='idx_role'),
        ]
    
    def __str__(self):
        return self.username
    
    # Properties for backward compatibility with Django admin
    @property
    def is_admin(self):
        """Check if user has admin role"""
        return self.role.role_name == 'admin'
    
    @property
    def is_staff(self):
        """Required by Django admin - check if user can access admin panel"""
        return self.role.can_access_admin_panel
    
    @property
    def is_superuser(self):
        """Check if user is admin"""
        return self.role.role_name == 'admin'
    
    def has_perm(self, perm, obj=None):
        """Check if user has specific permission"""
        if self.role.role_name == 'admin':
            return True
        return super().has_perm(perm, obj)
    
    def has_module_perms(self, app_label):
        """Check if user has permissions for app"""
        if self.role.role_name == 'admin':
            return True
        return super().has_module_perms(app_label)
    
    # Override password property to use password_hash column
    @property
    def password(self):
        return self.password_hash
    
    @password.setter
    def password(self, value):
        self.password_hash = value


class Title(models.Model):
    """Chess titles (Novice, Amateur, Expert, etc.)"""
    title_id = models.AutoField(primary_key=True)
    title_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    required_elo = models.IntegerField()
    required_wins = models.IntegerField(default=0)
    icon_class = models.CharField(max_length=50, null=True, blank=True)
    color_code = models.CharField(max_length=20, null=True, blank=True)
    display_order = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'titles'
        indexes = [
            models.Index(fields=['title_name'], name='idx_title_name'),
        ]
    
    def __str__(self):
        return self.title_name


class PlayerTitle(models.Model):
    """Player-Title relationship (many-to-many)"""
    player_title_id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    title = models.ForeignKey(Title, on_delete=models.CASCADE, db_column='title_id')
    awarded_date = models.DateTimeField(default=django_timezone.now)
    awarded_by = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, 
                                    related_name='titles_awarded', db_column='awarded_by')
    is_unlocked = models.BooleanField(default=False)
    auto_unlocked = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'player_titles'
        unique_together = [['player', 'title']]
        indexes = [
            models.Index(fields=['player'], name='idx_player_pt'),
            models.Index(fields=['is_unlocked'], name='idx_unlocked'),
        ]
    
    def __str__(self):
        return f"{self.player.username} - {self.title.title_name}"


class TournamentActive(models.Model):
    """Active and past tournaments with 6-digit join codes"""
    TOURNAMENT_STATUS = [
        ('upcoming', 'Upcoming'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TOURNAMENT_TYPE = [
        ('elimination', 'Elimination'),  # Single elimination knockout
        ('round_robin', 'Round Robin'),  # All play against all
        ('swiss', 'Swiss System'),       # Swiss pairing system
    ]
    
    TIME_CONTROL_TYPE = [
        ('bullet', 'Bullet'),   # < 3 minutes
        ('blitz', 'Blitz'),     # 3-10 minutes
        ('rapid', 'Rapid'),     # 10-60 minutes
        ('daily', 'Daily'),     # Correspondence chess
    ]
    
    PAIRING_SYSTEM = [
        ('random', 'Random'),       # Random opponent pairing
        ('manual', 'Manual'),       # Organizer chooses pairings
        ('rating', 'By Rating'),    # Pair by similar ELO
        ('swiss', 'Swiss System'),  # Swiss tournament system
    ]
    
    tournament_id = models.AutoField(primary_key=True)
    tournament_code = models.CharField(max_length=6, unique=True, help_text='6-digit join code')
    tournament_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='created_by')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    max_participants = models.IntegerField(default=16)
    current_participants = models.IntegerField(default=0)
    tournament_status = models.CharField(max_length=20, choices=TOURNAMENT_STATUS, default='upcoming')
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    prize_pool = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tournament_type = models.CharField(max_length=30, choices=TOURNAMENT_TYPE, default='elimination')
    
    # Time control settings
    time_control_type = models.CharField(max_length=20, choices=TIME_CONTROL_TYPE, default='blitz')
    time_control_minutes = models.IntegerField(default=5, help_text='Base time in minutes')
    time_increment_seconds = models.IntegerField(default=0, help_text='Increment per move in seconds')
    time_control = models.CharField(max_length=50, null=True, blank=True)  # Legacy field
    
    # Pairing settings
    pairing_system = models.CharField(max_length=20, choices=PAIRING_SYSTEM, default='random')
    pairings_confirmed = models.BooleanField(default=False, help_text='True if organizer confirmed manual pairings')
    
    # Round tracking
    current_round = models.IntegerField(default=1, help_text='Current round number for tournament progression')
    
    # Visibility settings
    is_public = models.BooleanField(default=True, help_text='If True, tournament appears in public listings')
    
    min_elo = models.IntegerField(default=0)
    max_elo = models.IntegerField(default=3000)
    code_expires_at = models.DateTimeField(null=True, blank=True, help_text='Code invalid after tournament ends')
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tournaments_active'
        indexes = [
            models.Index(fields=['tournament_status'], name='idx_status'),
            models.Index(fields=['start_date'], name='idx_start_date'),
            models.Index(fields=['tournament_code'], name='idx_tournament_code'),
        ]
    
    def __str__(self):
        return f"{self.tournament_name} ({self.tournament_code})"
    
    def generate_code(self):
        """Generate unique 6-digit tournament code"""
        import random
        while True:
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            if not TournamentActive.objects.filter(tournament_code=code).exists():
                return code
    
    def save(self, *args, **kwargs):
        """Auto-generate code if not set"""
        if not self.tournament_code:
            self.tournament_code = self.generate_code()
        super().save(*args, **kwargs)


class TournamentParticipant(models.Model):
    """Tournament participants"""
    participant_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(TournamentActive, on_delete=models.CASCADE, db_column='tournament_id')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    joined_date = models.DateTimeField(default=django_timezone.now)
    seed_number = models.IntegerField(null=True, blank=True)
    current_round = models.IntegerField(default=1)
    is_eliminated = models.BooleanField(default=False)
    placement = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'tournament_participants'
        unique_together = [['tournament', 'player']]
        indexes = [
            models.Index(fields=['tournament'], name='idx_tournament_tp'),
            models.Index(fields=['player'], name='idx_player_tp'),
        ]
    
    def __str__(self):
        return f"{self.player.username} in {self.tournament.tournament_name}"


class Match(models.Model):
    """Chess matches"""
    MATCH_STATUS = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('forfeited', 'Forfeited'),
    ]
    
    MATCH_RESULT = [
        ('white_win', 'White Win'),
        ('black_win', 'Black Win'),
        ('draw', 'Draw'),
        ('forfeit', 'Forfeit'),
    ]
    
    match_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(TournamentActive, on_delete=models.SET_NULL, null=True, blank=True, db_column='tournament_id')
    white_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='white_matches', db_column='white_player_id')
    black_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='black_matches', db_column='black_player_id')
    match_date = models.DateTimeField(default=django_timezone.now)
    match_status = models.CharField(max_length=20, choices=MATCH_STATUS, default='scheduled')
    result = models.CharField(max_length=20, choices=MATCH_RESULT, null=True, blank=True)
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, 
                                related_name='won_matches', db_column='winner_id')
    white_elo_before = models.IntegerField(null=True, blank=True)
    black_elo_before = models.IntegerField(null=True, blank=True)
    white_elo_after = models.IntegerField(null=True, blank=True)
    black_elo_after = models.IntegerField(null=True, blank=True)
    elo_change = models.IntegerField(null=True, blank=True)
    number_of_moves = models.IntegerField(null=True, blank=True)
    time_control = models.CharField(max_length=50, null=True, blank=True)
    pgn_notation = models.TextField(null=True, blank=True)
    round_number = models.IntegerField(default=1)
    match_duration_seconds = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'matches'
        indexes = [
            models.Index(fields=['tournament'], name='idx_tournament_m'),
            models.Index(fields=['white_player'], name='idx_white_player'),
            models.Index(fields=['black_player'], name='idx_black_player'),
            models.Index(fields=['match_date'], name='idx_match_date'),
            models.Index(fields=['match_status'], name='idx_status_m'),
        ]
    
    def __str__(self):
        return f"{self.white_player.username} vs {self.black_player.username}"


class MatchHistory(models.Model):
    """Match history archive"""
    MATCH_RESULT = [
        ('win', 'Win'),
        ('loss', 'Loss'),
        ('draw', 'Draw'),
    ]
    
    PLAYER_COLOR = [
        ('white', 'White'),
        ('black', 'Black'),
    ]
    
    history_id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, db_column='match_id')
    opponent = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='opponent_history', db_column='opponent_id')
    result = models.CharField(max_length=10, choices=MATCH_RESULT)
    player_color = models.CharField(max_length=10, choices=PLAYER_COLOR)
    elo_change = models.IntegerField()
    match_date = models.DateTimeField()
    tournament = models.ForeignKey(TournamentActive, on_delete=models.SET_NULL, null=True, blank=True, db_column='tournament_id')
    
    class Meta:
        db_table = 'match_history'
        indexes = [
            models.Index(fields=['player'], name='idx_player_mh'),
            models.Index(fields=['match_date'], name='idx_match_date_mh'),
            models.Index(fields=['result'], name='idx_result'),
        ]


class PlayerPreference(models.Model):
    """Player preferences and settings"""
    TIME_FORMAT = [
        ('blitz', 'Blitz'),
        ('rapid', 'Rapid'),
        ('classical', 'Classical'),
    ]
    
    preference_id = models.AutoField(primary_key=True)
    player = models.OneToOneField(Player, on_delete=models.CASCADE, db_column='player_id')
    country = models.CharField(max_length=100, default='Croatia')
    preferred_time_format = models.CharField(max_length=20, choices=TIME_FORMAT, default='rapid')
    theme = models.CharField(max_length=50, default='dark')
    board_style = models.CharField(max_length=50, default='classic')
    notification_email = models.BooleanField(default=True)
    notification_tournament_start = models.BooleanField(default=True)
    notification_match_result = models.BooleanField(default=True)
    notification_title_awarded = models.BooleanField(default=True)
    notification_registration = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='hr')
    timezone = models.CharField(max_length=50, default='Europe/Zagreb')
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'player_preferences'
        indexes = [
            models.Index(fields=['player'], name='idx_player_pp'),
        ]


class TournamentSetting(models.Model):
    """Tournament-specific settings"""
    SKILL_LEVEL = [
        ('all', 'All'),
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    TIME_FORMAT = [
        ('blitz', 'Blitz'),
        ('rapid', 'Rapid'),
        ('classical', 'Classical'),
    ]
    
    setting_id = models.AutoField(primary_key=True)
    tournament = models.OneToOneField(TournamentActive, on_delete=models.CASCADE, db_column='tournament_id')
    location = models.CharField(max_length=255, null=True, blank=True)
    organizer_name = models.CharField(max_length=100, null=True, blank=True)
    contact_email = models.EmailField(max_length=100, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    special_rules = models.TextField(null=True, blank=True)
    skill_level = models.CharField(max_length=20, choices=SKILL_LEVEL, default='all')
    time_format = models.CharField(max_length=20, choices=TIME_FORMAT)
    terms_agreed = models.BooleanField(default=False)
    notification_enabled = models.BooleanField(default=True)
    auto_pairing = models.BooleanField(default=True)
    allow_byes = models.BooleanField(default=True)
    max_rounds = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tournament_settings'
        indexes = [
            models.Index(fields=['tournament'], name='idx_tournament_ts'),
            models.Index(fields=['skill_level'], name='idx_skill_level'),
        ]


class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPE = [
        ('registration', 'Registration'),
        ('tournament_start', 'Tournament Start'),
        ('match_result', 'Match Result'),
        ('title_awarded', 'Title Awarded'),
        ('pairing_update', 'Pairing Update'),
        ('challenge', 'Challenge'),
        ('system', 'System'),
        ('admin', 'Admin'),
    ]
    
    notification_id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE, db_column='type', default='system')
    title = models.CharField(max_length=100, default='Obavijest')
    message = models.TextField()
    related_tournament = models.ForeignKey(TournamentActive, on_delete=models.CASCADE, null=True, blank=True, db_column='related_tournament_id')
    related_match = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True, db_column='related_match_id')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=django_timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['player'], name='idx_player_n'),
            models.Index(fields=['is_read'], name='idx_is_read'),
            models.Index(fields=['created_at'], name='idx_created_at'),
            models.Index(fields=['notification_type'], name='idx_type'),
        ]


class Achievement(models.Model):
    """Achievement definitions"""
    ACHIEVEMENT_CATEGORY = [
        ('tournament', 'Tournament'),
        ('match', 'Match'),
        ('special', 'Special'),
        ('social', 'Social'),
        ('milestone', 'Milestone'),
    ]
    
    REQUIREMENT_TYPE = [
        ('wins', 'Wins'),
        ('tournaments_played', 'Tournaments Played'),
        ('elo_reached', 'ELO Reached'),
        ('streak', 'Streak'),
        ('special', 'Special'),
    ]
    
    achievement_id = models.AutoField(primary_key=True)
    achievement_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    icon_class = models.CharField(max_length=50, null=True, blank=True)
    points = models.IntegerField(default=0)
    category = models.CharField(max_length=20, choices=ACHIEVEMENT_CATEGORY, default='tournament')
    requirement_type = models.CharField(max_length=30, choices=REQUIREMENT_TYPE)
    requirement_value = models.IntegerField(null=True, blank=True)
    is_secret = models.BooleanField(default=False)
    display_order = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    
    class Meta:
        db_table = 'achievements'
        indexes = [
            models.Index(fields=['category'], name='idx_category'),
            models.Index(fields=['achievement_name'], name='idx_achievement_name'),
        ]
    
    def __str__(self):
        return self.achievement_name


class PlayerAchievement(models.Model):
    """Player-Achievement tracking"""
    player_achievement_id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, db_column='achievement_id')
    unlocked_date = models.DateTimeField(default=django_timezone.now)
    progress = models.IntegerField(default=0)
    is_unlocked = models.BooleanField(default=False)
    notified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'player_achievements'
        unique_together = [['player', 'achievement']]
        indexes = [
            models.Index(fields=['player'], name='idx_player_pa'),
            models.Index(fields=['is_unlocked'], name='idx_unlocked_pa'),
        ]


class TournamentRegistration(models.Model):
    """Tournament registration requests"""
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('waived', 'Waived'),
        ('refunded', 'Refunded'),
    ]
    
    REGISTRATION_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
        ('cancelled', 'Cancelled'),
    ]
    
    registration_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(TournamentActive, on_delete=models.CASCADE, db_column='tournament_id')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    registration_date = models.DateTimeField(default=django_timezone.now)
    player_rating_at_registration = models.IntegerField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    terms_accepted = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=REGISTRATION_STATUS, default='pending')
    withdrawal_reason = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tournament_registration'
        unique_together = [['tournament', 'player']]
        indexes = [
            models.Index(fields=['tournament'], name='idx_tournament_tr'),
            models.Index(fields=['player'], name='idx_player_tr'),
            models.Index(fields=['status'], name='idx_status_tr'),
            models.Index(fields=['payment_status'], name='idx_payment_status'),
        ]


class TournamentRound(models.Model):
    """Tournament rounds"""
    ROUND_STATUS = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    round_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(TournamentActive, on_delete=models.CASCADE, db_column='tournament_id')
    round_number = models.IntegerField()
    round_status = models.CharField(max_length=20, choices=ROUND_STATUS, default='scheduled')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tournament_rounds'
        unique_together = [['tournament', 'round_number']]
        indexes = [
            models.Index(fields=['tournament'], name='idx_tournament_tround'),
            models.Index(fields=['round_number'], name='idx_round_number'),
            models.Index(fields=['round_status'], name='idx_status_tround'),
        ]


class MatchPairing(models.Model):
    """Match pairings in tournament rounds"""
    PAIRING_RESULT = [
        ('white_win', 'White Win'),
        ('black_win', 'Black Win'),
        ('draw', 'Draw'),
        ('forfeit', 'Forfeit'),
        ('bye', 'Bye'),
        ('pending', 'Pending'),
    ]
    
    pairing_id = models.AutoField(primary_key=True)
    round = models.ForeignKey(TournamentRound, on_delete=models.CASCADE, db_column='round_id')
    match = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, blank=True, db_column='match_id')
    board_number = models.IntegerField()
    white_player = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True, 
                                      related_name='white_pairings', db_column='white_player_id')
    black_player = models.ForeignKey(Player, on_delete=models.CASCADE, null=True, blank=True, 
                                      related_name='black_pairings', db_column='black_player_id')
    bye_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, 
                                    related_name='bye_pairings', db_column='bye_player_id')
    result = models.CharField(max_length=20, choices=PAIRING_RESULT, default='pending')
    is_bye = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=django_timezone.now)
    
    class Meta:
        db_table = 'match_pairings'
        indexes = [
            models.Index(fields=['round'], name='idx_round'),
            models.Index(fields=['board_number'], name='idx_board_number'),
            models.Index(fields=['match'], name='idx_match_mp'),
        ]


class PrizeDistribution(models.Model):
    """Prize distribution per tournament"""
    PRIZE_TYPE = [
        ('cash', 'Cash'),
        ('trophy', 'Trophy'),
        ('certificate', 'Certificate'),
        ('medal', 'Medal'),
        ('other', 'Other'),
    ]
    
    prize_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(TournamentActive, on_delete=models.CASCADE, db_column='tournament_id')
    placement = models.IntegerField()
    prize_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prize_type = models.CharField(max_length=20, choices=PRIZE_TYPE, default='cash')
    prize_description = models.TextField(null=True, blank=True)
    awarded_to_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, db_column='awarded_to_player_id')
    awarded_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    
    class Meta:
        db_table = 'prize_distribution'
        indexes = [
            models.Index(fields=['tournament'], name='idx_tournament_pd'),
            models.Index(fields=['placement'], name='idx_placement'),
        ]


class PlayerStatsHistory(models.Model):
    """Historical player statistics"""
    stat_id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='player_id')
    recorded_date = models.DateField()
    elo_rating = models.IntegerField()
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    total_matches = models.IntegerField(default=0)
    tournaments_played = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)
    highest_elo = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'player_stats_history'
        unique_together = [['player', 'recorded_date']]
        indexes = [
            models.Index(fields=['player'], name='idx_player_psh'),
            models.Index(fields=['recorded_date'], name='idx_date'),
            models.Index(fields=['elo_rating'], name='idx_elo_psh'),
        ]


class AdminLog(models.Model):
    """Admin action audit trail"""
    ACTION_TYPE = [
        ('award_title', 'Award Title'),
        ('revoke_title', 'Revoke Title'),
        ('edit_tournament', 'Edit Tournament'),
        ('delete_tournament', 'Delete Tournament'),
        ('ban_player', 'Ban Player'),
        ('unban_player', 'Unban Player'),
        ('edit_match', 'Edit Match'),
        ('delete_match', 'Delete Match'),
        ('system_config', 'System Config'),
        ('other', 'Other'),
    ]
    
    log_id = models.AutoField(primary_key=True)
    admin = models.ForeignKey(Player, on_delete=models.CASCADE, db_column='admin_id')
    action_type = models.CharField(max_length=30, choices=ACTION_TYPE)
    target_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, 
                                       related_name='admin_actions', db_column='target_player_id')
    target_tournament = models.ForeignKey(TournamentActive, on_delete=models.SET_NULL, null=True, blank=True, db_column='target_tournament_id')
    target_match = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, blank=True, db_column='target_match_id')
    details = models.TextField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    
    class Meta:
        db_table = 'admin_logs'
        indexes = [
            models.Index(fields=['admin'], name='idx_admin'),
            models.Index(fields=['action_type'], name='idx_action_type'),
            models.Index(fields=['created_at'], name='idx_created_at_al'),
        ]


class Friendship(models.Model):
    """Friendships between players"""
    FRIENDSHIP_STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('blocked', 'Blocked'),
    ]
    
    friendship_id = models.AutoField(primary_key=True)
    from_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friendships_sent', db_column='from_player_id')
    to_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friendships_received', db_column='to_player_id')
    status = models.CharField(max_length=20, choices=FRIENDSHIP_STATUS, default='pending')
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'friendships'
        unique_together = ('from_player', 'to_player')
        indexes = [
            models.Index(fields=['from_player'], name='idx_from_player'),
            models.Index(fields=['to_player'], name='idx_to_player'),
            models.Index(fields=['status'], name='idx_friendship_status'),
        ]
    
    def __str__(self):
        return f"{self.from_player.username} -> {self.to_player.username} ({self.status})"


class Game(models.Model):
    """Chess game/match between two players"""
    GAME_STATUS = [
        ('waiting', 'Waiting for opponent'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    RESULT = [
        ('white_win', 'White Wins'),
        ('black_win', 'Black Wins'),
        ('draw', 'Draw'),
        ('stalemate', 'Stalemate'),
        ('timeout', 'Timeout'),
        ('resignation', 'Resignation'),
        (None, 'Not finished'),
    ]
    
    game_id = models.AutoField(primary_key=True)
    tournament = models.ForeignKey(TournamentActive, on_delete=models.CASCADE, null=True, blank=True, db_column='tournament_id')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True, db_column='match_id')
    
    white_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='games_as_white', db_column='white_player_id')
    black_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='games_as_black', db_column='black_player_id')
    
    status = models.CharField(max_length=20, choices=GAME_STATUS, default='waiting')
    result = models.CharField(max_length=20, choices=RESULT, null=True, blank=True)
    
    # Chess game state
    pgn = models.TextField(null=True, blank=True)  # Portable Game Notation - full game record
    fen = models.CharField(max_length=100, default='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')  # Forsyth-Edwards Notation - current position
    move_history = models.TextField(null=True, blank=True)  # JSON array of moves
    current_turn = models.CharField(max_length=10, default='white')  # 'white' or 'black'
    move_count = models.IntegerField(default=0)
    
    # Time controls
    time_control_minutes = models.IntegerField(null=True, blank=True)
    time_increment_seconds = models.IntegerField(default=0)
    white_time_remaining = models.IntegerField(null=True, blank=True)  # seconds
    black_time_remaining = models.IntegerField(null=True, blank=True)  # seconds
    last_move_time = models.DateTimeField(null=True, blank=True)
    
    # Player join tracking
    white_joined = models.BooleanField(default=False)
    black_joined = models.BooleanField(default=False)
    
    # Draw offer tracking
    white_offers_draw = models.BooleanField(default=False)
    black_offers_draw = models.BooleanField(default=False)
    
    # Metadata
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    
    class Meta:
        db_table = 'games'
        indexes = [
            models.Index(fields=['tournament'], name='idx_game_tournament'),
            models.Index(fields=['white_player'], name='idx_game_white_player'),
            models.Index(fields=['black_player'], name='idx_game_black_player'),
            models.Index(fields=['status'], name='idx_game_status'),
            models.Index(fields=['created_at'], name='idx_game_created'),
        ]
    
    def __str__(self):
        return f"Game {self.game_id}: {self.white_player.username} vs {self.black_player.username}"

