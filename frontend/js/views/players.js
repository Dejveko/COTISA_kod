// Players Browser View
import auth from '../auth.js';
import router from '../router.js';
import { playerAPI } from '../api.js';
import { showToast, showLoading, hideLoading, formatPlayerName } from '../utils.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

export async function renderPlayers() {
    if (!auth.requireAuth()) return;
    
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>👥 ${t('players.title')}</h2>
                    <p>${t('players.subtitle')}</p>
                </div>
            </div>
            
            <!-- Players List -->
            <div class="card">
                <div class="card-header">
                    <h2>🏆 ${t('players.ranking')}</h2>
                    <input 
                        type="text" 
                        id="player-search" 
                        class="form-control" 
                        placeholder="🔍 ${t('players.searchPlayers')}"
                        style="margin-top: 1rem;"
                    />
                </div>
                <div id="players-list">
                    <div class="text-center" style="padding: 2rem;">
                        <div class="spinner"></div>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">${t('players.loading')}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadPlayers();
    
    // Search functionality
    document.getElementById('player-search').addEventListener('input', (e) => {
        filterPlayers(e.target.value);
    });
}

let allPlayers = [];

async function loadPlayers() {
    const container = document.getElementById('players-list');
    
    try {
        const response = await playerAPI.getAll();
        
        if (response.success && response.players) {
            allPlayers = response.players;
            displayPlayers(allPlayers);
        } else {
            container.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <p>${t('players.noPlayers')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading players:', error);
        container.innerHTML = `
            <div class="text-center" style="padding: 2rem;">
                <p style="color: var(--danger);">${t('players.loadError')}</p>
            </div>
        `;
    }
}

function displayPlayers(players) {
    const container = document.getElementById('players-list');
    
    if (players.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                <p>${t('players.noMatch')}</p>
            </div>
        `;
        return;
    }
    
    // Check if mobile
    const isMobile = window.innerWidth <= 576;
    
    if (isMobile) {
        // Mobile: Card-based layout
        container.innerHTML = `
            <div class="players-list" style="padding: 12px; display: flex; flex-direction: column; gap: 12px;">
                ${players.map((player, index) => `
                    <div class="player-list-item" style="display: flex; align-items: center; padding: 16px; border-radius: 12px; background: var(--bg-secondary); gap: 12px; cursor: pointer;" onclick="viewPlayerProfile(${player.id})">
                        <div style="width: 40px; text-align: center; font-weight: 700; color: var(--text-secondary);">
                            ${index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; font-size: 1rem; display: flex; align-items: center; gap: 4px;">
                                ${player.active_title ? `<span style="color: ${player.active_title.color};">${player.active_title.icon || ''}</span>` : ''}
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${player.username}</span>
                                ${player.role === 'admin' || player.role === 'Administrator' ? ' <span style="color: gold;">👑</span>' : ''}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                                <span style="color: var(--success);">W:${player.wins}</span> · 
                                <span style="color: var(--danger);">L:${player.losses}</span> · 
                                <span>D:${player.draws}</span>
                                ${player.is_provisional ? ' · <span style="color: #FFD700;">🌱</span>' : ''}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${player.elo_rating}</div>
                            <div style="font-size: 0.7rem; color: var(--text-secondary);">ELO</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        // Desktop: Table layout
        container.innerHTML = `
            <div class="table-responsive" style="padding: 1rem;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="border-bottom: 2px solid var(--bg-secondary);">
                        <tr>
                            <th style="padding: 0.75rem; text-align: left;">#</th>
                            <th style="padding: 0.75rem; text-align: left;">${t('players.player')}</th>
                            <th style="padding: 0.75rem; text-align: center;">${t('players.elo')}</th>
                            <th style="padding: 0.75rem; text-align: center;">${t('players.wins')}</th>
                            <th style="padding: 0.75rem; text-align: center;">${t('players.losses')}</th>
                            <th style="padding: 0.75rem; text-align: center;">${t('players.draws')}</th>
                            <th style="padding: 0.75rem; text-align: center;">${t('players.status')}</th>
                            <th style="padding: 0.75rem; text-align: center;">${t('players.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map((player, index) => `
                            <tr style="border-bottom: 1px solid var(--bg-secondary);">
                                <td style="padding: 0.75rem; color: var(--text-secondary);">${index + 1}</td>
                                <td style="padding: 0.75rem;">
                                    <strong>${formatPlayerName(player)}</strong>
                                    ${player.role === 'admin' || player.role === 'Administrator' ? 
                                        ' <span style="color: gold;">👑</span>' : ''}
                                </td>
                                <td style="padding: 0.75rem; text-align: center;">
                                    <strong style="color: var(--primary);">${player.elo_rating}</strong>
                                </td>
                                <td style="padding: 0.75rem; text-align: center; color: var(--success);">
                                    ${player.wins}
                                </td>
                                <td style="padding: 0.75rem; text-align: center; color: var(--danger);">
                                    ${player.losses}
                                </td>
                                <td style="padding: 0.75rem; text-align: center; color: var(--text-secondary);">
                                    ${player.draws}
                                </td>
                                <td style="padding: 0.75rem; text-align: center;">
                                    ${player.is_provisional ? 
                                        `<span style="color: #FFD700; font-size: 0.875rem;">${t('players.provisional')}</span>` : 
                                        `<span style="color: var(--success); font-size: 0.875rem;">${t('players.confirmed')}</span>`}
                                </td>
                                <td style="padding: 0.75rem; text-align: center;">
                                    <button 
                                        class="btn btn-sm btn-primary" 
                                        onclick="viewPlayerProfile(${player.id})"
                                        style="font-size: 0.8rem;"
                                    >
                                        👤 ${t('players.viewProfile')}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function filterPlayers(searchTerm) {
    const filtered = allPlayers.filter(player => 
        player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayPlayers(filtered);
}

// Global function for viewing player profile
window.viewPlayerProfile = function(playerId) {
    router.navigate(`/player/${playerId}`);
};

// Register route
import routerInstance from '../router.js';
routerInstance.register('/players', renderPlayers, true);
