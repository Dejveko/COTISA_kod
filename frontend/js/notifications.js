// Notifications Manager
import { notificationsAPI, gameAPI } from './api.js';
import router from './router.js';
import { showToast } from './utils.js';
import wsManager from './websocket.js';

// Get translation function
const t = (key) => window.t ? window.t(key) : key;

class NotificationsManager {
    constructor() {
        this.checkInterval = null;
        this.isDropdownOpen = false;
        this.wsHandlerRegistered = false;
    }

    init() {
        // Setup WebSocket listener for new notifications
        this.setupWebSocketListener();
        
        // Setup event listeners
        const bell = document.getElementById('notification-bell');
        const dropdown = document.getElementById('notifications-dropdown');
        const markAllRead = document.getElementById('mark-all-read');

        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        if (markAllRead) {
            markAllRead.addEventListener('click', () => this.markAllAsRead());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && this.isDropdownOpen && !dropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Start checking for notifications
        this.startChecking();
    }

    setupWebSocketListener() {
        if (this.wsHandlerRegistered) return;
        
        // Listen for new notifications from WebSocket
        wsManager.on('notification:new', (data) => {
            console.log('[Notifications] New notification via WebSocket:', data);
            
            // Show toast immediately
            if (data && data.message) {
                const icon = data.type === 'challenge' ? '⚔️' : 
                            data.type === 'pairing_update' ? '♟️' : 
                            data.type === 'tournament_start' ? '🏆' : '📢';
                showToast(`${icon} ${data.message}`, 'info', 5000);
            }
            
            // Refresh notifications list and badge
            this.checkNotifications();
        });
        
        this.wsHandlerRegistered = true;
        console.log('[Notifications] WebSocket listener registered');
    }
    
    startChecking() {
        // Check immediately
        this.checkNotifications();
        
        // Then check every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkNotifications();
        }, 30000);
    }

    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    async checkNotifications(forceUpdateList = false) {
        try {
            const response = await notificationsAPI.getNotifications();
            
            if (response.success) {
                this.updateBadge(response.count);
                // Update list if dropdown is not open OR if forced (e.g., when opening dropdown)
                if (!this.isDropdownOpen || forceUpdateList) {
                    this.updateList(response.notifications);
                }
            }
        } catch (error) {
            // Silently ignore 401 errors - user might not be fully authenticated yet
            if (!error.message.includes('401') && !error.message.includes('Neautoriziran')) {
                console.error('Error checking notifications:', error);
            }
        }
    }

    updateBadge(count) {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateList(notifications) {
        const list = document.getElementById('notifications-list');
        if (!list) return;

        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty" style="color: #2c3e50 !important;">
                    <p style="color: #2c3e50 !important;">${t('notifications.empty')}</p>
                </div>
            `;
            return;
        }

        list.innerHTML = notifications.map(notif => {
            const isChallenge = notif.type === 'challenge';
            const isPairing = notif.type === 'pairing_update';
            const icon = isChallenge ? '⚔️' : isPairing ? '♟️' : '📢';
            
            return `
            <div class="notification-item unread ${isChallenge ? 'challenge' : ''}" data-id="${notif.id}" data-match="${notif.related_match_id || ''}" data-type="${notif.type}">
                <div class="notification-icon">${icon}</div>
                <div class="notification-content" style="color: #2c3e50 !important;">
                    <div class="notification-message" style="color: #2c3e50 !important;">${notif.message}</div>
                    <div class="notification-time" style="color: #718096 !important;">${this.formatTime(notif.created_at)}</div>
                    ${(isChallenge || isPairing) && notif.related_match_id ? `
                        <button class="btn btn-sm btn-success notification-action" style="margin-top: 0.5rem;">
                            ${isChallenge ? `✅ ${t('notifications.acceptChallenge')}` : `🎮 ${t('notifications.joinMatch')}`}
                        </button>
                    ` : ''}
                </div>
            </div>
        `}).join('');

        // Add click handlers
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notifId = item.getAttribute('data-id');
                const matchId = item.getAttribute('data-match');
                const notifType = item.getAttribute('data-type');
                this.handleNotificationClick(notifId, matchId, notifType);
            });
        });
    }

    async handleNotificationClick(notifId, matchId, notifType) {
        try {
            // Mark as read
            await notificationsAPI.markAsRead(notifId);
            
            // Close dropdown
            this.closeDropdown();
            
            // If this is a challenge, create a game from the match first
            if (matchId && (notifType === 'challenge' || notifType === 'pairing_update')) {
                try {
                    showToast('Pokrećem igru...', 'info');
                    const response = await gameAPI.createFromMatch(matchId);
                    
                    if (response.success && response.game_id) {
                        router.navigate(`/game/${response.game_id}`);
                    } else {
                        showToast(response.error || 'Greška pri pokretanju igre', 'error');
                    }
                } catch (error) {
                    console.error('Error creating game:', error);
                    showToast('Greška pri pokretanju igre: ' + error.message, 'error');
                }
            }
            
            // Refresh notifications
            await this.checkNotifications();
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    }

    async markAllAsRead() {
        try {
            await notificationsAPI.markAllAsRead();
            await this.checkNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    toggleDropdown() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (!dropdown) return;

        this.isDropdownOpen = !this.isDropdownOpen;
        
        if (this.isDropdownOpen) {
            dropdown.classList.add('show');
            // Refresh list when opening - force update even though dropdown is now open
            this.checkNotifications(true);
        } else {
            dropdown.classList.remove('show');
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            this.isDropdownOpen = false;
        }
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Upravo sada';
        if (diffMins < 60) return `Prije ${diffMins} min`;
        if (diffHours < 24) return `Prije ${diffHours} h`;
        if (diffDays < 7) return `Prije ${diffDays} dana`;
        
        return date.toLocaleDateString('hr-HR');
    }

    destroy() {
        this.stopChecking();
        this.closeDropdown();
    }
}

// Create singleton instance
const notificationsManager = new NotificationsManager();

export default notificationsManager;
