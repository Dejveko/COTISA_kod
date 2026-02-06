/**
 * COTISA Pro - Theme Management System
 * Handles theme switching and persistence
 */

class ThemeManager {
    constructor() {
        this.themeKey = 'cotisa-theme';
        this.currentTheme = this.getStoredTheme() || 'light';
        console.log('🎨 ThemeManager initialized - Current theme:', this.currentTheme);
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        console.log('🎨 ThemeManager.init() - Current theme:', this.currentTheme);
        // DON'T call applyTheme here - theme is already applied in HTML head
        // Just update the UI selectors
        this.updateThemeSelector(this.currentTheme);
        this.setupThemeSelector();
        this.setupThemeListeners();
    }

    /**
     * Get stored theme from localStorage
     */
    getStoredTheme() {
        try {
            const theme = localStorage.getItem(this.themeKey);
            console.log('🔍 theme.js - getStoredTheme():', theme);
            return theme;
        } catch (e) {
            console.error('Error reading theme from localStorage:', e);
            return null;
        }
    }

    /**
     * Store theme in localStorage
     */
    storeTheme(theme) {
        try {
            localStorage.setItem(this.themeKey, theme);
            console.log('💾 theme.js - storeTheme():', theme);
        } catch (e) {
            console.error('Error storing theme in localStorage:', e);
        }
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        console.log('🎨 theme.js - applyTheme():', theme);
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.storeTheme(theme);
        this.updateThemeSelector(theme);
        
        // Emit custom event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }

    /**
     * Switch to a different theme
     */
    switchTheme(theme) {
        if (this.isValidTheme(theme)) {
            this.applyTheme(theme);
        } else {
            console.error('Invalid theme:', theme);
        }
    }

    /**
     * Check if theme is valid
     */
    isValidTheme(theme) {
        const validThemes = ['light', 'dark', 'blue', 'purple', 'green', 'sunset'];
        return validThemes.includes(theme);
    }

    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return [
            { id: 'light', name: 'Svijetla', icon: '☀️' },
            { id: 'dark', name: 'Tamna', icon: '🌙' },
            { id: 'blue', name: 'Plavi Ocean', icon: '🌊' },
            { id: 'purple', name: 'Ljubičasti San', icon: '💜' },
            { id: 'green', name: 'Zelena Šuma', icon: '🌲' },
            { id: 'sunset', name: 'Zalazak Sunca', icon: '🌅' }
        ];
    }

    /**
     * Setup theme selector dropdown
     */
    setupThemeSelector() {
        const selector = document.getElementById('theme-selector');
        if (!selector) return;

        const themes = this.getAvailableThemes();
        const currentThemeData = themes.find(t => t.id === this.currentTheme);
        
        // Update button text
        const button = selector.querySelector('.theme-btn');
        if (button && currentThemeData) {
            button.innerHTML = `${currentThemeData.icon} ${currentThemeData.name}`;
        }

        // Update dropdown items
        const dropdown = selector.querySelector('.theme-dropdown');
        if (dropdown) {
            dropdown.innerHTML = themes.map(theme => `
                <div class="theme-option ${theme.id === this.currentTheme ? 'active' : ''}" 
                     data-theme="${theme.id}">
                    <span class="theme-icon">${theme.icon}</span>
                    <span class="theme-name">${theme.name}</span>
                    ${theme.id === this.currentTheme ? '<span class="theme-check">✓</span>' : ''}
                </div>
            `).join('');

            // Add click listeners to theme options
            dropdown.querySelectorAll('.theme-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const theme = option.getAttribute('data-theme');
                    this.switchTheme(theme);
                    this.closeThemeDropdown();
                });
            });
        }
    }

    /**
     * Update theme selector UI
     */
    updateThemeSelector(theme) {
        const themes = this.getAvailableThemes();
        const currentThemeData = themes.find(t => t.id === theme);
        
        // Update button
        const button = document.querySelector('.theme-btn');
        if (button && currentThemeData) {
            button.innerHTML = `${currentThemeData.icon} ${currentThemeData.name}`;
        }

        // Update active state in dropdown
        document.querySelectorAll('.theme-option').forEach(option => {
            const optionTheme = option.getAttribute('data-theme');
            if (optionTheme === theme) {
                option.classList.add('active');
                if (!option.querySelector('.theme-check')) {
                    option.innerHTML += '<span class="theme-check">✓</span>';
                }
            } else {
                option.classList.remove('active');
                const check = option.querySelector('.theme-check');
                if (check) check.remove();
            }
        });
    }

    /**
     * Setup theme-related event listeners
     */
    setupThemeListeners() {
        // Theme selector toggle
        const themeBtn = document.querySelector('.theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleThemeDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#theme-selector')) {
                this.closeThemeDropdown();
            }
        });

        // Keyboard support (Escape to close)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeThemeDropdown();
            }
        });
    }

    /**
     * Toggle theme dropdown
     */
    toggleThemeDropdown() {
        const dropdown = document.querySelector('.theme-dropdown');
        const selector = document.getElementById('theme-selector');
        
        if (dropdown && selector) {
            const isOpen = dropdown.classList.contains('show');
            
            if (isOpen) {
                this.closeThemeDropdown();
            } else {
                // Close user menu if open
                this.closeUserMenu();
                
                dropdown.classList.add('show');
                selector.classList.add('active');
            }
        }
    }

    /**
     * Close theme dropdown
     */
    closeThemeDropdown() {
        const dropdown = document.querySelector('.theme-dropdown');
        const selector = document.getElementById('theme-selector');
        
        if (dropdown) dropdown.classList.remove('show');
        if (selector) selector.classList.remove('active');
    }

    /**
     * Close user menu (to avoid overlap)
     */
    closeUserMenu() {
        const userMenu = document.querySelector('.user-dropdown');
        if (userMenu) {
            userMenu.classList.remove('show');
        }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Toggle between light and dark theme
     */
    toggleDarkMode() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.switchTheme(newTheme);
    }
}

// Initialize theme manager when DOM is ready
let themeManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
        window.themeManager = themeManager;
    });
} else {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
}

// Export for use in modules
export default ThemeManager;
export { themeManager };
