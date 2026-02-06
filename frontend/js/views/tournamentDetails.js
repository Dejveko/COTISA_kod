// Tournament Details View
import auth from '../auth.js';
import router from '../router.js';
import { tournamentAPI, gameAPI } from '../api.js';
import { showToast, showLoading, hideLoading, formatDate, formatTournamentType, copyToClipboard, confirm } from '../utils.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

export async function renderTournamentDetails(tournamentId) {
    console.log('TournamentDetails: START rendering for ID', tournamentId);
    
    if (!auth.requireAuth()) {
        console.log('TournamentDetails: Auth required but not authenticated');
        return;
    }
    
    const app = document.getElementById('app');
    if (!app) {
        console.error('TournamentDetails: App element not found!');
        return;
    }
    
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="text-center" style="padding: 3rem;">
                    <div class="spinner"></div>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">Loading...</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        console.log('TournamentDetails: Fetching tournament data...');
        showLoading();
        const response = await tournamentAPI.getById(tournamentId);
        console.log('TournamentDetails: API response:', response);
        hideLoading();
        
        if (!response || !response.success) {
            throw new Error(response?.error || 'Turnir nije pronađen');
        }
        
        const tournament = response.tournament;
        const participants = response.participants || [];
        const matches = response.matches || [];
        const user = auth.getUser();
        const isCreator = tournament.creator_id === user.id;
        
        console.log('TournamentDetails: Rendering content...', {
            tournament: tournament.name,
            participants: participants.length,
            matches: matches.length,
            isCreator,
            userId: user.id,
            creatorId: tournament.creator_id
        });
        
        renderTournamentContent(tournament, participants, matches, isCreator);
        console.log('TournamentDetails: DONE rendering');
    } catch (error) {
        console.error('TournamentDetails: ERROR', error);
        hideLoading();
        showToast(error.message || 'Greška pri učitavanju turnira', 'error');
        
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="container">
                    <div class="card text-center">
                        <h2>⚠️ Greška</h2>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="window.location.hash='#/dashboard'">
                            Povratak na Dashboard
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

function renderTournamentContent(tournament, participants, matches, isCreator) {
    const app = document.getElementById('app');
    
    const statusClass = tournament.status === 'active' ? 'active' : 
                       tournament.status === 'completed' ? 'completed' : 'pending';
    const statusText = tournament.status === 'active' ? t('tournament.active') :
                      tournament.status === 'completed' ? t('tournament.completed') : t('tournament.pending');
    
    app.innerHTML = `
        <div class="container">
            <!-- Header Card -->
            <div class="card">
                <div class="flex-between" style="margin-bottom: 1rem;">
                    <button class="btn btn-secondary" onclick="window.location.hash='#/dashboard'">
                        ← ${t('tournament.back')}
                    </button>
                    <span class="tournament-status ${statusClass}">${statusText}</span>
                </div>
                
                <h1 style="color: var(--primary); margin-bottom: 1rem;">${tournament.name}</h1>
                
                ${tournament.description ? `
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${tournament.description}</p>
                ` : ''}
                
                <div class="tournament-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span><strong>${t('tournament.type')}:</strong> ${formatTournamentType(tournament.tournament_type)}</span>
                    </div>
                    <div class="meta-item">
                        <span>👥</span>
                        <span><strong>${t('tournament.players')}:</strong> ${participants.length}/${tournament.max_participants}</span>
                    </div>
                    <div class="meta-item">
                        <span>🕐</span>
                        <span><strong>${t('tournament.created')}:</strong> ${formatDate(tournament.created_at)}</span>
                    </div>
                </div>
                
                ${tournament.tournament_code ? `
                    <div class="code-display" style="margin-top: 2rem;">
                        <h3 style="color: var(--text-primary);">${t('tournament.codeForJoin')}:</h3>
                        <div class="code-value" style="color: #22c55e !important; text-shadow: 0 0 10px rgba(34,197,94,0.3);">${tournament.tournament_code}</div>
                        <button class="btn copy-btn" onclick="copyCode('${tournament.tournament_code}')">
                            📋 ${t('tournament.copyCode')}
                        </button>
                    </div>
                ` : ''}
                
                ${isCreator && tournament.status === 'pending' && participants.length >= 2 ? `
                    <div style="margin-top: 2rem; text-align: center;">
                        <button class="btn btn-success" id="start-tournament-btn">
                            🚀 ${t('tournament.start')}
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <!-- Participants -->
            <div class="card">
                <div class="card-header">
                    <h2>👥 ${t('tournament.participants')} (${participants.length})</h2>
                </div>
                <div id="participants-list">
                    ${renderParticipantsList(participants)}
                </div>
            </div>
            
            <!-- Matches -->
            ${matches.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <h2>⚔️ ${t('tournament.matches')}</h2>
                    </div>
                    <div id="matches-list">
                        ${renderMatchesList(matches, isCreator)}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Start tournament button
    if (isCreator && tournament.status === 'pending') {
        const startBtn = document.getElementById('start-tournament-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                confirm(
                    `Želite li pokrenuti turnir? Nakon pokretanja više se neće moći pridružiti novi igrači.`,
                    async () => {
                        try {
                            showLoading();
                            const response = await tournamentAPI.start(tournament.id);
                            hideLoading();
                            
                            if (response.success) {
                                showToast('Turnir uspješno pokrenut!', 'success');
                                // Reload tournament details
                                renderTournamentDetails(tournament.id);
                            }
                        } catch (error) {
                            hideLoading();
                            showToast(error.message || 'Greška pri pokretanju turnira', 'error');
                        }
                    }
                );
            });
        }
    }
}

function renderParticipantsList(participants) {
    if (participants.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">👤</div>
                <h3>${t('tournament.noParticipants')}</h3>
                <p>${t('tournament.noParticipantsDesc')}</p>
            </div>
        `;
    }
    
    return `
        <ul class="participants-list">
            ${participants.map((p, index) => `
                <li class="participant-item">
                    <div>
                        <span style="color: var(--text-secondary); margin-right: 1rem;">#${index + 1}</span>
                        <span class="participant-name">${p.username || p.name}</span>
                    </div>
                    <div>
                        ${p.rating ? `<span class="participant-rating">${t('tournament.rating')}: ${p.rating}</span>` : ''}
                        <span class="participant-status">${t('tournament.active')}</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderMatchesList(matches, isCreator) {
    if (matches.length === 0) {
        return '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">Nema mečeva</p>';
    }
    
    return `
        <div class="tournament-list">
            ${matches.map(match => `
                <div class="tournament-card" style="border-left-color: ${match.winner_id ? 'var(--success)' : 'var(--warning)'};">
                    <div class="flex-between">
                        <h3>Meč #${match.round_number || match.match_number}</h3>
                        ${match.winner_id ? 
                            '<span class="tournament-status completed">Završeno</span>' :
                            '<span class="tournament-status pending">U tijeku</span>'
                        }
                    </div>
                    
                    <div style="margin: 1rem 0; padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                        <div class="flex-between" style="margin-bottom: 0.5rem;">
                            <span style="font-weight: ${match.winner_id === match.player1_id ? 'bold' : 'normal'};">
                                ${match.player1_name}
                                ${match.winner_id === match.player1_id ? ' 🏆' : ''}
                            </span>
                        </div>
                        <div class="text-center" style="color: var(--text-secondary); margin: 0.5rem 0;">VS</div>
                        <div class="flex-between">
                            <span style="font-weight: ${match.winner_id === match.player2_id ? 'bold' : 'normal'};">
                                ${match.player2_name}
                                ${match.winner_id === match.player2_id ? ' 🏆' : ''}
                            </span>
                        </div>
                    </div>
                    
                    ${!match.winner_id && isCreator ? `
                        <div class="flex gap-1">
                            <button class="btn btn-primary" onclick="startGame(${match.id}, ${match.tournament_id})">
                                ♟️ Igraj partiju
                            </button>
                            <button class="btn btn-success" onclick="setMatchWinner(${match.id}, ${match.player1_id}, '${match.player1_name}')">
                                ${match.player1_name} pobjeđuje
                            </button>
                            <button class="btn btn-success" onclick="setMatchWinner(${match.id}, ${match.player2_id}, '${match.player2_name}')">
                                ${match.player2_name} pobjeđuje
                            </button>
                        </div>
                    ` : !match.winner_id ? `
                        <button class="btn btn-primary btn-block" onclick="startGame(${match.id}, ${match.tournament_id})">
                            ♟️ Igraj partiju
                        </button>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Global functions for inline handlers
window.copyCode = function(code) {
    copyToClipboard(code);
};

window.setMatchWinner = async function(matchId, winnerId, winnerName) {
    confirm(
        `Proglasiti ${winnerName} pobjednikom meča?`,
        async () => {
            try {
                showLoading();
                const response = await tournamentAPI.updateMatch(matchId, winnerId);
                hideLoading();
                
                if (response.success) {
                    showToast('Rezultat uspješno zabilježen!', 'success');
                    // Reload current tournament
                    const hash = window.location.hash;
                    const tournamentId = hash.split('/').pop();
                    renderTournamentDetails(tournamentId);
                }
            } catch (error) {
                hideLoading();
                showToast(error.message || 'Greška pri ažuriranju rezultata', 'error');
            }
        }
    );
};

// Start chess game
window.startGame = async function(matchId, tournamentId) {
    try {
        showLoading();
        showToast('Pokrećem igru...', 'info');
        const response = await gameAPI.createFromMatch(matchId);
        hideLoading();
        
        if (response.success && response.game_id) {
            // Navigate to game
            router.navigate(`/game/${response.game_id}`);
        } else {
            throw new Error(response.error || 'Failed to create game');
        }
    } catch (error) {
        hideLoading();
        console.error('Error starting game:', error);
        showToast('Greška pri kreiranju igre', 'error');
    }
};

// Register route with parameter
import routerInstance from '../router.js';
routerInstance.register('/tournament/:id', renderTournamentDetails, true);
