/**
 * Main Application Entry Point
 */

import auth from './auth.js';
import router from './router.js';
import notificationsManager from './notifications.js';
import wsManager from './websocket.js';

// Initialize application
async function initializeApp() {
    console.log('🎮 COTISA - Starting...');
    
    // Setup navbar
    setupNavbar();
    
    // Check session
    const user = auth.getUser();
    const authToken = localStorage.getItem('cotisa_auth_token');
    
    if (user && authToken) {
        console.log('✅ User logged in:', user.username);
        console.log('✅ Auth token present');
        showNavbar();
        updateNavbar(user);
        // Initialize notifications after a short delay to ensure everything is ready
        setTimeout(() => {
            notificationsManager.init();
        }, 500);
        // Initialize WebSocket connection
        initWebSocket(user.id);
    } else if (user && !authToken) {
        console.log('⚠️ User data exists but no auth token - clearing session');
        // Clear invalid session
        localStorage.removeItem('cotisa_user');
        localStorage.removeItem('cotisa_session');
        hideNavbar();
    } else {
        console.log('ℹ️ No active session');
        hideNavbar();
    }
    
    // Setup global logout button - use event delegation for better reliability
    document.addEventListener('click', async (e) => {
        const logoutBtn = e.target.closest('#logout-btn');
        if (logoutBtn) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚪 Logout button clicked');
            notificationsManager.destroy();
            wsManager.disconnect();
            await auth.logout();
            hideNavbar();
            router.navigate('/login');
        }
    });
    
    // Mobile touch support for logout
    document.addEventListener('touchend', async (e) => {
        const logoutBtn = e.target.closest('#logout-btn') || e.target.closest('.logout-item');
        if (logoutBtn) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚪 Logout button touched (mobile)');
            notificationsManager.destroy();
            wsManager.disconnect();
            await auth.logout();
            hideNavbar();
            router.navigate('/login');
        }
    }, { passive: false });
    
    console.log('✅ Application initialized');
}

// Initialize WebSocket and setup event handlers
function initWebSocket(userId) {
    wsManager.connect(userId);
    
    // Handle new notifications
    wsManager.on('notification:new', (notification) => {
        notificationsManager.addNotification(notification);
    });
    
    // Handle game updates
    wsManager.on('game:move', (data) => {
        // Trigger custom event for game view to handle
        window.dispatchEvent(new CustomEvent('ws:game:move', { detail: data }));
    });
    
    wsManager.on('game:end', (data) => {
        window.dispatchEvent(new CustomEvent('ws:game:end', { detail: data }));
    });
    
    // Handle tournament updates
    wsManager.on('tournament:update', (data) => {
        window.dispatchEvent(new CustomEvent('ws:tournament:update', { detail: data }));
    });
    
    // Handle match updates
    wsManager.on('match:update', (data) => {
        window.dispatchEvent(new CustomEvent('ws:match:update', { detail: data }));
    });
}

function setupNavbar() {
    // Show/hide admin link based on role
    const user = auth.getUser();
    const adminLink = document.getElementById('nav-admin');
    
    // Always hide admin link initially, only show after confirming admin role
    if (adminLink) {
        adminLink.style.display = 'none';
        if (user && user.role === 'admin') {
            adminLink.style.display = 'block';
        }
    }
}

function showNavbar() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.classList.remove('hidden');
    }
}

function hideNavbar() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.classList.add('hidden');
    }
    // Reset sidebar to top nav when hiding navbar (logout)
    document.body.setAttribute('data-tabs-position', 'top');
}

function updateNavbar(user) {
    const usernameDisplay = document.getElementById('username-display');
    const userRole = document.getElementById('user-role');
    const adminLink = document.getElementById('nav-admin');
    
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }
    
    if (userRole) {
        userRole.textContent = user.role === 'admin' ? 'Admin' : 'Igrač';
        userRole.className = `role-badge ${user.role}`;
    }
    
    // Update dropdown email and username
    const dropdownUsername = document.getElementById('dropdown-username');
    const dropdownEmail = document.getElementById('dropdown-email');
    
    if (dropdownUsername) {
        dropdownUsername.textContent = user.username;
    }
    
    if (dropdownEmail && user.email) {
        dropdownEmail.textContent = user.email;
    }
    
    // Update user dropdown manager if available
    if (window.userDropdownManager && window.userDropdownManager.updateUserInfo) {
        window.userDropdownManager.updateUserInfo();
    }
    
    // Show/hide admin link based on role - ALWAYS explicitly set to ensure correct state
    if (adminLink) {
        // Force hide for non-admins, only show for admins
        if (user && user.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }
}

// Export functions for use by other modules
export function refreshNavbar() {
    const user = auth.getUser();
    if (user) {
        showNavbar();
        updateNavbar(user);
        notificationsManager.init();
    } else {
        hideNavbar();
        notificationsManager.destroy();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Make functions globally available
window.app_main = {
    refreshNavbar,
    showNavbar,
    hideNavbar
};

export default {
    initializeApp,
    refreshNavbar,
    showNavbar,
    hideNavbar
};
