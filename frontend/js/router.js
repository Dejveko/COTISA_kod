// SPA Router - Client-side routing without page reload
import auth from './auth.js';

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.retryCount = 0;
        this.maxRetries = 50; // Max 5 seconds of waiting (50 * 100ms)
        this.initialized = false;
        this.expectedMinRoutes = 10; // Minimum expected routes before starting
        this.startDelay = 500; // Wait at least 500ms for all modules to load
        this.startTimer = null;
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            if (this.initialized) {
                this.handleRoute();
            }
        });
    }
    
    // Start the router - call this after all routes are registered
    start() {
        if (this.initialized) return;
        
        // Clear any existing timer
        if (this.startTimer) {
            clearTimeout(this.startTimer);
        }
        
        this.waitForRoutes();
    }
    
    // Wait for routes to be registered - need minimum routes OR timeout
    waitForRoutes() {
        const checkRoutes = () => {
            const routeCount = Object.keys(this.routes).length;
            
            // Start if we have enough routes OR we've waited long enough
            if (routeCount >= this.expectedMinRoutes) {
                console.log(`Router: ${routeCount} routes registered (>= ${this.expectedMinRoutes}), starting...`);
                this.initialized = true;
                this.handleRoute();
            } else if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                // After initial delay, start checking more frequently
                const delay = this.retryCount === 1 ? this.startDelay : 100;
                setTimeout(checkRoutes, delay);
            } else {
                // Fallback - start anyway if we have at least some routes
                if (routeCount > 0) {
                    console.warn(`Router: Only ${routeCount} routes registered after waiting, starting anyway...`);
                    this.initialized = true;
                    this.handleRoute();
                } else {
                    console.error('Router: No routes registered after waiting');
                    document.getElementById('app').innerHTML = `
                        <div style="text-align: center; padding: 50px;">
                            <h2>Greška pri učitavanju aplikacije</h2>
                            <p>Molimo osvježite stranicu.</p>
                            <button onclick="location.reload()" class="btn btn-primary">Osvježi</button>
                        </div>
                    `;
                }
            }
        };
        
        // Start checking after initial delay to let modules load
        setTimeout(checkRoutes, 50);
    }
    
    // Register a route
    register(path, handler, requireAuth = true) {
        this.routes[path] = { handler, requireAuth };
        // Auto-start if not yet started
        if (!this.initialized && this.retryCount === 0) {
            this.start();
        }
    }
    
    // Handle current route
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        
        // Handle root path - redirect immediately
        if (hash === '/' || hash === '') {
            if (auth.isAuthenticated()) {
                window.location.hash = '#/dashboard';
            } else {
                window.location.hash = '#/login';
            }
            return;
        }
        
        // Find matching route
        let route = null;
        let params = [];
        let matchedKey = null;
        
        // First try exact match
        if (this.routes[hash]) {
            route = this.routes[hash];
            matchedKey = hash;
        } else {
            // Try to match routes with parameters (e.g., /tournament/:id matches /tournament/123)
            for (const key of Object.keys(this.routes)) {
                const pattern = key.replace(/:\w+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                const match = hash.match(regex);
                
                if (match) {
                    route = this.routes[key];
                    matchedKey = key;
                    // Extract parameters from match (skip first element which is the full match)
                    params = match.slice(1);
                    break;
                }
            }
        }
        
        // Default to dashboard if logged in, login if not
        // BUT don't redirect password reset routes - wait for the module to load
        if (!route) {
            // Special handling for password reset routes - don't redirect, wait for module
            if (hash.startsWith('/reset-password/') || hash === '/forgot-password') {
                console.log('Router: Password reset route detected, waiting for module...');
                if (this.retryCount < 20) {
                    this.retryCount++;
                    setTimeout(() => this.handleRoute(), 100);
                    return;
                }
            }
            
            if (auth.isAuthenticated()) {
                window.location.hash = '#/dashboard';
            } else {
                window.location.hash = '#/login';
            }
            return;
        }
        
        // Check authentication
        if (route.requireAuth && !auth.isAuthenticated()) {
            window.location.hash = '#/login';
            return;
        }
        
        // Execute route handler
        this.currentRoute = matchedKey;
        try {
            // Ensure DOM is ready before executing handler
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }
            
            // Ensure app container exists
            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('Router: App container not found, retrying...');
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            await route.handler(...params);
        } catch (error) {
            console.error('Route handler error:', error);
            // Don't show error page for race condition errors, retry once
            if (error.message && error.message.includes('null')) {
                console.log('Router: Possible race condition, retrying route...');
                setTimeout(() => this.handleRoute(), 100);
                return;
            }
            this.showError('Greška pri učitavanju stranice');
        }
    }
    
    // Navigate to a route
    navigate(path) {
        window.location.hash = `#${path}`;
    }
    
    // Go back
    back() {
        window.history.back();
    }
    
    // Show error page
    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="card text-center">
                    <h2>⚠️ Greška</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.location.hash='#/dashboard'">
                        Povratak na Dashboard
                    </button>
                </div>
            </div>
        `;
    }
}

// Create and export singleton
const router = new Router();

// Setup link click handlers
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-route]');
        if (link) {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            router.navigate(route);
        }
    });
});

export default router;
