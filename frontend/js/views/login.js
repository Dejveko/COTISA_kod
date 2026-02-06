// Login View
import auth from '../auth.js';
import router from '../router.js';
import { showToast } from '../utils.js';

// Get translation function
const t = (key) => window.t ? window.t(key) : key;

export async function renderLogin() {
    console.log('📱 Login view rendering...');
    
    // Redirect if already logged in
    if (auth.isAuthenticated()) {
        router.navigate('/dashboard');
        return;
    }
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Language Selector -->
        <div id="login-language-selector" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
            <div style="position: relative;">
                <button id="lang-dropdown-btn" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                    <span id="current-lang-flag">🇭🇷</span>
                    <span id="current-lang-name">Hrvatski</span>
                    <span style="font-size: 10px;">▼</span>
                </button>
                <div id="lang-dropdown" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 5px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; min-width: 150px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    <div class="lang-option" data-lang="hr" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: var(--text-primary);">
                        <span>🇭🇷</span> Hrvatski
                    </div>
                    <div class="lang-option" data-lang="en" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: var(--text-primary);">
                        <span>🇺🇸</span> English
                    </div>
                    <div class="lang-option" data-lang="de" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: var(--text-primary);">
                        <span>🇩🇪</span> Deutsch
                    </div>
                    <div class="lang-option" data-lang="es" style="padding: 10px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; color: var(--text-primary);">
                        <span>🇪🇸</span> Español
                    </div>
                </div>
            </div>
        </div>
        
        <div class="auth-container" style="pointer-events: auto;">
            <div class="auth-card" style="pointer-events: auto;">
                <div class="auth-header">
                    <img src="images/logo_cotisa.png" alt="COTISA" class="logo-icon auth-logo">
                    <p>${t('auth.loginSubtitle')}</p>
                </div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">${t('auth.username')}</label>
                        <input 
                            type="text" 
                            id="username" 
                            class="form-control" 
                            placeholder="${t('auth.usernamePlaceholder')}"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">${t('auth.password')}</label>
                        <input 
                            type="password" 
                            id="password" 
                            class="form-control" 
                            placeholder="${t('auth.passwordPlaceholder')}"
                            required
                        >
                    </div>
                    
                    <div style="text-align: right; margin-bottom: 15px;">
                        <a href="#" id="forgot-password-link" style="color: #a5b4fc; font-size: 0.9rem; text-decoration: none;">${t('auth.forgotPassword')}</a>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block" style="pointer-events: auto; position: relative; z-index: 100; touch-action: manipulation;">
                        ${t('auth.loginBtn')}
                    </button>
                </form>
                
                <div style="text-align: center; margin: 20px 0; color: var(--text-secondary);">
                    <span style="background: var(--bg-card); padding: 0 10px;">${t('common.or')}</span>
                    <hr style="margin-top: -12px; border: none; border-top: 1px solid var(--border-color);">
                </div>
                
                <!-- Google Login Button -->
                <button id="google-login-btn" class="btn btn-block" style="background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; pointer-events: auto; position: relative; z-index: 100; touch-action: manipulation;">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    ${t('auth.loginWithGoogle')}
                </button>
                
                <!-- Chess.com Login Button - DISABLED FOR NOW -->
                <!-- 
                <button id="chesscom-login-btn" class="btn btn-block" style="background: #769656; color: white; margin-bottom: 10px;">
                    <svg style="width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V8h2v2zm0-4H6V4h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v2z"/>
                    </svg>
                    Registracija s Chess.com računom
                </button>
                -->
                
                <div class="auth-link" style="color: #a0aec0;">
                    ${t('auth.noAccount')} <a href="#/register" data-route="/register" style="color: #a5b4fc;">${t('auth.registerBtn')}</a>
                </div>
            </div>
        </div>
        
        <!-- Chess.com Login Modal -->
        <div id="chesscom-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--overlay-bg); z-index: 1000;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card); padding: 30px; border-radius: 8px; max-width: 450px; width: 90%;">
                <h3 style="margin-top: 0; color: var(--text-primary);">Registracija s Chess.com</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">Unesi svoje Chess.com korisničko ime i kreiraj lozinku za COTISA. Tvoje statistike će biti automatski uvezene.</p>
                <form id="chesscom-form">
                    <div class="form-group">
                        <label for="chesscom-username">Chess.com korisničko ime*</label>
                        <input 
                            type="text" 
                            id="chesscom-username" 
                            class="form-control" 
                            placeholder="Npr. magnuscarlsen"
                            required
                        >
                        <small style="color: var(--text-tertiary);">Provjerit ćemo da li korisnik postoji na Chess.com</small>
                    </div>
                    <div class="form-group">
                        <label for="chesscom-password">Lozinka za COTISA*</label>
                        <input 
                            type="password" 
                            id="chesscom-password" 
                            class="form-control" 
                            placeholder="Minimalno 6 znakova"
                            required
                            minlength="6"
                        >
                        <small style="color: var(--text-tertiary);">Ova lozinka je za prijavu na COTISA, ne Chess.com</small>
                    </div>
                    <div class="form-group">
                        <label for="chesscom-email">Email (opcionalno)</label>
                        <input 
                            type="email" 
                            id="chesscom-email" 
                            class="form-control" 
                            placeholder="tvoj.email@example.com"
                        >
                    </div>
                    <div id="chesscom-error" style="color: red; margin-top: 10px; display: none;"></div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" id="chesscom-cancel" class="btn btn-secondary" style="flex: 1;">Odustani</button>
                        <button type="submit" class="btn btn-primary" style="flex: 1;">Kreiraj račun</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Form submission for regular login
    const form = document.getElementById('login-form');
    console.log('📱 Login form found:', !!form);
    
    const handleLogin = async (e) => {
        console.log('📱 Login handler triggered!');
        e.preventDefault();
        e.stopPropagation();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        console.log('📱 Attempting login for:', username);
        
        if (!username || !password) {
            showToast(t('auth.enterCredentials'), 'error');
            return;
        }
        
        const success = await auth.login(username, password);
        if (success) {
            router.navigate('/dashboard');
        }
    };
    
    form.addEventListener('submit', handleLogin);
    console.log('📱 Submit listener added');
    
    // Also add click handler on submit button for mobile compatibility
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        console.log('📱 Submit button found, adding click listener');
        submitBtn.addEventListener('click', (e) => {
            console.log('📱 Submit button clicked!');
            // Only handle if form won't submit naturally
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            handleLogin(e);
        });
        
        // Add touch event for mobile
        submitBtn.addEventListener('touchend', (e) => {
            console.log('📱 Submit button touched!');
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            handleLogin(e);
        }, { passive: false });
    }
    
    // Google Login - initialize and handle
    initGoogleSignIn();
    
    // Language selector handlers
    const langDropdownBtn = document.getElementById('lang-dropdown-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    const currentLangFlag = document.getElementById('current-lang-flag');
    const currentLangName = document.getElementById('current-lang-name');
    
    const langData = {
        hr: { flag: '🇭🇷', name: 'Hrvatski' },
        en: { flag: '🇺🇸', name: 'English' },
        de: { flag: '🇩🇪', name: 'Deutsch' },
        es: { flag: '🇪🇸', name: 'Español' }
    };
    
    // Set current language on load
    const currentLang = localStorage.getItem('cotisa-language') || 'hr';
    if (langData[currentLang]) {
        currentLangFlag.textContent = langData[currentLang].flag;
        currentLangName.textContent = langData[currentLang].name;
    }
    
    // Toggle dropdown
    langDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.style.display = langDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        langDropdown.style.display = 'none';
    });
    
    // Language option click
    langOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            option.style.background = 'var(--bg-hover)';
        });
        option.addEventListener('mouseleave', () => {
            option.style.background = 'transparent';
        });
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = option.dataset.lang;
            if (langData[lang]) {
                currentLangFlag.textContent = langData[lang].flag;
                currentLangName.textContent = langData[lang].name;
                localStorage.setItem('cotisa-language', lang);
                document.documentElement.setAttribute('lang', lang);
                
                // Update i18n if available
                if (window.i18n && window.i18n.setLanguage) {
                    window.i18n.setLanguage(lang);
                }
                
                langDropdown.style.display = 'none';
                
                // Reload page to apply translations
                window.location.reload();
            }
        });
    });
    
    // Forgot password link handler
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('/forgot-password');
        });
    }
    
    // Chess.com login button (only if element exists - it may be commented out)
    const chesscomLoginBtn = document.getElementById('chesscom-login-btn');
    if (chesscomLoginBtn) {
        chesscomLoginBtn.addEventListener('click', () => {
            document.getElementById('chesscom-modal').style.display = 'block';
        });
    }
    
    // Chess.com modal cancel (only if element exists)
    const chesscomCancelBtn = document.getElementById('chesscom-cancel');
    if (chesscomCancelBtn) {
        chesscomCancelBtn.addEventListener('click', () => {
            document.getElementById('chesscom-modal').style.display = 'none';
            document.getElementById('chesscom-form').reset();
            document.getElementById('chesscom-error').style.display = 'none';
        });
    }
    
    // Chess.com form submission (only if element exists)
    const chesscomForm = document.getElementById('chesscom-form');
    if (chesscomForm) {
        chesscomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const chesscom_username = document.getElementById('chesscom-username').value.trim();
        const password = document.getElementById('chesscom-password').value;
        const email = document.getElementById('chesscom-email').value.trim();
        const errorDiv = document.getElementById('chesscom-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!chesscom_username || !password) {
            errorDiv.textContent = 'Chess.com korisničko ime i lozinka su obavezni';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = 'Lozinka mora imati najmanje 6 znakova';
            errorDiv.style.display = 'block';
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Provjeravam Chess.com...';
        errorDiv.style.display = 'none';
        
        try {
            const response = await fetch('/api/chesscom-login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    chesscom_username, 
                    password,
                    email: email || undefined 
                })
            });
            
            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Server nije dostupan. Molimo pokušajte kasnije.');
            }
            
            if (!response.ok) {
                throw new Error(data.error || 'Greška pri registraciji');
            }
            
            if (data.success) {
                // Save user and redirect
                auth.saveUser(data.user);
                
                let toastMsg = `Račun uspješno kreiran!`;
                if (data.login_info) {
                    toastMsg += `\n${data.login_info}`;
                }
                if (data.user.elo_rating) {
                    toastMsg += `\n\nStatistike uvezene:\n`;
                    toastMsg += `• Rapid: ${data.user.elo_rapid || 'N/A'}\n`;
                    toastMsg += `• Blitz: ${data.user.elo_blitz || 'N/A'}\n`;
                    toastMsg += `• Bullet: ${data.user.elo_bullet || 'N/A'}\n`;
                    toastMsg += `• Pobjede: ${data.user.wins}`;
                }
                
                showToast(toastMsg, 'success');
                
                document.getElementById('chesscom-modal').style.display = 'none';
                
                // Update navbar and navigate
                if (window.app_main && window.app_main.refreshNavbar) {
                    window.app_main.refreshNavbar();
                }
                
                // Redirect after showing message
                setTimeout(() => {
                    router.navigate('/dashboard');
                }, 2000);
            } else {
                errorDiv.textContent = data.error || 'Greška pri registraciji';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Chess.com login error:', error);
            errorDiv.textContent = error.message || 'Greška pri povezivanju s Chess.com API';
            errorDiv.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kreiraj račun';
        }
        });
    }
}

// Google Sign-In initialization
function initGoogleSignIn() {
    // Load Google Identity Services library if not already loaded
    if (!window.google || !window.google.accounts) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setupGoogleButton();
        };
        document.head.appendChild(script);
    } else {
        setupGoogleButton();
    }
}

function setupGoogleButton() {
    const googleBtn = document.getElementById('google-login-btn');
    if (!googleBtn) return;
    
    // Initialize Google Identity Services
    google.accounts.id.initialize({
        client_id: '317287661880-2nf8gqm552dap5lbih4fqvg35shpnh41.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse
    });
    
    googleBtn.addEventListener('click', () => {
        // Show Google One Tap prompt
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // If One Tap doesn't show, use popup
                google.accounts.oauth2.initCodeClient({
                    client_id: '317287661880-2nf8gqm552dap5lbih4fqvg35shpnh41.apps.googleusercontent.com',
                    scope: 'email profile',
                    ux_mode: 'popup',
                    callback: (response) => {
                        // For auth code flow, we need to handle differently
                        // But for ID token flow, use the ID token method
                    }
                });
                
                // Alternative: render a custom Google button
                const tempDiv = document.createElement('div');
                tempDiv.id = 'google-signin-temp';
                tempDiv.style.position = 'absolute';
                tempDiv.style.opacity = '0';
                document.body.appendChild(tempDiv);
                
                google.accounts.id.renderButton(tempDiv, {
                    type: 'standard',
                    size: 'large'
                });
                
                // Click the hidden Google button
                setTimeout(() => {
                    const btn = tempDiv.querySelector('div[role="button"]');
                    if (btn) btn.click();
                    setTimeout(() => tempDiv.remove(), 100);
                }, 100);
            }
        });
    });
}

async function handleGoogleCredentialResponse(response) {
    const t = (key) => window.t ? window.t(key) : key;
    try {
        showToast(t('auth.loggingIn'), 'info');
        
        // Send the ID token to our backend
        const apiResponse = await fetch('/api/google-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: response.credential
            })
        });
        
        const data = await apiResponse.json();
        
        if (data.success) {
            // Save user data AND auth token
            auth.setUser(data.user, data.auth_token);
            
            showToast(`${t('auth.welcomeUser')}, ${data.user.username}!`, 'success');
            
            // Update navbar
            if (window.app_main && window.app_main.refreshNavbar) {
                window.app_main.refreshNavbar();
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                router.navigate('/dashboard');
            }, 1000);
        } else {
            showToast(data.error || t('auth.googleLoginError'), 'error');
        }
    } catch (error) {
        console.error('Google login error:', error);
        showToast(t('auth.serverError'), 'error');
    }
}

// Register route
import routerInstance from '../router.js';
routerInstance.register('/login', renderLogin, false);
