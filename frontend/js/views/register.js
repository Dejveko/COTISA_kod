// Register View
import auth from '../auth.js';
import router from '../router.js';
import { showToast, isValidEmail } from '../utils.js';

// Get translation function
const t = (key) => window.t ? window.t(key) : key;

export async function renderRegister() {
    console.log('📱 Register view rendering...');
    
    // Redirect if already logged in
    if (auth.isAuthenticated()) {
        router.navigate('/dashboard');
        return;
    }
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Language Selector -->
        <div id="register-language-selector" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
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
            <div class="auth-card">
                <div class="auth-header">
                    <img src="images/logo_cotisa.png" alt="COTISA" class="logo-icon auth-logo">
                    <p>${t('auth.registerSubtitle')}</p>
                </div>
                
                <form id="register-form">
                    <div class="form-group">
                        <label for="username">${t('auth.username')}</label>
                        <input 
                            type="text" 
                            id="username" 
                            class="form-control" 
                            placeholder="${t('auth.usernamePlaceholder')}"
                            required
                            minlength="3"
                        >
                        <span class="error-message" id="username-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">${t('auth.email')}</label>
                        <input 
                            type="email" 
                            id="email" 
                            class="form-control" 
                            placeholder="${t('auth.emailPlaceholder')}"
                            required
                        >
                        <span class="error-message" id="email-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">${t('auth.password')}</label>
                        <input 
                            type="password" 
                            id="password" 
                            class="form-control" 
                            placeholder="${t('auth.passwordMinHint')}"
                            required
                            minlength="6"
                        >
                        <span class="error-message" id="password-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="password-confirm">${t('auth.confirmPassword')}</label>
                        <input 
                            type="password" 
                            id="password-confirm" 
                            class="form-control" 
                            placeholder="${t('auth.confirmPasswordPlaceholder')}"
                            required
                        >
                        <span class="error-message" id="password-confirm-error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="experience-level">${t('auth.experienceLevel')}</label>
                        <select id="experience-level" class="form-control" required>
                            <option value="">${t('auth.experienceSelect')}</option>
                            <option value="beginner">${t('auth.experienceBeginner')}</option>
                            <option value="intermediate" selected>${t('auth.experienceIntermediate')}</option>
                            <option value="advanced">${t('auth.experienceAdvanced')}</option>
                        </select>
                        <small style="color: var(--text-secondary); font-size: 0.9rem; display: block; margin-top: 0.5rem;">
                            ${t('auth.experienceHint')}
                        </small>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block" style="pointer-events: auto; position: relative; z-index: 100; touch-action: manipulation;">
                        ${t('auth.registerBtn')}
                    </button>
                </form>
                
                <div class="auth-link" style="pointer-events: auto; color: #a0aec0;">
                    ${t('auth.hasAccount')} <a href="#/login" data-route="/login" style="pointer-events: auto; color: #a5b4fc;">${t('auth.loginBtn')}</a>
                </div>
            </div>
        </div>
    `;
    
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
                
                if (window.i18n && window.i18n.setLanguage) {
                    window.i18n.setLanguage(lang);
                }
                
                langDropdown.style.display = 'none';
                window.location.reload();
            }
        });
    });
    
    // Form validation and submission
    const form = document.getElementById('register-form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    
    const handleRegister = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;
        const experienceLevel = document.getElementById('experience-level').value;
        
        let hasError = false;
        
        // Validate username
        if (username.length < 3) {
            document.getElementById('username-error').textContent = t('auth.usernameMinError');
            usernameInput.classList.add('error');
            hasError = true;
        }
        
        // Validate email
        if (!isValidEmail(email)) {
            document.getElementById('email-error').textContent = t('auth.invalidEmailError');
            emailInput.classList.add('error');
            hasError = true;
        }
        
        // Validate password
        if (password.length < 6) {
            document.getElementById('password-error').textContent = t('auth.passwordMinError');
            passwordInput.classList.add('error');
            hasError = true;
        }
        
        // Validate password confirmation
        if (password !== passwordConfirm) {
            document.getElementById('password-confirm-error').textContent = t('auth.passwordMismatchError');
            passwordConfirmInput.classList.add('error');
            hasError = true;
        }
        
        if (hasError) {
            showToast(t('auth.formErrors'), 'error');
            return;
        }
        
        const success = await auth.register(username, email, password, experienceLevel);
        if (success) {
            // Small delay to ensure auth state is updated
            setTimeout(() => {
                router.navigate('/dashboard');
            }, 100);
        }
    };
    
    form.addEventListener('submit', handleRegister);
    
    // Also add click handler on submit button for mobile compatibility
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            handleRegister(e);
        });
    }
}

// Register route
import routerInstance from '../router.js';
routerInstance.register('/register', renderRegister, false);
