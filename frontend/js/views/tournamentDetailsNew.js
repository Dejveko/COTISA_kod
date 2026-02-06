// Tournament Details View - NEW IMPLEMENTATION
import auth from '../auth.js';
import router from '../router.js';
import { tournamentAPI, getApiUrl, gameAPI } from '../api.js';
import { showToast, showLoading, hideLoading, formatDate, formatPlayerName } from '../utils.js';
import wsManager from '../websocket.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

// WebSocket handlers cleanup
let tournamentWsHandlers = [];

export async function renderTournamentDetails(tournamentId) {
    console.log('=== TOURNAMENT DETAILS START ===');
    console.log('Tournament ID:', tournamentId);
    
    // Cleanup previous WebSocket handlers
    tournamentWsHandlers.forEach(({ event, handler }) => {
        wsManager.off(event, handler);
    });
    tournamentWsHandlers = [];
    
    // Check auth
    if (!auth.isAuthenticated()) {
        console.log('Not authenticated, redirecting to login');
        router.navigate('/login');
        return;
    }
    
    const app = document.getElementById('app');
    if (!app) {
        console.error('App element not found!');
        return;
    }
    
    // Show loading
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="text-center" style="padding: 3rem;">
                    <div class="spinner"></div>
                    <p style="margin-top: 1rem; color: var(--text-secondary);">${t('tournament.loading')}</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        console.log('Fetching tournament data...');
        showLoading();
        
        const response = await tournamentAPI.getById(tournamentId);
        
        // Also fetch ongoing games
        let ongoingGames = [];
        try {
            const token = auth.getAuthToken();
            const gamesResponse = await fetch(getApiUrl(`/tournaments/${tournamentId}/games/`), {
                headers: { 'X-Auth-Token': token }
            });
            if (gamesResponse.ok) {
                const gamesData = await gamesResponse.json();
                ongoingGames = gamesData.games || [];
            }
        } catch (e) {
            console.log('Could not fetch ongoing games:', e);
        }
        
        console.log('API Response:', response);
        hideLoading();
        
        if (!response || !response.success) {
            throw new Error(response?.error || 'Greška pri učitavanju');
        }
        
        const tournament = response.tournament;
        const participants = response.participants || [];
        const matches = response.matches || [];
        const user = auth.getUser();
        
        console.log('Tournament:', tournament);
        console.log('Participants:', participants.length);
        console.log('Matches:', matches.length);
        console.log('Ongoing games:', ongoingGames.length);
        console.log('Current user ID:', user.id);
        console.log('Tournament creator ID:', tournament.creator_id);
        
        const isCreator = tournament.creator_id === user.id;
        
        // Render simple view
        renderSimpleView(app, tournament, participants, matches, isCreator, user.id, ongoingGames);
        
        // Setup WebSocket listeners for tournament updates
        setupWebSocketListeners(tournamentId);
        
        console.log('=== TOURNAMENT DETAILS COMPLETE ===');
        
    } catch (error) {
        console.error('ERROR loading tournament:', error);
        hideLoading();
        
        app.innerHTML = `
            <div class="container">
                <div class="card">
                    <h2 style="color: red;">⚠️ Greška</h2>
                    <p>${error.message || 'Nepoznata greška'}</p>
                    <button class="btn btn-primary" onclick="window.location.hash='#/dashboard'">
                        ← Natrag na Dashboard
                    </button>
                </div>
            </div>
        `;
        
        showToast(error.message || 'Greška pri učitavanju turnira', 'error');
    }
}

function setupWebSocketListeners(tournamentId) {
    console.log('[Tournament] Setting up WebSocket listeners for tournament', tournamentId);
    
    // Join tournament room
    if (wsManager.isConnected()) {
        wsManager.joinTournament(tournamentId);
    }
    
    // Handler for new round notifications
    const handleNewRound = (data) => {
        console.log('[Tournament] New round notification:', data);
        if (data.tournament_id == tournamentId) {
            showToast(`🎉 ${data.message}`, 'success', 5000);
            // Reload tournament view after short delay
            setTimeout(() => {
                renderTournamentDetails(tournamentId);
            }, 1500);
        }
    };
    
    // Handler for tournament updates
    const handleTournamentUpdate = (data) => {
        console.log('[Tournament] Tournament update:', data);
        if (data.tournament_id == tournamentId) {
            // Reload tournament view
            renderTournamentDetails(tournamentId);
        }
    };
    
    // Handler for round updates with matches
    const handleRoundUpdate = (data) => {
        console.log('[Tournament] Round update with matches:', data);
        if (data.tournament_id == tournamentId) {
            const matchList = data.matches && data.matches.length > 0 
                ? data.matches.map(m => `${m.player1} vs ${m.player2}`).join(', ')
                : '';
            showToast(`🎉 ${data.message}\n${matchList}`, 'success', 6000);
            // Reload tournament view
            setTimeout(() => {
                renderTournamentDetails(tournamentId);
            }, 2000);
        }
    };
    
    // Register handlers
    wsManager.on('tournament:round_notification', handleNewRound);
    wsManager.on('tournament:update', handleTournamentUpdate);
    wsManager.on('tournament:new_round', handleRoundUpdate);
    
    // Store handlers for cleanup
    tournamentWsHandlers.push(
        { event: 'tournament:round_notification', handler: handleNewRound },
        { event: 'tournament:update', handler: handleTournamentUpdate },
        { event: 'tournament:new_round', handler: handleRoundUpdate }
    );
    
    console.log('[Tournament] WebSocket listeners registered');
}

function renderSimpleView(app, tournament, participants, matches, isCreator, currentUserId, ongoingGames = []) {
    console.log('Rendering simple view...');
    console.log('Current user ID for match check:', currentUserId);
    
    // Check if current user is playing
    const userIsPlaying = ongoingGames.some(game => 
        game.status === 'in_progress' && 
        (game.white_player.id === currentUserId || game.black_player.id === currentUserId)
    );
    
    // Filter games user can spectate (not playing in)
    const spectatableGames = ongoingGames.filter(game => 
        game.status === 'in_progress' &&
        game.white_player.id !== currentUserId && 
        game.black_player.id !== currentUserId
    );
    
    const statusClass = tournament.status === 'active' || tournament.status === 'in_progress' ? 'active' : 
                       tournament.status === 'completed' ? 'completed' : 'pending';
    const statusText = tournament.status === 'active' || tournament.status === 'in_progress' ? t('tournament.active') :
                      tournament.status === 'completed' ? t('tournament.completed') : t('tournament.pending');
    
    let html = `
        <div class="container">
            <!-- Back button -->
            <button class="btn btn-secondary" style="margin-bottom: 1rem;" onclick="window.location.hash='#/dashboard'">
                ← ${t('tournament.back')}
            </button>
            
            <!-- Tournament Info Card -->
            <div class="card">
                <h1 style="color: var(--primary); margin-bottom: 1rem;">
                    ${tournament.name || tournament.tournament_name}
                </h1>
                
                <span class="tournament-status ${statusClass}" style="display: inline-block; margin-bottom: 1rem;">
                    ${statusText}
                </span>
                
                ${tournament.description ? `<p style="color: var(--text-secondary); margin-bottom: 1rem;">${tournament.description}</p>` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div>
                        <strong>${t('tournament.type')}:</strong> ${tournament.type === 'elimination' ? t('tournament.typeElimination') : t('tournament.typeRoundRobin')}
                    </div>
                    <div>
                        <strong>${t('tournament.players')}:</strong> ${participants.length}/${tournament.max_participants}
                    </div>
                    <div>
                        <strong>${t('tournament.created')}:</strong> ${formatDate(tournament.created_at)}
                    </div>
                    <div>
                        <strong>${t('tournament.createdBy')}:</strong> ${tournament.created_by}
                    </div>
                </div>
                
                ${tournament.tournament_code ? `
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-top: 1.5rem; text-align: center;">
                        <strong style="color: var(--text-primary);">${t('tournament.codeForJoin')}:</strong>
                        <div style="font-size: 2rem; font-weight: bold; color: #22c55e; margin: 0.5rem 0; text-shadow: 0 0 10px rgba(34,197,94,0.3);">
                            ${tournament.tournament_code}
                        </div>
                        <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${tournament.tournament_code}').then(() => alert('${t('tournament.codeCopied')}'))">
                            📋 ${t('tournament.copyCode')}
                        </button>
                    </div>
                ` : ''}
                
                ${isCreator && tournament.status === 'upcoming' && participants.length >= 2 ? `
                    <button class="btn btn-success" style="margin-top: 1.5rem; width: 100%;" id="start-tournament-btn">
                        🚀 ${t('tournament.start')}
                    </button>
                ` : ''}
                
                ${isCreator || (auth.getUser().role === 'admin') ? `
                    <button class="btn btn-danger" style="margin-top: 1rem; width: 100%;" id="delete-tournament-btn">
                        🗑️ ${t('tournament.delete')}
                    </button>
                ` : ''}
            </div>
            
            <!-- Participants Card -->
            <div class="card">
                <h2 style="margin-bottom: 1rem;">👥 ${t('tournament.participants')} (${participants.length})</h2>
                ${participants.length > 0 ? `
                    <ul style="list-style: none; padding: 0;">
                        ${participants.map((p, index) => `
                            <li style="padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-secondary); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${index + 1}. ${formatPlayerName(p)}</strong>
                                    ${p.is_eliminated ? ` <span style="color: red;">(${t('tournament.eliminated')})</span>` : ''}
                                </div>
                                <div style="color: var(--text-secondary);">
                                    ${t('tournament.elo')}: ${p.elo_rating} | ${t('tournament.seed')}: ${p.seed}
                                    ${p.is_provisional ? ` | <span style="color: #FFD700;">${t('tournament.provisional')}</span>` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        ${t('tournament.noParticipants')}
                    </p>
                `}
            </div>
            
            <!-- Ongoing Games Card - for spectating -->
            ${spectatableGames.length > 0 && !userIsPlaying ? `
                <div class="card" style="border: 2px solid var(--primary); background: var(--bg-card);">
                    <h2 style="margin-bottom: 1rem; color: var(--primary);">👁️ ${t('tournament.spectatingTitle')}</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        ${t('tournament.spectatingDesc')}
                    </p>
                    <div style="display: grid; gap: 1rem;">
                        ${spectatableGames.map(game => `
                            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px; box-shadow: var(--shadow-sm);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                                        <div style="flex: 1;">
                                            <strong style="color: var(--text-primary);">${game.white_player.username}</strong>
                                            <span style="color: var(--text-secondary); font-size: 0.9rem;">(${game.white_player.elo_rating})</span>
                                        </div>
                                        <span style="color: var(--text-secondary);">vs</span>
                                        <div style="flex: 1; text-align: right;">
                                            <strong style="color: var(--text-primary);">${game.black_player.username}</strong>
                                            <span style="color: var(--text-secondary); font-size: 0.9rem;">(${game.black_player.elo_rating})</span>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: var(--text-secondary); font-size: 0.85rem;">
                                        ${t('tournament.turnLabel')}: ${game.current_turn === 'white' ? t('tournament.whitePlayer') : t('tournament.blackPlayer')} | ${game.move_count} ${t('tournament.movesCount')}
                                    </span>
                                    <button class="btn btn-primary btn-sm" onclick="spectateGame(${game.game_id})">
                                        👁️ ${t('tournament.spectate')}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Matches Card -->
            ${matches.length > 0 ? `
                <div class="card">
                    <h2 style="margin-bottom: 1rem;">⚔️ ${t('tournament.matches')} (${matches.length})</h2>
                    <div>
                        ${matches.map(match => {
                            const isPlayerInMatch = match.player1_id === currentUserId || match.player2_id === currentUserId;
                            const canJoinMatch = isPlayerInMatch && !match.winner_id && match.status === 'scheduled';
                            
                            return `
                            <div style="padding: 1rem; margin-bottom: 1rem; background: ${isPlayerInMatch ? 'var(--bg-card)' : 'var(--bg-secondary)'}; border-radius: 8px; ${isPlayerInMatch ? 'border: 2px solid var(--success); box-shadow: var(--shadow-md);' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <strong>${t('tournament.round')} ${match.round_number}</strong>
                                    <span style="color: ${match.status === 'scheduled' ? 'var(--warning)' : match.status === 'in_progress' ? 'var(--primary)' : 'var(--success)'};">
                                        ${match.status === 'scheduled' ? `⏳ ${t('tournament.pending')}` : match.status === 'in_progress' ? `🎮 ${t('tournament.inProgress')}` : `✅ ${t('tournament.winner')}: ${match.winner_id === match.player1_id ? match.player1_name : match.player2_name}`}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1; ${match.player1_id === currentUserId ? 'font-weight: bold; color: var(--primary);' : ''}">
                                        ${match.player1_id === currentUserId ? '👤 ' : ''}${formatPlayerName(match.player1_name, match.player1_is_provisional)}
                                        ${match.winner_id === match.player1_id ? ' 🏆' : ''}
                                    </div>
                                    <div style="padding: 0 1rem; color: var(--text-secondary);">VS</div>
                                    <div style="flex: 1; text-align: right; ${match.player2_id === currentUserId ? 'font-weight: bold; color: var(--primary);' : ''}">
                                        ${match.player2_id === currentUserId ? '👤 ' : ''}${formatPlayerName(match.player2_name, match.player2_is_provisional)}
                                        ${match.winner_id === match.player2_id ? ' 🏆' : ''}
                                    </div>
                                </div>
                                ${canJoinMatch ? `
                                    <div style="margin-top: 1rem; text-align: center;">
                                        <button class="btn btn-success" onclick="startGame(${match.id}, ${tournament.id})" style="width: 100%;">
                                            ♟️ ${t('tournament.joinMatch')}
                                        </button>
                                    </div>
                                ` : ''}
                                ${!match.winner_id && isCreator ? `
                                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <button class="btn btn-sm btn-primary" onclick="startGame(${match.id}, ${tournament.id})">
                                            ♟️ ${t('tournament.play')}
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="setWinner(${match.id}, ${match.player1_id})">
                                            ${match.player1_name} ${t('tournament.wins')}
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="setWinner(${match.id}, ${match.player2_id})">
                                            ${match.player2_name} ${t('tournament.wins')}
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `}).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    app.innerHTML = html;
    
    // Add event listener for start tournament button
    const startBtn = document.getElementById('start-tournament-btn');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            if (!confirm(t('tournament.startConfirm'))) {
                return;
            }
            
            try {
                showLoading();
                const response = await tournamentAPI.start(tournament.id);
                hideLoading();
                
                if (response.success) {
                    showToast(t('tournament.started'), 'success');
                    // Reload
                    renderTournamentDetails(tournament.id);
                } else {
                    showToast(response.error || 'Greška', 'error');
                }
            } catch (error) {
                hideLoading();
                showToast(error.message, 'error');
            }
        });
    }
    
    // Add event listener for delete tournament button
    const deleteBtn = document.getElementById('delete-tournament-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm(t('tournament.deleteConfirm'))) {
                return;
            }
            
            try {
                showLoading();
                const response = await tournamentAPI.delete(tournament.id);
                hideLoading();
                
                if (response.success) {
                    showToast(t('tournament.deleted'), 'success');
                    router.navigate('/dashboard');
                } else {
                    showToast(response.error || t('tournament.deleteError'), 'error');
                }
            } catch (error) {
                hideLoading();
                showToast(error.message || t('tournament.deleteError'), 'error');
            }
        });
    }
}

// Global functions for match actions
window.startGame = async function(matchId, tournamentId) {
    console.log('[startGame] Creating game for match:', matchId, 'tournament:', tournamentId);
    try {
        showLoading();
        showToast('Pokrećem igru...', 'info');
        const response = await gameAPI.createFromMatch(matchId);
        hideLoading();
        
        if (response.success && response.game_id) {
            console.log('[startGame] Successfully created game:', response.game_id);
            // Small delay to ensure database is updated
            await new Promise(resolve => setTimeout(resolve, 200));
            router.navigate(`/game/${response.game_id}`);
        } else {
            console.error('[startGame] Failed to create game:', response.error);
            showToast(response.error || t('tournament.gameCreateError'), 'error');
        }
    } catch (error) {
        console.error('[startGame] Exception:', error);
        hideLoading();
        showToast(error.message || t('tournament.gameCreateError'), 'error');
    }
};

window.setWinner = async function(matchId, winnerId) {
    if (!confirm(t('tournament.confirmWinner'))) return;
    
    try {
        showLoading();
        const response = await tournamentAPI.updateMatch(matchId, winnerId);
        hideLoading();
        
        if (response.success) {
            showToast(t('tournament.resultUpdated'), 'success');
            // Reload page
            location.reload();
        } else {
            showToast(response.error || 'Greška', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message, 'error');
    }
};

// Spectate a game in progress
window.spectateGame = function(gameId) {
    console.log('Spectating game:', gameId);
    router.navigate(`/spectate/${gameId}`);
};

// Register route
import routerInstance from '../router.js';
routerInstance.register('/tournament/:id', renderTournamentDetails, true);

console.log('✅ Tournament Details (NEW) module loaded');
