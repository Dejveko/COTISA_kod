// Reset Password View - handles the token from email
import router from '../router.js';
import { showToast } from '../utils.js';

export async function renderResetPassword(token) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-container" style="pointer-events: auto;">
            <div class="auth-card" style="pointer-events: auto;">
                <div class="auth-header">
                    <img src="images/logo_cotisa.png" alt="COTISA" class="logo-icon auth-logo">
                    <p>Postavite novu lozinku</p>
                </div>
                
                <div id="reset-form-container">
                    <form id="reset-password-form">
                        <div class="form-group">
                            <label for="new-password">Nova lozinka</label>
                            <input 
                                type="password" 
                                id="new-password" 
                                class="form-control" 
                                placeholder="Unesite novu lozinku"
                                minlength="6"
                                required
                            >
                            <small style="color: var(--text-secondary); display: block; margin-top: 4px;">Minimalno 6 znakova</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-password">Potvrdite lozinku</label>
                            <input 
                                type="password" 
                                id="confirm-password" 
                                class="form-control" 
                                placeholder="Ponovite novu lozinku"
                                minlength="6"
                                required
                            >
                        </div>
                        
                        <div id="password-match-error" style="color: #dc3545; font-size: 0.9rem; margin-bottom: 15px; display: none;">
                            Lozinke se ne podudaraju
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block" id="reset-submit-btn" style="pointer-events: auto; position: relative; z-index: 100; touch-action: manipulation;">
                            🔑 Postavi novu lozinku
                        </button>
                    </form>
                </div>
                
                <div id="reset-success-container" style="display: none;">
                    <div style="text-align: center; padding: 20px 0;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">✅</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 10px;">Lozinka promijenjena!</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">
                            Vaša lozinka je uspješno promijenjena. Sada se možete prijaviti s novom lozinkom.
                        </p>
                        <a href="#/login" class="btn btn-primary btn-block" data-route="/login">
                            Prijavi se
                        </a>
                    </div>
                </div>
                
                <div id="reset-error-container" style="display: none;">
                    <div style="text-align: center; padding: 20px 0;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
                        <h3 style="color: #dc3545; margin-bottom: 10px;">Link je istekao</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">
                            Link za resetiranje lozinke je istekao ili je nevažeći. Zatražite novi link.
                        </p>
                        <a href="#/forgot-password" class="btn btn-primary btn-block" data-route="/forgot-password">
                            Zatraži novi link
                        </a>
                    </div>
                </div>
                
                <div class="auth-link" style="margin-top: 20px;">
                    <a href="#/login" data-route="/login">← Povratak na prijavu</a>
                </div>
            </div>
        </div>
    `;
    
    if (!token) {
        document.getElementById('reset-form-container').style.display = 'none';
        document.getElementById('reset-error-container').style.display = 'block';
        return;
    }
    
    const form = document.getElementById('reset-password-form');
    const submitBtn = document.getElementById('reset-submit-btn');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const matchError = document.getElementById('password-match-error');
    
    // Live password match validation
    function checkPasswordMatch() {
        if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
            matchError.style.display = 'block';
        } else {
            matchError.style.display = 'none';
        }
    }
    
    newPasswordInput.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = newPasswordInput.value;
        const passwordConfirm = confirmPasswordInput.value;
        
        if (!password || !passwordConfirm) {
            showToast('Unesite oba polja za lozinku', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('Lozinka mora imati najmanje 6 znakova', 'error');
            return;
        }
        
        if (password !== passwordConfirm) {
            showToast('Lozinke se ne podudaraju', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Postavljanje lozinke...';
        
        try {
            const response = await fetch('/api/password-reset/confirm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: decodeURIComponent(token),
                    password: password,
                    password_confirm: passwordConfirm,
                }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                document.getElementById('reset-form-container').style.display = 'none';
                document.getElementById('reset-success-container').style.display = 'block';
                showToast('Lozinka je uspješno promijenjena!', 'success');
            } else {
                if (data.error && (data.error.includes('istekao') || data.error.includes('Nevažeći'))) {
                    document.getElementById('reset-form-container').style.display = 'none';
                    document.getElementById('reset-error-container').style.display = 'block';
                } else {
                    showToast(data.error || 'Greška pri resetiranju lozinke', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = '🔑 Postavi novu lozinku';
                }
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showToast('Greška pri povezivanju s poslužiteljem', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = '🔑 Postavi novu lozinku';
        }
    });
}

// Register route with token parameter
router.register('/reset-password/:token', renderResetPassword, false);
