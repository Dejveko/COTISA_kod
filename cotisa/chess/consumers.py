"""
WebSocket consumers for real-time updates
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async


class GameConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time game updates
    Handles: game moves, tournament updates, notifications
    """
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.user_group = f'user_{self.user_id}'
        
        # Join user's personal group for notifications
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )
        
        # Join general updates group
        await self.channel_layer.group_add(
            'general_updates',
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to COTISA real-time server',
            'user_id': self.user_id
        }))
    
    async def disconnect(self, close_code):
        # Leave groups
        await self.channel_layer.group_discard(
            self.user_group,
            self.channel_name
        )
        await self.channel_layer.group_discard(
            'general_updates',
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
            
            elif message_type == 'join_game':
                game_id = data.get('game_id')
                if game_id:
                    await self.channel_layer.group_add(
                        f'game_{game_id}',
                        self.channel_name
                    )
                    await self.send(text_data=json.dumps({
                        'type': 'joined_game',
                        'game_id': game_id
                    }))
            
            elif message_type == 'leave_game':
                game_id = data.get('game_id')
                if game_id:
                    await self.channel_layer.group_discard(
                        f'game_{game_id}',
                        self.channel_name
                    )
            
            elif message_type == 'join_tournament':
                tournament_id = data.get('tournament_id')
                if tournament_id:
                    await self.channel_layer.group_add(
                        f'tournament_{tournament_id}',
                        self.channel_name
                    )
                    await self.send(text_data=json.dumps({
                        'type': 'joined_tournament',
                        'tournament_id': tournament_id
                    }))
            
            elif message_type == 'leave_tournament':
                tournament_id = data.get('tournament_id')
                if tournament_id:
                    await self.channel_layer.group_discard(
                        f'tournament_{tournament_id}',
                        self.channel_name
                    )
                    
        except json.JSONDecodeError:
            pass
    
    # Event handlers for group messages
    
    async def game_update(self, event):
        """Send game update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'game_id': event.get('game_id'),
            'data': event.get('data')
        }))
    
    async def game_move(self, event):
        """Send game move to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'game_move',
            'game_id': event.get('game_id'),
            'move': event.get('move'),
            'fen': event.get('fen'),
            'player': event.get('player')
        }))
    
    async def game_end(self, event):
        """Send game end notification"""
        await self.send(text_data=json.dumps({
            'type': 'game_end',
            'game_id': event.get('game_id'),
            'result': event.get('result'),
            'winner': event.get('winner')
        }))
    
    async def tournament_update(self, event):
        """Send tournament update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'tournament_update',
            'tournament_id': event.get('tournament_id'),
            'data': event.get('data')
        }))
    
    async def notification(self, event):
        """Send notification to user"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event.get('notification')
        }))
    
    async def match_update(self, event):
        """Send match update"""
        await self.send(text_data=json.dumps({
            'type': 'match_update',
            'match_id': event.get('match_id'),
            'data': event.get('data')
        }))
    
    async def tournament_round_update(self, event):
        """Send tournament round update (new round created)"""
        await self.send(text_data=json.dumps({
            'type': 'tournament_round_update',
            'tournament_id': event.get('tournament_id'),
            'round_number': event.get('round_number'),
            'message': event.get('message'),
            'matches': event.get('matches', [])
        }))
    
    async def new_round(self, event):
        """Send new round notification"""
        await self.send(text_data=json.dumps({
            'type': 'new_round',
            'tournament_id': event.get('tournament_id'),
            'round_number': event.get('round_number'),
            'message': event.get('message')
        }))


# Helper function to send WebSocket messages from Django views
def send_websocket_message(group_name, message_type, data):
    """
    Send a message to a WebSocket group from a synchronous context
    Usage: send_websocket_message('game_123', 'game_move', {'move': 'e2e4'})
    """
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': message_type.replace('-', '_'),
                **data
            }
        )
