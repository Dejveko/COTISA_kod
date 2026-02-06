// Create Tournament View
import auth from '../auth.js';
import router from '../router.js';
import { tournamentAPI } from '../api.js';
import { showToast, copyToClipboard } from '../utils.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

export async function renderCreateTournament() {
    if (!auth.requireAuth()) return;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>➕ ${t('tournament.createTitle')}</h2>
                    <p>${t('tournament.createSubtitle')}</p>
                </div>
                
                <form id="create-tournament-form">
                    <!-- MAIN SETTINGS -->
                    <div class="main-settings">
                        <div class="form-group">
                            <label for="tournament-name">${t('tournament.tournamentName')} *</label>
                            <input 
                                type="text" 
                                id="tournament-name" 
                                class="form-control" 
                                placeholder="${t('tournament.namePlaceholder')}"
                                required
                                minlength="3"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="max-participants">${t('tournament.maxPlayers')} *</label>
                            <input 
                                type="number" 
                                id="max-participants" 
                                class="form-control" 
                                placeholder="${t('tournament.maxPlayersPlaceholder')}"
                                required
                                min="2"
                                max="128"
                            >
                            <small class="form-hint">
                                💡 ${t('tournament.maxPlayersHint')}
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="time-control-minutes">${t('tournament.timePerPlayer')} *</label>
                            <input 
                                type="number" 
                                id="time-control-minutes" 
                                class="form-control" 
                                placeholder="${t('tournament.timePlaceholder')}"
                                required
                                min="1"
                                max="180"
                                value="10"
                            >
                            <small id="time-control-hint" class="form-hint">
                                ⏱️ ${t('tournament.timeHint')}
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="time-increment">${t('tournament.increment')}</label>
                            <input 
                                type="number" 
                                id="time-increment" 
                                class="form-control" 
                                placeholder="${t('tournament.incrementPlaceholder')}"
                                min="0"
                                max="30"
                                value="0"
                            >
                            <small class="form-hint">
                                ➕ ${t('tournament.incrementHint')}
                            </small>
                        </div>
                    </div>
                    
                    <!-- ADVANCED SETTINGS (Collapsible) -->
                    <div class="advanced-settings-toggle" style="margin: 1.5rem 0;">
                        <button type="button" id="toggle-advanced" class="btn btn-secondary" style="width: 100%;">
                            ⚙️ ${t('tournament.advancedSettings')} <span id="toggle-icon">▼</span>
                        </button>
                    </div>
                    
                    <div id="advanced-settings" class="advanced-settings" style="display: none; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 1rem;">
                        <div class="form-group">
                            <label for="tournament-type">${t('tournament.tournamentType')}</label>
                            <select id="tournament-type" class="form-control">
                                <option value="elimination">${t('tournament.typeElimination')}</option>
                                <option value="round_robin">${t('tournament.typeRoundRobin')}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="pairing-system">${t('tournament.pairingSystem')}</label>
                            <select id="pairing-system" class="form-control">
                                <option value="random">${t('tournament.pairingRandom')}</option>
                                <option value="rating">${t('tournament.pairingRating')}</option>
                                <option value="swiss">${t('tournament.pairingSwiss')}</option>
                                <option value="manual">${t('tournament.pairingManual')}</option>
                            </select>
                            <small class="form-hint">
                                🎲 ${t('tournament.pairingHint')}
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="start-date">${t('tournament.startDate')}</label>
                            <input 
                                type="datetime-local" 
                                id="start-date" 
                                class="form-control"
                            >
                            <small class="form-hint">
                                📅 ${t('tournament.startDateHint')}
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">${t('tournament.description')}</label>
                            <textarea 
                                id="description" 
                                class="form-control" 
                                rows="3"
                                placeholder="${t('tournament.descriptionPlaceholder')}"
                            ></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input 
                                    type="checkbox" 
                                    id="is-public" 
                                    checked
                                    style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span>
                                    ${t('tournament.isPublic')}
                                    <small style="display: block; color: var(--text-tertiary); font-size: 0.9rem;">
                                        ${t('tournament.isPublicHint')}
                                    </small>
                                </span>
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input 
                                    type="checkbox" 
                                    id="creator-plays"
                                    checked
                                    style="margin-right: 0.5rem; width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span>
                                    ${t('tournament.creatorPlays')}
                                    <small style="display: block; color: var(--text-tertiary); font-size: 0.9rem;">
                                        ${t('tournament.creatorPlaysHint')}
                                    </small>
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex-between" style="margin-top: 2rem;">
                        <button type="button" class="btn btn-secondary" id="back-btn">
                            ← ${t('tournament.back')}
                        </button>
                        <button type="submit" class="btn btn-success">
                            🏆 ${t('tournament.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        router.navigate('/dashboard');
    });
    
    // Toggle advanced settings
    const toggleBtn = document.getElementById('toggle-advanced');
    const advancedSettings = document.getElementById('advanced-settings');
    const toggleIcon = document.getElementById('toggle-icon');
    
    toggleBtn.addEventListener('click', () => {
        const isHidden = advancedSettings.style.display === 'none';
        advancedSettings.style.display = isHidden ? 'block' : 'none';
        toggleIcon.textContent = isHidden ? '▲' : '▼';
    });
    
    // Time control minutes change handler - auto detect type
    const timeControlMinutesInput = document.getElementById('time-control-minutes');
    const timeControlHint = document.getElementById('time-control-hint');
    
    function getTimeControlType(minutes) {
        if (minutes <= 2) return { type: 'bullet', hint: 'Bullet (1-2 min)' };
        if (minutes <= 5) return { type: 'blitz', hint: 'Blitz (3-5 min)' };
        if (minutes <= 30) return { type: 'rapid', hint: 'Rapid (10-30 min)' };
        return { type: 'classical', hint: 'Klasično (60+ min)' };
    }
    
    timeControlMinutesInput.addEventListener('input', () => {
        const minutes = parseInt(timeControlMinutesInput.value) || 0;
        const control = getTimeControlType(minutes);
        timeControlHint.textContent = `Tip: ${control.hint}`;
    });

    // Trigger initial hint
    timeControlMinutesInput.dispatchEvent(new Event('input'));

    // Form submission
    const form = document.getElementById('create-tournament-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('tournament-name').value.trim();
        const type = document.getElementById('tournament-type').value || 'elimination';
        const maxParticipants = parseInt(document.getElementById('max-participants').value);
        const pairingSystem = document.getElementById('pairing-system').value || 'random';
        const timeControlMinutes = parseInt(document.getElementById('time-control-minutes').value);
        const timeIncrement = parseInt(document.getElementById('time-increment').value) || 0;
        const startDate = document.getElementById('start-date').value;
        const description = document.getElementById('description').value.trim();
        const isPublic = document.getElementById('is-public').checked;
        const creatorPlays = document.getElementById('creator-plays').checked;
        
        // Auto-detect time control type
        let timeControlType = 'rapid';
        if (timeControlMinutes <= 2) timeControlType = 'bullet';
        else if (timeControlMinutes <= 5) timeControlType = 'blitz';
        else if (timeControlMinutes <= 30) timeControlType = 'rapid';
        else timeControlType = 'classical';
        
        // Validation
        if (!name || name.length < 3) {
            showToast('Naziv mora imati najmanje 3 znaka', 'error');
            return;
        }
        
        if (!maxParticipants || maxParticipants < 2) {
            showToast('Broj igrača mora biti najmanje 2', 'error');
            return;
        }
        
        if (!timeControlMinutes || timeControlMinutes < 1) {
            showToast('Unesite vrijeme kontrole', 'error');
            return;
        }
        
        // Warn for non-power-of-2 in elimination
        if (type === 'elimination') {
            const isPowerOfTwo = (maxParticipants & (maxParticipants - 1)) === 0;
            if (!isPowerOfTwo) {
                const confirmed = confirm(
                    'Za eliminacijski turnir se preporučuje broj igrača koji je potencija broja 2 (4, 8, 16, 32...). Želite li nastaviti?'
                );
                if (!confirmed) return;
            }
        }
        
        try {
            const tournamentData = {
                name,
                tournament_type: type,
                max_participants: maxParticipants,
                pairing_system: pairingSystem,
                time_control_type: timeControlType,
                time_control_minutes: timeControlMinutes,
                time_increment_seconds: timeIncrement,
                description: description || null,
                is_public: isPublic,
                creator_plays: creatorPlays
            };
            
            if (startDate) {
                tournamentData.start_date = startDate;
            }
            
            const response = await tournamentAPI.create(tournamentData);
            
            if (response.success && response.tournament) {
                const tournament = response.tournament;
                
                // Redirect to tournament page
                showToast('Turnir uspješno kreiran!', 'success');
                router.navigate(`/tournament/${tournament.id}`);
            }
        } catch (error) {
            showToast(error.message || 'Greška pri kreiranju turnira', 'error');
        }
    });
}

function showSuccessModal(tournament, isSpectatorOnly = false) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🎉 Turnir uspješno kreiran!</h2>
            </div>
            <div class="modal-body">
                <div class="code-display">
                    <h3 style="color: var(--text-primary);">Vaš turnirski kod:</h3>
                    <div class="code-value" style="color: #22c55e !important; text-shadow: 0 0 10px rgba(34,197,94,0.3);">${tournament.tournament_code || tournament.code}</div>
                    <p style="opacity: 0.9; margin-top: 1rem; color: var(--text-secondary);">
                        Podijelite ovaj kod s igračima kako bi se mogli pridružiti turniru
                    </p>
                </div>
                
                ${isSpectatorOnly ? `
                    <div style="background: #fff3cd; color: #856404; padding: 1rem; border-radius: var(--border-radius); margin-top: 1rem;">
                        <strong>📺 Samo promatrač</strong>
                        <p style="margin: 0.5rem 0 0 0;">Niste se pridružili kao igrač. Možete promatrati mečeve kada turnir počne.</p>
                    </div>
                ` : ''}
                
                <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: var(--border-radius); margin-top: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">📋 Detalji turnira</h4>
                    <p><strong>Naziv:</strong> ${tournament.name}</p>
                    <p><strong>Tip:</strong> ${tournament.tournament_type === 'elimination' ? 'Eliminacija' : 'Svi protiv svih'}</p>
                    <p><strong>Max igrača:</strong> ${tournament.max_participants}</p>
                </div>
            </div>
            <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem;">
                <button class="btn btn-secondary" id="copy-code-btn">
                    📋 Kopiraj kod
                </button>
                <button class="btn btn-primary" id="view-tournament-btn">
                    👁️ Pogledaj turnir
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Copy code button
    document.getElementById('copy-code-btn').addEventListener('click', () => {
        copyToClipboard(tournament.tournament_code || tournament.code);
    });
    
    // View tournament button
    document.getElementById('view-tournament-btn').addEventListener('click', () => {
        modal.remove();
        router.navigate(`/tournament/${tournament.id}`);
    });
    
    // Prevent closing by clicking backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            e.preventDefault();
        }
    });
}

// Register route
import routerInstance from '../router.js';
routerInstance.register('/create-tournament', renderCreateTournament, true);
