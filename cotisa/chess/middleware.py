"""
Centralized Error Handling Middleware
=====================================
Catches unhandled exceptions and returns proper JSON responses.
"""

import json
import logging
import traceback
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)


class JSONErrorMiddleware:
    """
    Middleware that catches exceptions and returns JSON error responses.
    This prevents HTML error pages from being returned to API clients.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Check if this is a 404 for an API request
        is_api_request = (
            request.path.startswith('/api/') or
            request.content_type == 'application/json' or
            'application/json' in request.META.get('HTTP_ACCEPT', '')
        )
        
        if is_api_request and response.status_code == 404:
            # Return JSON 404 instead of HTML
            return JsonResponse({
                'error': 'Not Found',
                'code': 'NOT_FOUND',
                'message': f'Endpoint {request.path} not found',
                'path': request.path
            }, status=404)
        
        return response
    
    def process_exception(self, request, exception):
        """Handle uncaught exceptions"""
        
        # Log the full exception
        logger.exception(f"Unhandled exception: {str(exception)}")
        
        # Determine if this is an API request
        is_api_request = (
            request.path.startswith('/api/') or
            request.content_type == 'application/json' or
            'application/json' in request.META.get('HTTP_ACCEPT', '')
        )
        
        if not is_api_request:
            # Let Django handle non-API requests normally
            return None
        
        # Build error response
        error_response = {
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR',
            'message': 'An unexpected error occurred'
        }
        
        # In debug mode, include more details
        if settings.DEBUG:
            error_response['debug'] = {
                'exception_type': type(exception).__name__,
                'exception_message': str(exception),
                'traceback': traceback.format_exc()
            }
        
        return JsonResponse(error_response, status=500)


class RequestLoggingMiddleware:
    """
    Middleware that logs all requests for debugging.
    Only active when DEBUG=True.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log request info
        if settings.DEBUG:
            logger.debug(
                f"Request: {request.method} {request.path} "
                f"from {request.META.get('REMOTE_ADDR')}"
            )
        
        response = self.get_response(request)
        
        # Log response info
        if settings.DEBUG:
            logger.debug(
                f"Response: {response.status_code} for {request.path}"
            )
        
        return response


class CORSDebugMiddleware:
    """
    Middleware that logs CORS-related headers for debugging.
    Useful for troubleshooting cross-origin issues.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Log CORS headers in debug mode
        if settings.DEBUG and request.path.startswith('/api/'):
            origin = request.META.get('HTTP_ORIGIN', 'No Origin')
            logger.debug(f"CORS - Origin: {origin}, Path: {request.path}")
        
        return response


# Custom exception classes for better error handling

class APIException(Exception):
    """Base class for API exceptions"""
    status_code = 500
    error_code = 'INTERNAL_ERROR'
    message = 'An error occurred'
    
    def __init__(self, message=None, status_code=None, error_code=None):
        if message:
            self.message = message
        if status_code:
            self.status_code = status_code
        if error_code:
            self.error_code = error_code
        super().__init__(self.message)
    
    def to_response(self):
        return JsonResponse({
            'error': self.message,
            'code': self.error_code
        }, status=self.status_code)


class NotFoundError(APIException):
    """Resource not found"""
    status_code = 404
    error_code = 'NOT_FOUND'
    message = 'Resource not found'


class ValidationError(APIException):
    """Input validation failed"""
    status_code = 400
    error_code = 'VALIDATION_ERROR'
    message = 'Invalid input'
    
    def __init__(self, errors=None, **kwargs):
        super().__init__(**kwargs)
        self.errors = errors or {}
    
    def to_response(self):
        return JsonResponse({
            'error': self.message,
            'code': self.error_code,
            'errors': self.errors
        }, status=self.status_code)


class AuthenticationError(APIException):
    """Authentication failed"""
    status_code = 401
    error_code = 'AUTHENTICATION_ERROR'
    message = 'Authentication required'


class PermissionDeniedError(APIException):
    """Permission denied"""
    status_code = 403
    error_code = 'PERMISSION_DENIED'
    message = 'You do not have permission to perform this action'


class ConflictError(APIException):
    """Resource conflict (e.g., duplicate entry)"""
    status_code = 409
    error_code = 'CONFLICT'
    message = 'Resource conflict'


class RateLimitError(APIException):
    """Rate limit exceeded"""
    status_code = 429
    error_code = 'RATE_LIMITED'
    message = 'Too many requests'
