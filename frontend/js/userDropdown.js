/**
 * COTISA Pro - User Dropdown Menu Handler
 * Manages user dropdown menu interactions
 */

class UserDropdownManager {
    constructor() {
        this.dropdownContainer = null;
        this.dropdownMenu = null;
        this.dropdownBtn = null;
        this.init();
    }

    /**
     * Initialize dropdown manager
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup dropdown elements and listeners
     */
    setup() {
        this.dropdownContainer = document.querySelector('.user-dropdown-container');
        this.dropdownMenu = document.getElementById('user-dropdown');
        this.dropdownBtn = document.getElementById('user-dropdown-btn');

        if (!this.dropdownBtn || !this.dropdownMenu) {
            console.warn('User dropdown elements not found');
            return;
        }

        this.setupEventListeners();
        this.updateUserInfo();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle dropdown on button click
        this.dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-dropdown-container') && 
                !e.target.closest('.theme-selector')) {
                this.closeDropdown();
            }
        });

        // Close dropdown when clicking menu items
        this.dropdownMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeDropdown();
            });
        });

        // NOTE: Logout is now handled by inline onclick handlers in each HTML file
        // to avoid conflicts with event delegation. See index.html, settings.html, help.html

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });

        // Listen for auth state changes
        document.addEventListener('authStateChanged', (e) => {
            this.updateUserInfo();
        });
    }

    /**
     * Handle logout - clear storage and redirect to login
     */
    handleLogout() {
        // Clear all auth-related localStorage
        localStorage.removeItem('cotisa_user');
        localStorage.removeItem('cotisa_session');
        localStorage.removeItem('cotisa_auth_token');
        
        console.log('✅ Logged out, redirecting to login...');
        
        // Redirect to login page
        window.location.href = 'index.html#/login';
    }

    /**
     * Toggle dropdown menu
     */
    toggleDropdown() {
        const isOpen = this.dropdownMenu.classList.contains('show');
        
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    /**
     * Open dropdown menu
     */
    openDropdown() {
        // Close theme dropdown if open
        this.closeThemeDropdown();
        
        this.dropdownMenu.classList.add('show');
        this.dropdownContainer.classList.add('active');
    }

    /**
     * Close dropdown menu
     */
    closeDropdown() {
        this.dropdownMenu.classList.remove('show');
        if (this.dropdownContainer) {
            this.dropdownContainer.classList.remove('active');
        }
    }

    /**
     * Close theme dropdown (to avoid overlap)
     */
    closeThemeDropdown() {
        const themeDropdown = document.querySelector('.theme-dropdown');
        const themeSelector = document.getElementById('theme-selector');
        
        if (themeDropdown) themeDropdown.classList.remove('show');
        if (themeSelector) themeSelector.classList.remove('active');
    }

    /**
     * Update user info in dropdown
     */
    updateUserInfo() {
        try {
            // Get user from localStorage using correct key
            const userStr = localStorage.getItem('cotisa_user');
            console.log('📧 UserDropdown - raw localStorage:', userStr);
            if (!userStr) return;

            const user = JSON.parse(userStr);
            console.log('📧 UserDropdown - parsed user:', user);
            console.log('📧 UserDropdown - user.email:', user.email);
            
            // Update username displays
            const usernameDisplay = document.getElementById('username-display');
            const dropdownUsername = document.getElementById('dropdown-username');
            const dropdownEmail = document.getElementById('dropdown-email');
            const userAvatar = document.querySelector('.user-avatar');
            
            console.log('📧 dropdownEmail element:', dropdownEmail);
            
            if (usernameDisplay && user.username) {
                usernameDisplay.textContent = user.username;
            }
            
            if (dropdownUsername && user.username) {
                dropdownUsername.textContent = user.username;
            }
            
            if (dropdownEmail && user.email) {
                console.log('📧 Setting email to:', user.email);
                dropdownEmail.textContent = user.email;
            } else {
                console.log('📧 NOT setting email - dropdownEmail:', !!dropdownEmail, 'user.email:', user.email);
            }
            
            // Update profile picture
            if (userAvatar) {
                if (user.profile_picture) {
                    // If user has profile picture, show it
                    userAvatar.innerHTML = `<img src="${user.profile_picture}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                } else if (user.google_picture) {
                    // If user has Google picture, show it
                    userAvatar.innerHTML = `<img src="${user.google_picture}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                } else {
                    // Default avatar icon
                    userAvatar.innerHTML = '👤';
                }
            }
            
            // Update role badge
            const roleBadge = document.getElementById('user-role');
            if (roleBadge && user.role) {
                const roleText = user.role === 'admin' ? 'Administrator' : 'Igrač';
                roleBadge.textContent = roleText;
                roleBadge.className = 'role-badge';
                if (user.role === 'admin') {
                    roleBadge.classList.add('admin');
                }
            }
            
            // Show/hide admin-only elements
            const adminLink = document.getElementById('admin-link') || document.getElementById('nav-admin');
            const adminDashboardLink = document.getElementById('admin-dashboard-link');
            if (user.role === 'admin') {
                if (adminLink) adminLink.style.display = 'block';
                if (adminDashboardLink) adminDashboardLink.style.display = 'flex';
            } else {
                if (adminLink) adminLink.style.display = 'none';
                if (adminDashboardLink) adminDashboardLink.style.display = 'none';
            }
        } catch (e) {
            console.error('Error updating user info:', e);
        }
    }

    /**
     * Set user data
     */
    setUserData(userData) {
        if (!userData) return;
        
        const usernameDisplay = document.getElementById('username-display');
        const dropdownUsername = document.getElementById('dropdown-username');
        const dropdownEmail = document.getElementById('dropdown-email');
        const roleBadge = document.getElementById('user-role');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (usernameDisplay && userData.username) {
            usernameDisplay.textContent = userData.username;
        }
        
        if (dropdownUsername && userData.username) {
            dropdownUsername.textContent = userData.username;
        }
        
        if (dropdownEmail && userData.email) {
            dropdownEmail.textContent = userData.email;
        }
        
        // Update profile picture
        if (userAvatar) {
            if (userData.profile_picture) {
                userAvatar.innerHTML = `<img src="${userData.profile_picture}" alt="${userData.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else if (userData.google_picture) {
                userAvatar.innerHTML = `<img src="${userData.google_picture}" alt="${userData.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                userAvatar.innerHTML = '👤';
            }
        }
        
        if (roleBadge && userData.role) {
            const roleText = userData.role === 'admin' ? 'Administrator' : 'Igrač';
            roleBadge.textContent = roleText;
            roleBadge.className = 'role-badge';
            if (userData.role === 'admin') {
                roleBadge.classList.add('admin');
            }
        }
        
        // Show/hide admin-only elements
        const adminLink = document.getElementById('admin-link');
        const adminDashboardLink = document.getElementById('admin-dashboard-link');
        if (userData.role === 'admin') {
            if (adminLink) adminLink.style.display = 'block';
            if (adminDashboardLink) adminDashboardLink.style.display = 'flex';
        } else {
            if (adminLink) adminLink.style.display = 'none';
            if (adminDashboardLink) adminDashboardLink.style.display = 'none';
        }
    }
}

// Initialize user dropdown manager
let userDropdownManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        userDropdownManager = new UserDropdownManager();
        window.userDropdownManager = userDropdownManager;
    });
} else {
    userDropdownManager = new UserDropdownManager();
    window.userDropdownManager = userDropdownManager;
}

// Export for use in modules
export default UserDropdownManager;
export { userDropdownManager };
