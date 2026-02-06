"""
Centralized Decorators and Authentication Utilities
====================================================
This module contains shared decorators used across the application.
Import from here instead of duplicating code.
"""

from django.http import JsonResponse
from functools import wraps
import logging

logger = logging.getLogger(__name__)


def token_required(view_func):
    """
    Decorator that requires a valid auth token in X-Auth-Token header.
    
    Usage:
        @token_required
        def my_view(request):
            # request.user is the authenticated player
            pass
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        from .models import Player  # Import here to avoid circular imports
        
        # Get token from X-Auth-Token header
        auth_token = request.headers.get('X-Auth-Token')
        
        if not auth_token:
            logger.warning(f"Auth attempt without token from {request.META.get('REMOTE_ADDR')}")
            return JsonResponse({
                'error': 'Authentication required',
                'code': 'NO_TOKEN',
                'message': 'Please provide X-Auth-Token header'
            }, status=401)
        
        try:
            # Find user by token
            player = Player.objects.select_related('role').get(
                auth_token=auth_token, 
                is_active=True
            )
            # Attach player to request
            request.user = player
            return view_func(request, *args, **kwargs)
        except Player.DoesNotExist:
            logger.warning(f"Invalid token attempt: {auth_token[:8]}...")
            return JsonResponse({
                'error': 'Invalid or expired token',
                'code': 'INVALID_TOKEN',
                'message': 'Please login again'
            }, status=401)
    
    return wrapper


def api_login_required(view_func):
    """
    Decorator for API endpoints that returns JSON instead of redirect.
    Use this for session-based authentication (cookies).
    
    Usage:
        @api_login_required
        def my_view(request):
            pass
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({
                'error': 'Authentication required',
                'code': 'NOT_AUTHENTICATED',
                'message': 'Please login to access this resource'
            }, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def admin_required(view_func):
    """
    Decorator that requires admin role.
    Must be used after @token_required.
    
    Usage:
        @token_required
        @admin_required
        def admin_only_view(request):
            pass
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'user') or not request.user:
            return JsonResponse({
                'error': 'Authentication required',
                'code': 'NOT_AUTHENTICATED'
            }, status=401)
        
        if not request.user.role or not request.user.role.is_admin:
            logger.warning(f"Admin access denied for user {request.user.username}")
            return JsonResponse({
                'error': 'Admin access required',
                'code': 'FORBIDDEN',
                'message': 'You do not have permission to access this resource'
            }, status=403)
        
        return view_func(request, *args, **kwargs)
    return wrapper


def permission_required(*permissions):
    """
    Decorator that checks for specific permissions.
    
    Usage:
        @token_required
        @permission_required('can_create_tournament', 'can_manage_tournament')
        def create_tournament(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not hasattr(request, 'user') or not request.user:
                return JsonResponse({
                    'error': 'Authentication required',
                    'code': 'NOT_AUTHENTICATED'
                }, status=401)
            
            role = request.user.role
            if not role:
                return JsonResponse({
                    'error': 'No role assigned',
                    'code': 'NO_ROLE'
                }, status=403)
            
            # Check all required permissions
            missing_permissions = []
            for perm in permissions:
                if not getattr(role, perm, False):
                    missing_permissions.append(perm)
            
            if missing_permissions:
                logger.warning(
                    f"Permission denied for {request.user.username}: "
                    f"missing {missing_permissions}"
                )
                return JsonResponse({
                    'error': 'Insufficient permissions',
                    'code': 'FORBIDDEN',
                    'missing_permissions': missing_permissions
                }, status=403)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def handle_exceptions(view_func):
    """
    Decorator that catches all exceptions and returns JSON error response.
    Use this on API endpoints to prevent 500 errors from leaking stack traces.
    
    Usage:
        @handle_exceptions
        @token_required
        def my_api_view(request):
            pass
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except Exception as e:
            logger.exception(f"Unhandled exception in {view_func.__name__}: {str(e)}")
            return JsonResponse({
                'error': 'Internal server error',
                'code': 'INTERNAL_ERROR',
                'message': 'An unexpected error occurred. Please try again later.'
            }, status=500)
    return wrapper


def rate_limit(max_requests=60, window_seconds=60):
    """
    Simple rate limiting decorator.
    Limits requests per IP address.
    
    Usage:
        @rate_limit(max_requests=10, window_seconds=60)
        def expensive_operation(request):
            pass
    
    Note: For production, use django-ratelimit or similar.
    This is a simple in-memory implementation.
    """
    from collections import defaultdict
    from time import time
    
    requests = defaultdict(list)
    
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            ip = request.META.get('REMOTE_ADDR', 'unknown')
            current_time = time()
            
            # Clean old requests
            requests[ip] = [
                req_time for req_time in requests[ip]
                if current_time - req_time < window_seconds
            ]
            
            # Check rate limit
            if len(requests[ip]) >= max_requests:
                return JsonResponse({
                    'error': 'Too many requests',
                    'code': 'RATE_LIMITED',
                    'message': f'Please wait before making another request',
                    'retry_after': window_seconds
                }, status=429)
            
            # Record this request
            requests[ip].append(current_time)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
