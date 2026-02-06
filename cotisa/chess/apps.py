"""
Chess app configuration
"""
from django.apps import AppConfig


class ChessConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chess'
    verbose_name = 'COTISA - Chess Tournament System'
    
    def ready(self):
        """Import signals if any"""
        pass
