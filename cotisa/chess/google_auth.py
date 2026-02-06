"""
Google OAuth 2.0 Authentication Helper
Handles Google Sign-In verification and user management
"""
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from .models import Player, Role


def verify_google_token(token):
    """
    Verify Google ID token and return user info
    
    Args:
        token: Google ID token from frontend
        
    Returns:
        dict: User info from Google (sub, email, name, picture)
        None: If verification fails
    """
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
        
        # Token is valid, return user info
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo.get('name', ''),
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
    except ValueError as e:
        # Invalid token
        print(f"Google token verification failed: {e}")
        return None
    except Exception as e:
        print(f"Error verifying Google token: {e}")
        return None


def get_or_create_google_user(google_info):
    """
    Get existing user by Google ID or create new user
    
    Args:
        google_info: Dict with google_id, email, name, picture
        
    Returns:
        Player: User instance
        bool: True if user was created, False if existing
    """
    google_id = google_info['google_id']
    email = google_info['email']
    
    # Try to find user by Google ID first
    try:
        user = Player.objects.get(google_id=google_id)
        # Update picture if changed
        if google_info.get('picture') and user.google_picture != google_info['picture']:
            user.google_picture = google_info['picture']
            user.save()
        return user, False
    except Player.DoesNotExist:
        pass
    
    # Try to find user by email (link existing account)
    try:
        user = Player.objects.get(email=email)
        # Link Google account to existing user
        user.google_id = google_id
        user.google_picture = google_info.get('picture', '')
        if not user.full_name and google_info.get('name'):
            user.full_name = google_info['name']
        if google_info.get('picture') and user.profile_picture == 'default-avatar.png':
            user.profile_picture = google_info['picture']
        user.save()
        return user, False
    except Player.DoesNotExist:
        pass
    
    # Create new user from Google account
    player_role = Role.objects.get(role_name='player')
    
    # Generate username from email or name
    username = email.split('@')[0]
    base_username = username
    counter = 1
    while Player.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    user = Player.objects.create(
        username=username,
        email=email,
        password_hash='',  # No password for Google users
        full_name=google_info.get('name', ''),
        profile_picture=google_info.get('picture', 'default-avatar.png'),
        google_id=google_id,
        google_picture=google_info.get('picture', ''),
        role=player_role
    )
    
    # Pošalji welcome email novom korisniku
    try:
        from .email_service import send_welcome_email
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Sending welcome email to new Google user: {user.email}")
        result = send_welcome_email(user)
        logger.info(f"Welcome email sent successfully: {result}")
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send welcome email to {user.email}: {e}")
    
    return user, True
