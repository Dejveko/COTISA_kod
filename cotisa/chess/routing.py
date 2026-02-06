"""
WebSocket URL routing for Django Channels
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<user_id>\d+)/$', consumers.GameConsumer.as_asgi()),
]
