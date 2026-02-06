"""
Helper functions and decorators for COTISA
"""
from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages


def admin_required(view_func):
    """Decorator to require admin access"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Morate biti prijavljeni.')
            return redirect('user_login')
        
        if not request.user.role.can_access_admin_panel:
            messages.error(request, 'Pristup dozvoljen samo administratorima!')
            return redirect('index')
        
        return view_func(request, *args, **kwargs)
    return wrapper


def permission_required(permission_name):
    """Decorator to require specific permission"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                messages.error(request, 'Morate biti prijavljeni.')
                return redirect('user_login')
            
            if not hasattr(request.user.role, permission_name):
                messages.error(request, 'Nemate dozvolu za ovu akciju!')
                return redirect('index')
            
            if not getattr(request.user.role, permission_name):
                messages.error(request, 'Nemate dozvolu za ovu akciju!')
                return redirect('index')
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def gateway_required(view_func):
    """Decorator to check if admin gateway was passed"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('admin_gateway_passed'):
            return redirect('prelogin')
        return view_func(request, *args, **kwargs)
    return wrapper
