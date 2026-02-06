"""
Comprehensive Test Suite for COTISA Chess Tournament Management System
=======================================================================
Tests cover:
- Models and database relationships
- ELO rating calculations
- API endpoints
- Authentication
- Tournament operations
"""

from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from decimal import Decimal
import json

from .models import (
    Player, Role, TournamentActive, Match, 
    TournamentParticipant, TournamentRegistration,
    Title, PlayerTitle, Achievement, Notification, Friendship
)
from . import elo_rating


# ============================================
# ELO RATING TESTS
# ============================================

class EloRatingTests(TestCase):
    """Test ELO rating calculation functions"""
    
    def test_expected_score_equal_ratings(self):
        """Two players with equal ratings should have 0.5 expected score"""
        expected = elo_rating.calculate_expected_score(1500, 1500)
        self.assertAlmostEqual(expected, 0.5, places=4)
    
    def test_expected_score_higher_rating_advantage(self):
        """Higher rated player should have > 0.5 expected score"""
        expected = elo_rating.calculate_expected_score(1700, 1500)
        self.assertGreater(expected, 0.5)
        self.assertLess(expected, 1.0)
    
    def test_expected_score_lower_rating_disadvantage(self):
        """Lower rated player should have < 0.5 expected score"""
        expected = elo_rating.calculate_expected_score(1300, 1500)
        self.assertLess(expected, 0.5)
        self.assertGreater(expected, 0.0)
    
    def test_expected_score_200_point_difference(self):
        """200 ELO difference should give ~0.76 expected score"""
        expected = elo_rating.calculate_expected_score(1700, 1500)
        self.assertAlmostEqual(expected, 0.76, places=1)
    
    def test_expected_score_400_point_difference(self):
        """400 ELO difference should give ~0.91 expected score"""
        expected = elo_rating.calculate_expected_score(1900, 1500)
        self.assertAlmostEqual(expected, 0.91, places=1)
    
    def test_k_factor_provisional_player(self):
        """Provisional players (< 5 matches) should have K=40"""
        k = elo_rating.get_k_factor(matches_played=3, rating=1500)
        self.assertEqual(k, 40)
    
    def test_k_factor_new_player(self):
        """New players (5-30 matches) should have K=32"""
        k = elo_rating.get_k_factor(matches_played=15, rating=1500)
        self.assertEqual(k, 32)
    
    def test_k_factor_established_player(self):
        """Established players (30+ matches) should have K=24"""
        k = elo_rating.get_k_factor(matches_played=50, rating=1800)
        self.assertEqual(k, 24)
    
    def test_k_factor_master_player(self):
        """Master players (2400+ rating) should have K=16"""
        k = elo_rating.get_k_factor(matches_played=100, rating=2500)
        self.assertEqual(k, 16)
    
    def test_calculate_new_rating_win(self):
        """Winner should gain ELO points"""
        new_rating = elo_rating.calculate_new_rating(
            current_rating=1500,
            opponent_rating=1500,
            actual_score=1.0,  # Win
            matches_played=20
        )
        self.assertGreater(new_rating, 1500)
    
    def test_calculate_new_rating_loss(self):
        """Loser should lose ELO points"""
        new_rating = elo_rating.calculate_new_rating(
            current_rating=1500,
            opponent_rating=1500,
            actual_score=0.0,  # Loss
            matches_played=20
        )
        self.assertLess(new_rating, 1500)
    
    def test_calculate_new_rating_draw(self):
        """Draw against equal opponent should not change rating significantly"""
        new_rating = elo_rating.calculate_new_rating(
            current_rating=1500,
            opponent_rating=1500,
            actual_score=0.5,  # Draw
            matches_played=20
        )
        self.assertAlmostEqual(new_rating, 1500, places=0)
    
    def test_upset_win_gives_more_points(self):
        """Lower rated player winning should gain more points"""
        # Lower rated player wins
        gain_upset = elo_rating.calculate_new_rating(1300, 1700, 1.0, 20) - 1300
        # Higher rated player wins
        gain_expected = elo_rating.calculate_new_rating(1700, 1300, 1.0, 20) - 1700
        
        self.assertGreater(gain_upset, gain_expected)


# ============================================
# MODEL TESTS
# ============================================

class RoleModelTests(TestCase):
    """Test Role model"""
    
    def setUp(self):
        self.admin_role = Role.objects.create(
            role_name='admin',
            description='Administrator',
            can_create_tournament=True,
            can_manage_tournament=True,
            can_delete_tournament=True,
            can_manage_users=True,
            can_access_admin_panel=True
        )
        self.player_role = Role.objects.create(
            role_name='player',
            description='Regular player'
        )
    
    def test_admin_role_is_admin(self):
        """Admin role should return True for is_admin property"""
        self.assertTrue(self.admin_role.is_admin)
    
    def test_player_role_is_not_admin(self):
        """Player role should return False for is_admin property"""
        self.assertFalse(self.player_role.is_admin)
    
    def test_player_role_is_player(self):
        """Player role should return True for is_player property"""
        self.assertTrue(self.player_role.is_player)
    
    def test_role_string_representation(self):
        """Role __str__ should return role_name"""
        self.assertEqual(str(self.admin_role), 'admin')


class PlayerModelTests(TestCase):
    """Test Player model"""
    
    def setUp(self):
        self.role = Role.objects.create(role_name='player')
        self.player = Player.objects.create_user(
            username='testplayer',
            email='test@example.com',
            password='testpass123',
            role=self.role
        )
    
    def test_player_creation(self):
        """Player should be created with default values"""
        self.assertEqual(self.player.username, 'testplayer')
        self.assertEqual(self.player.email, 'test@example.com')
        self.assertEqual(self.player.elo_rating, 1200)
        self.assertEqual(self.player.wins, 0)
        self.assertEqual(self.player.losses, 0)
        self.assertEqual(self.player.draws, 0)
        self.assertTrue(self.player.is_provisional)
    
    def test_player_password_is_hashed(self):
        """Password should not be stored in plain text"""
        self.assertNotEqual(self.player.password_hash, 'testpass123')
        self.assertTrue(self.player.check_password('testpass123'))
    
    def test_player_string_representation(self):
        """Player __str__ should return username"""
        self.assertEqual(str(self.player), 'testplayer')
    
    def test_player_unique_username(self):
        """Username should be unique"""
        with self.assertRaises(Exception):
            Player.objects.create_user(
                username='testplayer',
                email='another@example.com',
                password='pass123',
                role=self.role
            )
    
    def test_player_unique_email(self):
        """Email should be unique"""
        with self.assertRaises(Exception):
            Player.objects.create_user(
                username='anotherplayer',
                email='test@example.com',
                password='pass123',
                role=self.role
            )
    
    def test_superuser_creation(self):
        """Superuser should have admin role"""
        superuser = Player.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass'
        )
        self.assertTrue(superuser.role.is_admin)


class TournamentModelTests(TestCase):
    """Test Tournament model"""
    
    def setUp(self):
        self.role = Role.objects.create(role_name='admin', can_create_tournament=True)
        self.organizer = Player.objects.create_user(
            username='organizer',
            email='org@example.com',
            password='pass123',
            role=self.role
        )
        self.tournament = TournamentActive.objects.create(
            tournament_name='Test Tournament',
            organizer=self.organizer,
            format_type='elimination',
            max_participants=16,
            time_control_minutes=10,
            increment_seconds=5,
            join_code='ABC123'
        )
    
    def test_tournament_creation(self):
        """Tournament should be created with correct values"""
        self.assertEqual(self.tournament.tournament_name, 'Test Tournament')
        self.assertEqual(self.tournament.status, 'upcoming')
        self.assertEqual(self.tournament.current_participants, 0)
    
    def test_tournament_string_representation(self):
        """Tournament __str__ should return tournament name"""
        self.assertEqual(str(self.tournament), 'Test Tournament')
    
    def test_tournament_is_full_false(self):
        """Tournament should not be full initially"""
        self.assertFalse(self.tournament.is_full)
    
    def test_tournament_can_join_initially(self):
        """New tournament should be joinable"""
        self.assertTrue(self.tournament.can_join)


# ============================================
# API TESTS
# ============================================

class AuthenticationAPITests(TestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.role = Role.objects.create(role_name='player')
        self.player = Player.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role=self.role
        )
    
    def test_register_success(self):
        """Registration with valid data should succeed"""
        response = self.client.post(
            '/api/register/',
            data=json.dumps({
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'newpass123',
                'password_confirm': 'newpass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('token', data)
        self.assertEqual(data['username'], 'newuser')
    
    def test_register_duplicate_username(self):
        """Registration with existing username should fail"""
        response = self.client.post(
            '/api/register/',
            data=json.dumps({
                'username': 'testuser',
                'email': 'other@example.com',
                'password': 'pass123',
                'password_confirm': 'pass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_register_password_mismatch(self):
        """Registration with mismatched passwords should fail"""
        response = self.client.post(
            '/api/register/',
            data=json.dumps({
                'username': 'newuser2',
                'email': 'new2@example.com',
                'password': 'pass123',
                'password_confirm': 'different'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_login_success(self):
        """Login with valid credentials should return token"""
        response = self.client.post(
            '/api/login/',
            data=json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('token', data)
        self.assertEqual(data['username'], 'testuser')
    
    def test_login_invalid_credentials(self):
        """Login with invalid credentials should fail"""
        response = self.client.post(
            '/api/login/',
            data=json.dumps({
                'username': 'testuser',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_me_endpoint_with_token(self):
        """GET /api/me/ with valid token should return user info"""
        # First login to get token
        login_response = self.client.post(
            '/api/login/',
            data=json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        token = login_response.json().get('token')
        
        # Then call /api/me/
        response = self.client.get(
            '/api/me/',
            HTTP_X_AUTH_TOKEN=token
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['username'], 'testuser')
    
    def test_me_endpoint_without_token(self):
        """GET /api/me/ without token should fail"""
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, 401)


class TournamentAPITests(TestCase):
    """Test tournament API endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.admin_role = Role.objects.create(
            role_name='admin',
            can_create_tournament=True,
            can_manage_tournament=True
        )
        self.player_role = Role.objects.create(role_name='player')
        
        self.admin = Player.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass',
            role=self.admin_role
        )
        self.admin.auth_token = 'admin-token-123'
        self.admin.save()
        
        self.player = Player.objects.create_user(
            username='player1',
            email='player@example.com',
            password='playerpass',
            role=self.player_role
        )
        self.player.auth_token = 'player-token-123'
        self.player.save()
    
    def test_create_tournament_as_admin(self):
        """Admin should be able to create tournament"""
        response = self.client.post(
            '/api/tournaments/create/',
            data=json.dumps({
                'tournament_name': 'New Tournament',
                'format_type': 'elimination',
                'max_participants': 8,
                'time_control_minutes': 10,
                'increment_seconds': 5
            }),
            content_type='application/json',
            HTTP_X_AUTH_TOKEN='admin-token-123'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('join_code', data)
        self.assertEqual(data['tournament_name'], 'New Tournament')
    
    def test_list_tournaments(self):
        """Should list all public tournaments"""
        # Create a tournament first
        TournamentActive.objects.create(
            tournament_name='Public Tournament',
            organizer=self.admin,
            format_type='elimination',
            max_participants=8,
            is_public=True,
            join_code='PUB123'
        )
        
        response = self.client.get('/api/tournaments/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
    
    def test_join_tournament_with_code(self):
        """Player should be able to join tournament with valid code"""
        tournament = TournamentActive.objects.create(
            tournament_name='Join Test Tournament',
            organizer=self.admin,
            format_type='elimination',
            max_participants=8,
            join_code='JOIN99'
        )
        
        response = self.client.post(
            '/api/tournaments/join/',
            data=json.dumps({'join_code': 'JOIN99'}),
            content_type='application/json',
            HTTP_X_AUTH_TOKEN='player-token-123'
        )
        self.assertEqual(response.status_code, 200)
    
    def test_join_tournament_invalid_code(self):
        """Joining with invalid code should fail"""
        response = self.client.post(
            '/api/tournaments/join/',
            data=json.dumps({'join_code': 'INVALID'}),
            content_type='application/json',
            HTTP_X_AUTH_TOKEN='player-token-123'
        )
        self.assertEqual(response.status_code, 404)


class MatchAPITests(TestCase):
    """Test match-related API endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.role = Role.objects.create(role_name='admin', can_edit_match_results=True)
        
        self.player1 = Player.objects.create_user(
            username='player1', email='p1@example.com', password='pass', role=self.role
        )
        self.player1.auth_token = 'p1-token'
        self.player1.save()
        
        self.player2 = Player.objects.create_user(
            username='player2', email='p2@example.com', password='pass', role=self.role
        )
        
        self.tournament = TournamentActive.objects.create(
            tournament_name='Match Test Tournament',
            organizer=self.player1,
            format_type='elimination',
            max_participants=8,
            status='in_progress',
            join_code='MATCH1'
        )
        
        self.match = Match.objects.create(
            tournament=self.tournament,
            white_player=self.player1,
            black_player=self.player2,
            round_number=1,
            match_number=1,
            status='pending'
        )
    
    def test_get_tournament_matches(self):
        """Should return matches for a tournament"""
        response = self.client.get(
            f'/api/tournaments/{self.tournament.tournament_id}/matches/',
            HTTP_X_AUTH_TOKEN='p1-token'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)


# ============================================
# HELPER FUNCTION TESTS
# ============================================

class HelperFunctionTests(TestCase):
    """Test helper functions"""
    
    def test_join_code_generation_uniqueness(self):
        """Generated join codes should be unique"""
        from .helpers import generate_join_code
        codes = set()
        for _ in range(100):
            code = generate_join_code()
            self.assertNotIn(code, codes)
            codes.add(code)
    
    def test_join_code_format(self):
        """Join code should be 6 alphanumeric characters"""
        from .helpers import generate_join_code
        code = generate_join_code()
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isalnum())
        self.assertTrue(code.isupper())


# ============================================
# FRIENDSHIP TESTS
# ============================================

class FriendshipModelTests(TestCase):
    """Test Friendship model"""
    
    def setUp(self):
        self.role = Role.objects.create(role_name='player')
        self.player1 = Player.objects.create_user(
            username='user1', email='u1@example.com', password='pass', role=self.role
        )
        self.player2 = Player.objects.create_user(
            username='user2', email='u2@example.com', password='pass', role=self.role
        )
    
    def test_friendship_creation(self):
        """Friendship should be created with pending status"""
        friendship = Friendship.objects.create(
            from_player=self.player1,
            to_player=self.player2
        )
        self.assertEqual(friendship.status, 'pending')
    
    def test_friendship_accept(self):
        """Accepting friendship should change status"""
        friendship = Friendship.objects.create(
            from_player=self.player1,
            to_player=self.player2
        )
        friendship.status = 'accepted'
        friendship.save()
        self.assertEqual(friendship.status, 'accepted')


# ============================================
# NOTIFICATION TESTS
# ============================================

class NotificationTests(TestCase):
    """Test Notification model"""
    
    def setUp(self):
        self.role = Role.objects.create(role_name='player')
        self.player = Player.objects.create_user(
            username='notifyuser', email='notify@example.com', password='pass', role=self.role
        )
    
    def test_notification_creation(self):
        """Notification should be created with is_read=False"""
        notification = Notification.objects.create(
            player=self.player,
            title='Test Notification',
            message='This is a test',
            notification_type='info'
        )
        self.assertFalse(notification.is_read)
    
    def test_notification_mark_as_read(self):
        """Notification can be marked as read"""
        notification = Notification.objects.create(
            player=self.player,
            title='Test',
            message='Test message',
            notification_type='info'
        )
        notification.is_read = True
        notification.save()
        self.assertTrue(notification.is_read)


# ============================================
# INTEGRATION TESTS
# ============================================

class TournamentFlowTests(TestCase):
    """Integration tests for tournament flow"""
    
    def setUp(self):
        self.client = Client()
        self.admin_role = Role.objects.create(
            role_name='admin',
            can_create_tournament=True,
            can_manage_tournament=True
        )
        self.player_role = Role.objects.create(role_name='player')
        
        # Create admin
        self.admin = Player.objects.create_user(
            username='tournament_admin',
            email='tadmin@example.com',
            password='adminpass',
            role=self.admin_role
        )
        self.admin.auth_token = 'tadmin-token'
        self.admin.save()
        
        # Create players
        self.players = []
        for i in range(4):
            player = Player.objects.create_user(
                username=f'tplayer{i}',
                email=f'tplayer{i}@example.com',
                password='pass',
                role=self.player_role
            )
            player.auth_token = f'tplayer{i}-token'
            player.save()
            self.players.append(player)
    
    def test_full_tournament_creation_and_join_flow(self):
        """Test creating a tournament and having players join"""
        # 1. Create tournament
        create_response = self.client.post(
            '/api/tournaments/create/',
            data=json.dumps({
                'tournament_name': 'Integration Test Tournament',
                'format_type': 'elimination',
                'max_participants': 4,
                'time_control_minutes': 5,
                'increment_seconds': 3
            }),
            content_type='application/json',
            HTTP_X_AUTH_TOKEN='tadmin-token'
        )
        self.assertEqual(create_response.status_code, 200)
        tournament_data = create_response.json()
        join_code = tournament_data['join_code']
        
        # 2. Have players join
        for i, player in enumerate(self.players):
            join_response = self.client.post(
                '/api/tournaments/join/',
                data=json.dumps({'join_code': join_code}),
                content_type='application/json',
                HTTP_X_AUTH_TOKEN=f'tplayer{i}-token'
            )
            self.assertEqual(join_response.status_code, 200)
        
        # 3. Verify participants count
        tournament = TournamentActive.objects.get(join_code=join_code)
        self.assertEqual(tournament.current_participants, 4)
        self.assertTrue(tournament.is_full)
        self.assertEqual(self.player.elo_rating, 1200)
        self.assertTrue(self.player.is_active)
    
    def test_player_str(self):
        """Test string representation"""
        self.assertEqual(str(self.player), 'testplayer')


class TitleModelTest(TestCase):
    """Test Title model"""
    
    def setUp(self):
        self.title = Title.objects.create(
            title_name='Novice',
            description='Beginner',
            required_elo=0,
            required_wins=0
        )
    
    def test_title_creation(self):
        """Test title was created correctly"""
        self.assertEqual(self.title.title_name, 'Novice')
        self.assertEqual(self.title.required_elo, 0)
    
    def test_title_str(self):
        """Test string representation"""
        self.assertEqual(str(self.title), 'Novice')
