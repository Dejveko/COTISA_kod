// Admin Dashboard View
import auth from '../auth.js';
import router from '../router.js';
import { adminAPI } from '../api.js';
import { showToast, showLoading, hideLoading, formatDate, formatPlayerName } from '../utils.js';

export async function renderAdmin() {
    // Check admin access
    if (!auth.requireAdmin()) {
        return;
    }
    
    const user = auth.getUser();
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container" style="max-width: 1200px;">
            <!-- Admin Header -->
            <div class="card" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: none; margin-bottom: 1.5rem;">
                <div style="padding: 2rem; color: white;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #e94560, #ff6b6b); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                            ⚙️
                        </div>
                        <div>
                            <h1 style="margin: 0; font-size: 1.75rem;">Admin Upravljanje</h1>
                            <p style="margin: 0.25rem 0 0 0; opacity: 0.8;">Upravljanje sustavom i korisnicima</p>
                        </div>
                    </div>
                    <div id="admin-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1.5rem;">
                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.75rem; font-weight: 700;" id="stat-total-players">-</div>
                            <div style="font-size: 0.85rem; opacity: 0.7;">Ukupno igrača</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.75rem; font-weight: 700;" id="stat-total-admins">-</div>
                            <div style="font-size: 0.85rem; opacity: 0.7;">Admini</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.75rem; font-weight: 700;" id="stat-total-titles">-</div>
                            <div style="font-size: 0.85rem; opacity: 0.7;">Titule</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.75rem; font-weight: 700;" id="stat-avg-elo">-</div>
                            <div style="font-size: 0.85rem; opacity: 0.7;">Prosječni ELO</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Dva stupca: Igrači lijevo, Akcije desno -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <!-- Players Management (lijevo) -->
                <div class="card" style="margin-bottom: 0;">
                    <div class="card-header" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="font-size: 1.1rem; margin: 0;">👥 Igrači</h2>
                        <input type="text" id="player-search" class="form-control" placeholder="🔍 Pretraži..." style="max-width: 200px; padding: 0.4rem 0.75rem; font-size: 0.9rem;">
                    </div>
                    <div id="admin-players" style="max-height: 500px; overflow-y: auto;">
                        <div class="text-center" style="padding: 2rem;">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Akcije (desno) -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Make Admin -->
                    <div class="card" style="margin-bottom: 0;">
                        <div class="card-header" style="padding: 0.75rem 1rem;">
                            <h3 style="font-size: 1rem; margin: 0;">👑 Dodijeli Admin</h3>
                        </div>
                        <div style="padding: 1rem;">
                            <input type="text" id="admin-search-username" class="form-control" placeholder="Unesite korisničko ime igrača..." style="margin-bottom: 0.75rem;">
                            <button id="make-admin-btn" class="btn btn-primary" style="width: 100%;">👑 Dodijeli Admin</button>
                        </div>
                    </div>
                    
                    <!-- Award Title -->
                    <div class="card" style="margin-bottom: 0;">
                        <div class="card-header" style="padding: 0.75rem 1rem;">
                            <h3 style="font-size: 1rem; margin: 0;">🏅 Dodijeli Titulu</h3>
                        </div>
                        <div style="padding: 1rem;">
                            <input type="text" id="award-username" class="form-control" placeholder="Unesite korisničko ime igrača..." style="margin-bottom: 0.5rem;">
                            <select id="award-title-select" class="form-control" style="margin-bottom: 0.75rem;">
                                <option value="">Učitavam titule...</option>
                            </select>
                            <button id="award-title-btn" class="btn btn-secondary" style="width: 100%;">🏅 Dodijeli Titulu</button>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="card" style="margin-bottom: 0;">
                        <div class="card-header" style="padding: 0.75rem 1rem;">
                            <h3 style="font-size: 1rem; margin: 0;">⚡ Brze akcije</h3>
                        </div>
                        <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="location.reload()" style="width: 100%;">🔄 Osvježi podatke</button>
                            <button class="btn btn-secondary" onclick="window.location.hash='#/dashboard'" style="width: 100%;">🏠 Dashboard</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Title Management (ispod) -->
            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-header" style="padding: 1rem 1.5rem;">
                    <h2 style="font-size: 1.1rem; margin: 0;">🏆 Upravljanje Titulama</h2>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 1px solid var(--bg-secondary);">
                    <!-- Create Title -->
                    <div style="padding: 1.5rem; border-right: 1px solid var(--bg-secondary);">
                        <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--text-secondary);">✨ Stvori Novu Titulu</h4>
                        <form id="create-title-form" style="display: grid; gap: 0.75rem;">
                            <input type="text" id="title-name" class="form-control" placeholder="npr. Šahovski Majstor" required>
                            <textarea id="title-description" class="form-control" rows="2" placeholder="Opis titule (opcionalno)..."></textarea>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <input type="number" id="title-elo" class="form-control" placeholder="Min. ELO (npr. 1500)" value="0" min="0" max="5000">
                                <input type="number" id="title-wins" class="form-control" placeholder="Min. pobjede (npr. 10)" value="0" min="0" max="100000">
                            </div>
                            <small class="form-hint" style="margin-top: -0.5rem;">
                                🎯 Igrač će dobiti titulu kada postigne oba uvjeta: minimalni ELO rating I minimalni broj pobjeda. 0 = bez uvjeta.
                            </small>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <input type="text" id="title-icon" class="form-control" placeholder="Emoji ikona 🏆" maxlength="2">
                                <input type="color" id="title-color" class="form-control" value="#FFD700" style="height: 38px;" title="Odaberi boju titule">
                            </div>
                            <small class="form-hint" style="margin-top: -0.5rem;">
                                🎨 Ikona i boja će se prikazivati uz ime igrača koji ima ovu titulu.
                            </small>
                            <button type="submit" class="btn btn-primary">✨ Stvori Titulu</button>
                        </form>
                    </div>
                    
                    <!-- All Titles -->
                    <div style="padding: 1.5rem;">
                        <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--text-secondary);">📋 Sve Titule</h4>
                        <div id="all-titles-list" style="max-height: 280px; overflow-y: auto;">
                            <div class="text-center" style="padding: 2rem;">
                                <div class="spinner"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load admin data
    loadAllPlayers();
    loadAllTitles();
    
    // Make admin handler
    document.getElementById('make-admin-btn').addEventListener('click', makePlayerAdmin);
    document.getElementById('admin-search-username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            makePlayerAdmin();
        }
    });
    
    // Title creation handler
    document.getElementById('create-title-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createTitle();
    });
    
    // Award title handler
    document.getElementById('award-title-btn').addEventListener('click', awardTitle);
}

async function loadAllPlayers() {
    const container = document.getElementById('admin-players');
    
    try {
        const response = await adminAPI.getPlayers();
        
        if (response.success && response.players) {
            const players = response.players;
            
            // Update stats
            const totalPlayers = players.length;
            const totalAdmins = players.filter(p => p.role === 'admin' || p.role === 'Administrator').length;
            const avgElo = Math.round(players.reduce((sum, p) => sum + (p.elo_rating || 800), 0) / players.length);
            
            document.getElementById('stat-total-players').textContent = totalPlayers;
            document.getElementById('stat-total-admins').textContent = totalAdmins;
            document.getElementById('stat-avg-elo').textContent = avgElo;
            
            container.innerHTML = `
                <div style="padding: 0.5rem;">
                    ${players.map(player => `
                        <div class="player-row" data-username="${player.username.toLowerCase()}" style="display: flex; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--bg-secondary); transition: background 0.2s;" onmouseover="this.style.background='rgba(102,126,234,0.05)'" onmouseout="this.style.background='transparent'">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${player.role === 'admin' || player.role === 'Administrator' ? '👑 ' : ''}${player.username}
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${player.email}</div>
                            </div>
                            <div style="text-align: center; padding: 0 1rem;">
                                <div style="font-weight: 600; color: var(--primary);">${player.elo_rating}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">ELO</div>
                            </div>
                            <div style="text-align: center; padding: 0 1rem; min-width: 80px;">
                                <div style="font-size: 0.85rem;">
                                    <span style="color: var(--success);">${player.wins}</span>/<span style="color: var(--danger);">${player.losses}</span>/<span style="color: var(--text-secondary);">${player.draws}</span>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">W/L/D</div>
                            </div>
                            <div style="min-width: 80px; text-align: right;">
                                ${player.role !== 'admin' && player.role !== 'Administrator' ? `
                                    <button class="btn btn-sm" onclick="deletePlayer(${player.id}, '${player.username}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: var(--danger); color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        🗑️ Obriši
                                    </button>
                                ` : '<span style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a2e; border-radius: 4px; font-weight: 600;">Admin</span>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Add search functionality
            document.getElementById('player-search').addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                document.querySelectorAll('.player-row').forEach(row => {
                    const username = row.dataset.username;
                    row.style.display = username.includes(searchTerm) ? 'flex' : 'none';
                });
            });
        } else {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <p>Nema korisnika</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading players:', error);
        container.innerHTML = `
            <div class="text-center" style="padding: 2rem;">
                <p style="color: var(--danger);">Greška pri učitavanju korisnika</p>
            </div>
        `;
    }
}

// Load all titles
async function loadAllTitles() {
    const container = document.getElementById('all-titles-list');
    const select = document.getElementById('award-title-select');
    
    try {
        const response = await adminAPI.getAllTitles();
        
        if (response.success && response.titles) {
            const titles = response.titles;
            
            // Update stats
            document.getElementById('stat-total-titles').textContent = titles.length;
            
            // Update select dropdown
            select.innerHTML = `
                <option value="">-- Odaberi titulu --</option>
                ${titles.map(title => `
                    <option value="${title.id}">${title.icon || '🏅'} ${title.name}</option>
                `).join('')}
            `;
            
            // Update titles list
            if (titles.length > 0) {
                container.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${titles.map(title => `
                            <div style="padding: 0.75rem; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; gap: 0.75rem;">
                                <div style="font-size: 1.5rem; width: 36px; text-align: center;">${title.icon || '🏅'}</div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; color: ${title.color}; font-size: 0.95rem; text-shadow: 0 0 3px rgba(0,0,0,0.3), 1px 1px 2px rgba(0,0,0,0.2);">${title.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">
                                        ${title.required_elo > 0 ? `ELO≥${title.required_elo}` : ''}
                                        ${title.required_elo > 0 && title.required_wins > 0 ? ' • ' : ''}
                                        ${title.required_wins > 0 ? `${title.required_wins}W` : ''}
                                        ${title.required_elo === 0 && title.required_wins === 0 ? 'Bez zahtjeva' : ''}
                                    </div>
                                </div>
                                <button class="btn btn-sm btn-danger" onclick="deleteTitle(${title.id}, '${title.name}')" style="padding: 0.25rem 0.5rem;">
                                    🗑️
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Još nema stvorenih titula</p>
                `;
            }
        } else {
            select.innerHTML = '<option value="">Greška pri učitavanju</option>';
            container.innerHTML = `<p style="color: var(--danger); text-align: center;">Greška</p>`;
        }
    } catch (error) {
        console.error('Error loading titles:', error);
        select.innerHTML = '<option value="">Greška pri učitavanju</option>';
        container.innerHTML = `<p style="color: var(--danger); text-align: center;">Greška</p>`;
    }
}

// Create new title
async function createTitle() {
    const name = document.getElementById('title-name').value.trim();
    const description = document.getElementById('title-description').value.trim();
    const requiredElo = parseInt(document.getElementById('title-elo').value) || 0;
    const requiredWins = parseInt(document.getElementById('title-wins').value) || 0;
    const icon = document.getElementById('title-icon').value.trim();
    const color = document.getElementById('title-color').value;
    
    if (!name) {
        showToast('Unesite naziv titule', 'error');
        return;
    }
    
    // Validacija vrijednosti
    if (requiredElo < 0 || requiredElo > 5000) {
        showToast('ELO mora biti između 0 i 5000', 'error');
        return;
    }
    
    if (requiredWins < 0 || requiredWins > 100000) {
        showToast('Broj pobjeda mora biti između 0 i 100000', 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await adminAPI.createTitle({
            title_name: name,
            description,
            required_elo: requiredElo,
            required_wins: requiredWins,
            icon_class: icon,
            color_code: color
        });
        hideLoading();
        
        if (response.success) {
            showToast('Titula stvorena!', 'success');
            // Reset form
            document.getElementById('create-title-form').reset();
            document.getElementById('title-color').value = '#FFD700';
            // Reload titles
            loadAllTitles();
        } else {
            showToast(response.error || 'Greška', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || 'Greška pri stvaranju titule', 'error');
    }
}

// Award title to player
async function awardTitle() {
    const username = document.getElementById('award-username').value.trim();
    const titleId = document.getElementById('award-title-select').value;
    
    if (!username) {
        showToast('Unesite korisničko ime', 'error');
        return;
    }
    
    if (!titleId) {
        showToast('Odaberite titulu', 'error');
        return;
    }
    
    try {
        showLoading();
        // First, search for player by username (we need player ID)
        const playersResponse = await adminAPI.getPlayers();
        
        if (!playersResponse.success) {
            throw new Error('Greška pri traženju igrača');
        }
        
        const player = playersResponse.players.find(p => p.username.toLowerCase() === username.toLowerCase());
        
        if (!player) {
            hideLoading();
            showToast('Igrač nije pronađen', 'error');
            return;
        }
        
        // Award title
        const response = await adminAPI.awardTitle(player.id, parseInt(titleId));
        hideLoading();
        
        if (response.success) {
            showToast(`Titula dodijeljena igraču ${player.username}!`, 'success');
            // Reset inputs
            document.getElementById('award-username').value = '';
            document.getElementById('award-title-select').selectedIndex = 0;
        } else {
            showToast(response.error || 'Greška', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || 'Greška pri dodjeljivanju titule', 'error');
    }
}

async function makePlayerAdmin() {
    const usernameInput = document.getElementById('admin-search-username');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showToast('Unesite korisničko ime', 'error');
        return;
    }
    
    if (!confirm(`Želite li dodijeliti admin status korisniku "${username}"?`)) {
        return;
    }
    
    try {
        showLoading();
        const response = await adminAPI.makeAdmin(username);
        hideLoading();
        
        if (response.success) {
            showToast(response.message || 'Admin status dodijeljen!', 'success');
            usernameInput.value = '';
            // Reload players list
            loadAllPlayers();
        } else {
            showToast(response.error || 'Greška', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || 'Greška pri dodjeljivanju admin statusa', 'error');
    }
}

// Global function for delete
window.deletePlayer = async function(playerId, username) {
    if (!confirm(`Želite li obrisati korisnika "${username}"? Ova akcija se ne može poništiti!`)) {
        return;
    }
    
    try {
        showLoading();
        const response = await adminAPI.deletePlayer(playerId);
        hideLoading();
        
        if (response.success) {
            showToast(response.message || 'Korisnik obrisan!', 'success');
            loadAllPlayers();
        } else {
            showToast(response.error || 'Greška', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || 'Greška pri brisanju korisnika', 'error');
    }
};

// Delete title
window.deleteTitle = async function(titleId, titleName) {
    if (!confirm(`Želite li obrisati titulu "${titleName}"? Ova akcija se ne može poništiti!`)) {
        return;
    }
    
    try {
        showLoading();
        const response = await adminAPI.deleteTitle(titleId);
        hideLoading();
        
        if (response.success) {
            showToast(response.message || 'Titula obrisana!', 'success');
            loadAllTitles();
        } else {
            showToast(response.error || 'Greška', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || 'Greška pri brisanju titule', 'error');
    }
};

// Register route
import routerInstance from '../router.js';
routerInstance.register('/admin', renderAdmin, true);
