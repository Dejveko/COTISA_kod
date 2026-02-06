/**
 * WebSocket Manager for real-time updates
 * Handles connection, reconnection, and message routing
 */

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
        this.connected = false;
        this.userId = null;
        this.pingInterval = null;
    }

    /**
     * Connect to WebSocket server
     * @param {number} userId - User ID for the connection
     */
    connect(userId) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('WebSocket: Already connected');
            return;
        }

        this.userId = userId;
        
        // Determine WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/game/${userId}/`;
        
        console.log('WebSocket: Connecting to', wsUrl);
        
        try {
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('WebSocket: Connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.startPing();
                this.emit('connected', { userId });
            };
            
            this.socket.onclose = (event) => {
                console.log('WebSocket: Disconnected', event.code, event.reason);
                this.connected = false;
                this.stopPing();
                this.emit('disconnected', { code: event.code });
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
                    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
                    setTimeout(() => this.connect(this.userId), delay);
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket: Error', error);
                this.emit('error', { error });
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    console.error('WebSocket: Invalid message', e);
                }
            };
        } catch (error) {
            console.error('WebSocket: Connection failed', error);
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        this.stopPing();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
    }

    /**
     * Send a message through WebSocket
     * @param {string} type - Message type
     * @param {object} data - Message data
     */
    send(type, data = {}) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, ...data }));
        } else {
            console.warn('WebSocket: Not connected, cannot send message');
        }
    }

    /**
     * Handle incoming WebSocket messages
     * @param {object} data - Message data
     */
    handleMessage(data) {
        const type = data.type;
        
        // Emit to all listeners for this type
        this.emit(type, data);
        
        // Handle specific message types
        switch (type) {
            case 'connection_established':
                console.log('WebSocket: Connection confirmed');
                break;
                
            case 'pong':
                // Heartbeat response
                break;
                
            case 'game_move':
                // A move was made in a game
                this.emit('game:move', data);
                break;
                
            case 'game_update':
                // Game state updated
                this.emit('game:update', data);
                break;
                
            case 'game_end':
                // Game ended
                this.emit('game:end', data);
                break;
                
            case 'tournament_update':
                // Tournament updated
                this.emit('tournament:update', data);
                break;
            
            case 'tournament_round_update':
                // New round created in tournament
                this.emit('tournament:new_round', data);
                break;
            
            case 'new_round':
                // New round notification
                this.emit('tournament:round_notification', data);
                break;
                
            case 'notification':
                // New notification
                this.emit('notification:new', data.notification);
                break;
                
            case 'match_update':
                // Match updated
                this.emit('match:update', data);
                break;
        }
    }

    /**
     * Start ping interval to keep connection alive
     */
    startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            this.send('ping');
        }, 30000); // Ping every 30 seconds
    }

    /**
     * Stop ping interval
     */
    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    /**
     * Join a game room for real-time updates
     * @param {number} gameId - Game ID
     */
    joinGame(gameId) {
        this.send('join_game', { game_id: gameId });
    }

    /**
     * Leave a game room
     * @param {number} gameId - Game ID
     */
    leaveGame(gameId) {
        this.send('leave_game', { game_id: gameId });
    }

    /**
     * Join a tournament room for real-time updates
     * @param {number} tournamentId - Tournament ID
     */
    joinTournament(tournamentId) {
        this.send('join_tournament', { tournament_id: tournamentId });
    }

    /**
     * Leave a tournament room
     * @param {number} tournamentId - Tournament ID
     */
    leaveTournament(tournamentId) {
        this.send('leave_tournament', { tournament_id: tournamentId });
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Emit event to all listeners
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('WebSocket: Listener error', e);
                }
            });
        }
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }
}

// Create and export singleton instance
const wsManager = new WebSocketManager();
export default wsManager;
