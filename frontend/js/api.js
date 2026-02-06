// API Service - Handles all Django REST API calls
// Base URL for Django backend - dynamically detect host
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname);

// Use relative URL for domain (proxied through Apache), absolute URL for localhost/IP
const API_BASE_URL = isLocalhost
    ? 'http://localhost:8000/api'
    : isIP 
        ? `http://${window.location.hostname}:8000/api`
        : '/api';  // Relative URL - Apache will proxy to Django

// Base URL for media files (profile pictures, etc.)
const MEDIA_BASE_URL = isLocalhost
    ? 'http://localhost:8000'
    : isIP 
        ? `http://${window.location.hostname}:8000`
        : '';  // Relative URL for domain

// Helper function to get full URL for API (exported for other modules)
function getApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

// Helper function to get full URL for media files (exported for other modules)
function getMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;  // Already absolute URL
    if (path.startsWith('data:')) return path;  // Data URI
    // Check for URL-encoded absolute URLs (https%3A = https:)
    if (path.includes('https%3A') || path.includes('http%3A')) {
        return decodeURIComponent(path);
    }
    // Handle profile_pictures path - ensure /media/ prefix
    if (path.includes('profile_pictures') && !path.startsWith('/media/')) {
        path = '/media/' + path.replace(/^\/+/, '');
    }
    // For default-avatar.png, use media path
    if (path === 'default-avatar.png') {
        path = '/media/default-avatar.png';
    }
    return `${MEDIA_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Base fetch wrapper with error handling
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        credentials: 'include', // Include cookies for session auth
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    };
    
    // Add auth token from localStorage if available
    const authToken = localStorage.getItem('cotisa_auth_token');
    if (authToken) {
        defaultOptions.headers['X-Auth-Token'] = authToken;
    }
    
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Merge headers separately to avoid overwriting
    if (options.headers) {
        mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
        // Remove Content-Type if FormData
        if (options.body instanceof FormData) {
            delete mergedOptions.headers['Content-Type'];
        }
    }
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // Handle unauthorized (401) responses
        if (response.status === 401) {
            // Try to get the error message
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: 'Unauthorized' };
            }
            
            // Only clear session and redirect for explicit session expiry
            // Don't auto-logout for API calls that might just need re-auth
            const isLoginPage = window.location.hash.includes('login');
            const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/register');
            
            // If token is invalid/expired and we're not on login page, clear and redirect
            if (!isLoginPage && !isAuthEndpoint && errorData.error && 
                (errorData.error.includes('token') || errorData.error.includes('expired'))) {
                localStorage.removeItem('cotisa_user');
                localStorage.removeItem('cotisa_session');
                localStorage.removeItem('cotisa_auth_token');
                window.location.hash = '#/login';
                window.location.reload();
            }
            
            throw new Error(errorData.error || 'Neautoriziran pristup');
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication API
export const authAPI = {
    // Register new user
    register: async (username, email, password, experienceLevel = 'intermediate') => {
        return apiCall('/register/', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, experience_level: experienceLevel }),
        });
    },
    
    // Login user
    login: async (username, password) => {
        return apiCall('/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    
    // Logout user
    logout: async () => {
        return apiCall('/logout/', {
            method: 'POST',
        });
    },
    
    // Get current user info
    me: async () => {
        return apiCall('/me/');
    },
};

// Tournament API
export const tournamentAPI = {
    // Get all tournaments (public)
    getAll: async () => {
        return apiCall('/tournaments/');
    },
    
    // Get my tournaments
    getMy: async () => {
        return apiCall('/tournaments/my/');
    },
    
    // Get tournament by ID
    getById: async (id) => {
        return apiCall(`/tournaments/${id}/`);
    },
    
    // Create new tournament
    create: async (tournamentData) => {
        return apiCall('/tournaments/create/', {
            method: 'POST',
            body: JSON.stringify(tournamentData),
        });
    },
    
    // Join tournament with code
    join: async (code) => {
        return apiCall('/tournaments/join/', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },
    
    // Start tournament (admin/creator only)
    start: async (id) => {
        return apiCall(`/tournaments/${id}/start/`, {
            method: 'POST',
        });
    },
    
    // Update match result
    updateMatch: async (matchId, winnerId) => {
        return apiCall(`/matches/${matchId}/result/`, {
            method: 'POST',
            body: JSON.stringify({ winner_id: winnerId }),
        });
    },
    
    // Get tournament participants
    getParticipants: async (tournamentId) => {
        return apiCall(`/tournaments/${tournamentId}/participants/`);
    },
    
    // Get tournament matches
    getMatches: async (tournamentId) => {
        return apiCall(`/tournaments/${tournamentId}/matches/`);
    },
    
    // Delete tournament (admin or creator only)
    delete: async (tournamentId) => {
        return apiCall('/tournament/delete/', {
            method: 'POST',
            body: JSON.stringify({ tournament_id: tournamentId }),
        });
    },
};

// Player/Profile API
export const playerAPI = {
    // Get all players
    getAll: async () => {
        return apiCall('/players/all/');
    },
    
    // Get current user's profile (refreshed from server)
    getMyProfile: async () => {
        return apiCall('/profile/');
    },
    
    // Get player profile by ID
    getProfile: async (playerId) => {
        return apiCall(`/players/${playerId}/profile/`);
    },
    
    // Update profile
    updateProfile: async (data) => {
        return apiCall('/profile/update/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    // Upload profile picture
    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('picture', file);
        
        return apiCall('/profile/upload-picture/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData,
        });
    },
    
    // Get available profile picture sources
    getPictureSources: async () => {
        return apiCall('/profile/picture-sources/');
    },
    
    // Set profile picture source
    setPictureSource: async (source) => {
        return apiCall('/profile/picture-source/', {
            method: 'POST',
            body: JSON.stringify({ source }),
        });
    },
    
    // Challenge another player
    challengePlayer: async (opponentId, timeControl = 'blitz', minutes = null, increment = null, preferredColor = 'random') => {
        const payload = { 
            opponent_id: opponentId, 
            time_control: timeControl,
            preferred_color: preferredColor
        };
        
        // Include custom time settings if provided
        if (minutes !== null) {
            payload.time_control_minutes = minutes;
        }
        if (increment !== null) {
            payload.time_increment_seconds = increment;
        }
        
        return apiCall('/players/challenge/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    
    // Get player titles
    getTitles: async (playerId) => {
        return apiCall(`/players/${playerId}/titles/`);
    },
    
    // Set active title
    setActiveTitle: async (titleId) => {
        return apiCall('/profile/set-active-title/', {
            method: 'POST',
            body: JSON.stringify({ title_id: titleId }),
        });
    },
    
    // Get player history
    getHistory: async () => {
        return apiCall('/profile/history/');
    },
    
    // Get player statistics
    getStats: async () => {
        return apiCall('/profile/stats/');
    },
};

// Admin API
export const adminAPI = {
    // Get admin dashboard stats
    getDashboard: async () => {
        return apiCall('/admin/dashboard/');
    },
    
    // Get all players (admin view)
    getPlayers: async () => {
        return apiCall('/admin/players/');
    },
    
    // Delete player
    deletePlayer: async (playerId) => {
        return apiCall('/admin/players/delete/', {
            method: 'POST',
            body: JSON.stringify({ player_id: playerId }),
        });
    },
    
    // Make player admin
    makeAdmin: async (username) => {
        return apiCall('/admin/make-admin/', {
            method: 'POST',
            body: JSON.stringify({ username }),
        });
    },
    
    // Get all titles
    getAllTitles: async () => {
        return apiCall('/admin/titles/all/');
    },
    
    // Create new title
    createTitle: async (titleData) => {
        return apiCall('/admin/titles/create/', {
            method: 'POST',
            body: JSON.stringify(titleData),
        });
    },
    
    // Award title to player
    awardTitle: async (playerId, titleId) => {
        return apiCall('/admin/titles/award/', {
            method: 'POST',
            body: JSON.stringify({ player_id: playerId, title_id: titleId }),
        });
    },
    
    // Delete title
    deleteTitle: async (titleId) => {
        return apiCall('/admin/titles/delete/', {
            method: 'POST',
            body: JSON.stringify({ title_id: titleId }),
        });
    },
};

// Game API
export const gameAPI = {
    // Create a game from a match (accept challenge)
    createFromMatch: async (matchId) => {
        return apiCall('/game/create/', {
            method: 'POST',
            body: JSON.stringify({ match_id: matchId }),
        });
    },
    
    // Get game details
    getGame: async (gameId) => {
        return apiCall(`/game/${gameId}/`);
    },
};

// Notifications API
export const notificationsAPI = {
    // Get unread notifications
    getNotifications: async () => {
        return apiCall('/notifications/');
    },
    
    // Mark notification as read
    markAsRead: async (notificationId) => {
        return apiCall(`/notifications/${notificationId}/read/`, {
            method: 'POST',
        });
    },
    
    // Mark all as read
    markAllAsRead: async () => {
        return apiCall('/notifications/read-all/', {
            method: 'POST',
        });
    },
};

// Friends API
export const friendsAPI = {
    // Get list of friends
    getFriends: async () => {
        return apiCall('/friends/');
    },
    
    // Get friend requests (sent and received)
    getRequests: async () => {
        return apiCall('/friends/requests/');
    },
    
    // Send friend request
    addFriend: async (playerId) => {
        return apiCall('/friends/add/', {
            method: 'POST',
            body: JSON.stringify({ player_id: playerId }),
        });
    },
    
    // Respond to friend request
    respondToRequest: async (friendshipId, action) => {
        return apiCall(`/friends/${friendshipId}/respond/`, {
            method: 'POST',
            body: JSON.stringify({ action }),
        });
    },
    
    // Remove friend
    removeFriend: async (playerId) => {
        return apiCall(`/friends/${playerId}/remove/`, {
            method: 'POST',
        });
    },
    
    // Check friendship status
    checkFriendship: async (playerId) => {
        return apiCall(`/friends/check/${playerId}/`);
    },
};

// Export default object with all APIs
export default {
    auth: authAPI,
    tournaments: tournamentAPI,
    players: playerAPI,
    admin: adminAPI,
    notifications: notificationsAPI,
    friends: friendsAPI,
    game: gameAPI,
};

// Export helper functions for use in other modules
export { getApiUrl, getMediaUrl, API_BASE_URL, MEDIA_BASE_URL };
