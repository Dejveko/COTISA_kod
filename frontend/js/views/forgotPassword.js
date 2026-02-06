// Forgot Password View
import router from '../router.js';
import { showToast } from '../utils.js';

export async function renderForgotPassword() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-container" style="pointer-events: auto;">
            <div class="auth-card" style="pointer-events: auto;">
                <div class="auth-header">
                    <img src="images/logo_cotisa.png" alt="COTISA" class="logo-icon auth-logo">
                    <p>Resetirajte svoju lozinku</p>
                </div>
                
                <div id="forgot-form-container">
                    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.95rem;">
                        Unesite email adresu povezanu s vašim računom. Ako račun postoji, poslat ćemo vam link za resetiranje lozinke.
                    </p>
                    
                    <form id="forgot-password-form">
                        <div class="form-group">
                            <label for="reset-email">Email adresa</label>
                            <input 
                                type="email" 
                                id="reset-email" 
                                class="form-control" 
                                placeholder="Unesite vaš email"
                                required
                            >
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block" id="send-reset-btn" style="pointer-events: auto; position: relative; z-index: 100; touch-action: manipulation;">
                            📧 Pošalji link za resetiranje
                        </button>
                    </form>
                </div>
                
                <div id="forgot-success-container" style="display: none;">
                    <div style="text-align: center; padding: 20px 0;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">📬</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 10px;">Email poslan!</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">
                            Ako račun s tom email adresom postoji, primiti ćete link za resetiranje lozinke.
                            Provjerite i spam/junk mapu.
                        </p>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Link vrijedi <strong>1 sat</strong>.
                        </p>
                    </div>
                </div>
                
                <div class="auth-link" style="margin-top: 20px;">
                    <a href="#/login" data-route="/login">← Povratak na prijavu</a>
                </div>
            </div>
        </div>
    `;
    
    const form = document.getElementById('forgot-password-form');
    const sendBtn = document.getElementById('send-reset-btn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('reset-email').value.trim();
        
        if (!email) {
            showToast('Unesite email adresu', 'error');
            return;
        }
        
        sendBtn.disabled = true;
        sendBtn.textContent = 'Slanje...';
        
        try {
            const response = await fetch('/api/password-reset/request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Show success message
                document.getElementById('forgot-form-container').style.display = 'none';
                document.getElementById('forgot-success-container').style.display = 'block';
            } else {
                showToast(data.error || 'Greška pri slanju emaila', 'error');
                sendBtn.disabled = false;
                sendBtn.textContent = '📧 Pošalji link za resetiranje';
            }
        } catch (error) {
            console.error('Password reset request error:', error);
            showToast('Greška pri povezivanju s poslužiteljem', 'error');
            sendBtn.disabled = false;
            sendBtn.textContent = '📧 Pošalji link za resetiranje';
        }
    });
}

// Register route
router.register('/forgot-password', renderForgotPassword, false);
