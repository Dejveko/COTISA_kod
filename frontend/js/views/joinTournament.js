// Join Tournament View
import auth from '../auth.js';
import router from '../router.js';
import { tournamentAPI } from '../api.js';
import { showToast, isValidCode } from '../utils.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

export async function renderJoinTournament() {
    if (!auth.requireAuth()) return;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>🔑 ${t('tournament.joinTitle')}</h2>
                    <p>${t('tournament.enterCode')}</p>
                </div>
                
                <div style="padding: 2rem 0;">
                    <div class="code-input">
                        <input type="text" class="digit-input" maxlength="1" data-index="0" pattern="[0-9]">
                        <input type="text" class="digit-input" maxlength="1" data-index="1" pattern="[0-9]">
                        <input type="text" class="digit-input" maxlength="1" data-index="2" pattern="[0-9]">
                        <input type="text" class="digit-input" maxlength="1" data-index="3" pattern="[0-9]">
                        <input type="text" class="digit-input" maxlength="1" data-index="4" pattern="[0-9]">
                        <input type="text" class="digit-input" maxlength="1" data-index="5" pattern="[0-9]">
                    </div>
                    
                    <div id="error-message" class="text-center" style="color: var(--accent); margin-top: 1rem;"></div>
                </div>
                
                <div class="flex-between">
                    <button type="button" class="btn btn-secondary" id="back-btn">
                        ← ${t('tournament.back')}
                    </button>
                    <button type="button" class="btn btn-primary" id="join-btn" disabled>
                        ${t('tournament.join')}
                    </button>
                </div>
            </div>
            
            <!-- Info card -->
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h3 style="margin-bottom: 1rem;">💡 ${t('tournament.howToGetCode')}</h3>
                <p style="opacity: 0.9;">
                    ${t('tournament.codeExplanation')}
                </p>
            </div>
        </div>
    `;
    
    // Digit input handling
    const digitInputs = document.querySelectorAll('.digit-input');
    const joinBtn = document.getElementById('join-btn');
    const errorMessage = document.getElementById('error-message');
    
    digitInputs.forEach((input, index) => {
        // Only allow numbers
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (!/^\d*$/.test(value)) {
                e.target.value = '';
                return;
            }
            
            // Auto-focus next input
            if (value && index < digitInputs.length - 1) {
                digitInputs[index + 1].focus();
            }
            
            // Enable join button when all digits filled
            updateJoinButton();
            errorMessage.textContent = '';
        });
        
        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                digitInputs[index - 1].focus();
            }
        });
        
        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').trim();
            
            if (/^\d{6}$/.test(pastedData)) {
                pastedData.split('').forEach((digit, i) => {
                    if (digitInputs[i]) {
                        digitInputs[i].value = digit;
                    }
                });
                updateJoinButton();
                digitInputs[5].focus();
            } else {
                showToast('Neispravan format koda. Molimo unesite 6 znamenki', 'error');
            }
        });
    });
    
    function updateJoinButton() {
        const code = Array.from(digitInputs).map(input => input.value).join('');
        joinBtn.disabled = code.length !== 6;
    }
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        router.navigate('/dashboard');
    });
    
    // Join button
    joinBtn.addEventListener('click', async () => {
        const code = Array.from(digitInputs).map(input => input.value).join('');
        
        if (!isValidCode(code)) {
            errorMessage.textContent = 'Molimo unesite svih 6 znamenki';
            return;
        }
        
        try {
            joinBtn.disabled = true;
            joinBtn.textContent = 'Pridruživanje...';
            
            const response = await tournamentAPI.join(code);
            
            if (response.success) {
                showToast('Uspješno ste se pridružili turniru!', 'success');
                router.navigate(`/tournament/${response.tournament_id}`);
            } else {
                errorMessage.textContent = response.error || 'Neuspješno pridruživanje';
                joinBtn.disabled = false;
                joinBtn.textContent = 'Pridruži se';
            }
        } catch (error) {
            errorMessage.textContent = error.message || 'Greška pri pridruživanju';
            showToast(error.message || 'Greška pri pridruživanju turniru', 'error');
            joinBtn.disabled = false;
            joinBtn.textContent = 'Pridruži se';
        }
    });
    
    // Focus first input
    digitInputs[0].focus();
}

// Register route
import routerInstance from '../router.js';
routerInstance.register('/join-tournament', renderJoinTournament, true);
