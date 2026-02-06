// Authentication Manager
import { authAPI } from './api.js';
import { showToast, showLoading, hideLoading } from './utils.js';

// Local storage keys
const STORAGE_KEYS = {
    USER: 'cotisa_user',
    SESSION: 'cotisa_session',
    AUTH_TOKEN: 'cotisa_auth_token',
};

class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.listeners = [];
    }
    
    // Load user from localStorage
    loadUser() {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    }
    
    // Save user to localStorage
    saveUser(user, authToken = null) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.SESSION, Date.now().toString());
            if (authToken) {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
                console.log('✅ Auth token saved');
            } else {
                console.warn('⚠️ No auth token provided when saving user');
            }
        } else {
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.SESSION);
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
        this.notifyListeners();
    }
    
    // Get stored auth token
    getAuthToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    
    // Register listener for auth state changes
    onAuthChange(callback) {
        this.listeners.push(callback);
    }
    
    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentUser));
    }
    
    // Get current user
    getUser() {
        return this.currentUser;
    }
    
    // Set user (alias for saveUser for compatibility)
    setUser(user, authToken = null) {
        this.saveUser(user, authToken);
    }
    
    // Update current user data (preserves auth token)
    updateUser(userData) {
        if (!userData) return;
        this.currentUser = { ...this.currentUser, ...userData };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
        this.notifyListeners();
    }
    
    // Check if user is logged in
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    // Login
    async login(username, password) {
        showLoading();
        try {
            const response = await authAPI.login(username, password);
            console.log('Login response:', response);
            
            if (response.success) {
                console.log('Auth token from response:', response.auth_token);
                this.saveUser(response.user, response.auth_token);  // Store token
                showToast('Uspješno ste prijavljeni!', 'success');
                
                // Update navbar
                if (window.app_main && window.app_main.refreshNavbar) {
                    window.app_main.refreshNavbar();
                }
                
                return true;
            } else {
                showToast(response.error || 'Prijava neuspješna', 'error');
                return false;
            }
        } catch (error) {
            showToast(error.message || 'Greška pri prijavi', 'error');
            return false;
        } finally {
            hideLoading();
        }
    }
    
    // Register
    async register(username, email, password, experienceLevel = 'intermediate') {
        showLoading();
        try {
            const response = await authAPI.register(username, email, password, experienceLevel);
            
            if (response.success) {
                // Auto-login after registration - save user AND auth_token
                this.saveUser(response.user, response.auth_token);
                showToast('Račun uspješno kreiran! Dobrodošli!', 'success');
                
                // Update navbar
                if (window.app_main && window.app_main.refreshNavbar) {
                    window.app_main.refreshNavbar();
                }
                
                return true;
            } else {
                showToast(response.error || 'Registracija neuspješna', 'error');
                return false;
            }
        } catch (error) {
            showToast(error.message || 'Greška pri registraciji', 'error');
            return false;
        } finally {
            hideLoading();
        }
    }
    
    // Logout
    async logout() {
        showLoading();
        try {
            await authAPI.logout();
            this.saveUser(null);
            // Reset sidebar to top nav on logout
            document.body.setAttribute('data-tabs-position', 'top');
            showToast('Uspješno ste odjavljeni', 'success');
            window.location.hash = '#/login';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            this.saveUser(null);
            document.body.setAttribute('data-tabs-position', 'top');
            window.location.hash = '#/login';
        } finally {
            hideLoading();
        }
    }
    
    // Verify session (optional - call on app init)
    async verifySession() {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        try {
            const response = await authAPI.me();
            if (response.success) {
                // Update user data in case something changed
                this.saveUser(response.user);
                return true;
            } else {
                // Session invalid, clear local storage
                this.saveUser(null);
                return false;
            }
        } catch (error) {
            console.error('Session verification failed:', error);
            this.saveUser(null);
            return false;
        }
    }
    
    // Require authentication (redirect if not logged in)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.hash = '#/login';
            return false;
        }
        return true;
    }
    
    // Require admin role
    requireAdmin() {
        if (!this.isAdmin()) {
            showToast('Nemate pristup ovoj stranici', 'error');
            window.location.hash = '#/dashboard';
            return false;
        }
        return true;
    }
}

// Create and export singleton instance
const auth = new AuthManager();

// NOTE: Logout button handler is registered ONLY in app_main.js to prevent duplicate toasts
// Setup UI update listener
document.addEventListener('DOMContentLoaded', () => {
    // Update UI based on auth state
    auth.onAuthChange((user) => {
        const navbar = document.getElementById('navbar');
        const usernameDisplay = document.getElementById('username-display');
        const userRole = document.getElementById('user-role');
        
        if (user) {
            navbar.classList.remove('hidden');
            if (usernameDisplay) usernameDisplay.textContent = user.username;
            if (userRole) {
                userRole.textContent = user.role === 'admin' ? 'Administrator' : 'Igrač';
                userRole.className = `role-badge ${user.role}`;
            }
        } else {
            navbar.classList.add('hidden');
        }
    });
});

export default auth;
