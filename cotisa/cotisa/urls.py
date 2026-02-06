"""
URL Configuration for COTISA
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import FileResponse
import os
import mimetypes

def serve_with_correct_mimetype(request, path, document_root):
    """Serve static files with correct MIME types"""
    full_path = os.path.join(document_root, path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        # Determine MIME type
        mime_type, _ = mimetypes.guess_type(full_path)
        if mime_type is None:
            # Default MIME types for common files
            if path.endswith('.js'):
                mime_type = 'application/javascript'
            elif path.endswith('.css'):
                mime_type = 'text/css'
            elif path.endswith('.json'):
                mime_type = 'application/json'
            else:
                mime_type = 'application/octet-stream'
        
        return FileResponse(open(full_path, 'rb'), content_type=mime_type)
    from django.http import Http404
    raise Http404("File not found")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('chess.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    # Serve frontend static files (CSS, JS, images)
    frontend_path = os.path.join(settings.BASE_DIR.parent, 'frontend')
    urlpatterns += [
        re_path(r'^css/(?P<path>.*)$', serve_with_correct_mimetype, {'document_root': os.path.join(frontend_path, 'css')}),
        re_path(r'^js/(?P<path>.*)$', serve_with_correct_mimetype, {'document_root': os.path.join(frontend_path, 'js')}),
        re_path(r'^images/(?P<path>.*)$', serve_with_correct_mimetype, {'document_root': os.path.join(frontend_path, 'images')}),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
