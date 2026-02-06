/**
 * Spectator View - Watch chess games in progress
 * Read-only view for tournament spectators
 */

import auth from '../auth.js';
import router from '../router.js';
import { showToast } from '../utils.js';
import ChessBoard from '../chess/ChessBoard.js';
import { getApiUrl, getMediaUrl } from '../api.js';

// Default chess piece avatar
function getDefaultAvatar(color = '#667eea') {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encodeURIComponent(color)}"/><text x="50" y="70" font-size="50" text-anchor="middle" fill="white">♔</text></svg>`;
}

// Game state
let gameData = null;
let chessBoard = null;
let pollInterval = null;
let whiteTimeRemaining = 0;
let blackTimeRemaining = 0;

export async function renderSpectatorView(gameId) {
    if (!auth.isAuthenticated()) {
        router.navigate('/login');
        return;
    }

    // Parse game ID
    const id = parseInt(gameId);
    if (!id || isNaN(id)) {
        showToast('Nevažeći ID igre', 'error');
        router.navigate('/dashboard');
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="game-page spectator-mode">
            <div class="spectator-banner">
                <span class="spectator-icon">👁️</span>
                <span>Promatrač - Samo gledanje</span>
            </div>
            
            <div class="game-main">
                <!-- White player info (top) -->
                <div class="player-panel opponent-panel">
                    <div class="player-info">
                        <img src="" alt="" class="player-avatar" id="white-avatar">
                        <div class="player-details">
                            <span class="player-name" id="white-name">Učitavanje...</span>
                            <span class="player-elo" id="white-elo"></span>
                        </div>
                    </div>
                    <div class="timer" id="white-timer">
                        <span class="timer-display">--:--</span>
                    </div>
                </div>
                
                <!-- Chess board -->
                <div class="board-section">
                    <div id="chess-board-container"></div>
                    
                    <div class="board-controls spectator-controls">
                        <button class="btn btn-secondary btn-sm" id="flip-btn" title="Okreni ploču">
                            🔄 Okreni ploču
                        </button>
                    </div>
                    
                    <div class="game-status" id="game-status">
                        <span class="status-text">Učitavanje igre...</span>
                    </div>
                </div>
                
                <!-- Black player info (bottom) -->
                <div class="player-panel your-panel">
                    <div class="player-info">
                        <img src="" alt="" class="player-avatar" id="black-avatar">
                        <div class="player-details">
                            <span class="player-name" id="black-name">Učitavanje...</span>
                            <span class="player-elo" id="black-elo"></span>
                        </div>
                    </div>
                    <div class="timer" id="black-timer">
                        <span class="timer-display">--:--</span>
                    </div>
                </div>
            </div>
            
            <!-- Sidebar -->
            <div class="game-sidebar">
                <div class="sidebar-section">
                    <h3>📜 Potezi</h3>
                    <div class="moves-list" id="moves-list">
                        <div class="no-moves">Još nema poteza</div>
                    </div>
                </div>
                
                <div class="sidebar-section">
                    <button class="btn btn-secondary btn-block" id="back-btn">
                        <span>←</span> Natrag na turnir
                    </button>
                </div>
            </div>
            
            <!-- Game Over Modal -->
            <div class="modal-overlay hidden" id="game-over-modal">
                <div class="modal-content game-over-content">
                    <h2 id="game-result-title">Igra Završena</h2>
                    <div class="game-result-icon" id="game-result-icon">♔</div>
                    <p id="game-result-text">Rezultat</p>
                    <div class="game-result-stats" id="game-result-stats"></div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="back-to-tournament-btn">🏆 Natrag na turnir</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup event listeners
    document.getElementById('back-btn').addEventListener('click', () => {
        cleanup();
        if (gameData?.tournament_id) {
            router.navigate(`/tournament/${gameData.tournament_id}`);
        } else {
            router.navigate('/dashboard');
        }
    });
    
    document.getElementById('back-to-tournament-btn').addEventListener('click', () => {
        cleanup();
        if (gameData?.tournament_id) {
            router.navigate(`/tournament/${gameData.tournament_id}`);
        } else {
            router.navigate('/dashboard');
        }
    });
    
    // Flip board button
    document.getElementById('flip-btn').addEventListener('click', () => {
        if (chessBoard) {
            chessBoard.flip();
        }
    });
    
    // Load game
    await loadGame(id);
}

async function loadGame(gameId) {
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameId}/spectate/`), {
            headers: {
                'X-Auth-Token': token
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Greška pri učitavanju igre');
        }

        gameData = await response.json();
        
        console.log('[Spectator] Loaded game:', {
            gameId: gameData.game_id,
            status: gameData.status,
            white: gameData.white_player.username,
            black: gameData.black_player.username
        });
        
        // Setup player info
        setupPlayerInfo();
        
        // Setup timers
        whiteTimeRemaining = gameData.white_time_remaining || 600;
        blackTimeRemaining = gameData.black_time_remaining || 600;
        updateTimerDisplay();
        
        // Initialize board (always from white's perspective for spectators)
        initializeBoard(gameData.fen);
        
        // Update status
        updateGameStatus();
        
        // Start polling for updates
        startPolling(gameId);
        
    } catch (error) {
        console.error('Error loading game:', error);
        showToast(error.message, 'error');
        
        document.getElementById('game-status').innerHTML = 
            `<span class="status-text" style="color: var(--danger);">❌ ${error.message}</span>`;
        document.getElementById('chess-board-container').innerHTML = 
            `<div style="text-align: center; padding: 3rem;">
                <p style="color: var(--danger); margin-bottom: 1rem;">${error.message}</p>
                <button class="btn btn-secondary" onclick="history.back()">← Natrag</button>
            </div>`;
    }
}

function setupPlayerInfo() {
    const whiteAvatar = document.getElementById('white-avatar');
    const whiteName = document.getElementById('white-name');
    const whiteElo = document.getElementById('white-elo');
    
    const blackAvatar = document.getElementById('black-avatar');
    const blackName = document.getElementById('black-name');
    const blackElo = document.getElementById('black-elo');
    
    // White player
    whiteName.textContent = gameData.white_player.username;
    whiteElo.textContent = `${gameData.white_player.elo_rating} ELO`;
    whiteAvatar.src = gameData.white_player.profile_picture 
        ? getMediaUrl(gameData.white_player.profile_picture)
        : getDefaultAvatar('#f0f0f0');
    whiteAvatar.onerror = () => { whiteAvatar.src = getDefaultAvatar('#f0f0f0'); };
    
    // Black player
    blackName.textContent = gameData.black_player.username;
    blackElo.textContent = `${gameData.black_player.elo_rating} ELO`;
    blackAvatar.src = gameData.black_player.profile_picture 
        ? getMediaUrl(gameData.black_player.profile_picture)
        : getDefaultAvatar('#333333');
    blackAvatar.onerror = () => { blackAvatar.src = getDefaultAvatar('#333333'); };
}

function initializeBoard(fen) {
    // Create read-only board (white perspective)
    chessBoard = new ChessBoard('chess-board-container', {
        orientation: 'white',
        draggable: false, // Spectators cannot move pieces
        showHighlights: true,
        playSound: true,
        fen: fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    });
    
    updateMovesList();
}

function updateMovesList() {
    const movesList = document.getElementById('moves-list');
    
    let history = null;
    if (gameData?.move_history) {
        try {
            history = typeof gameData.move_history === 'string' ? JSON.parse(gameData.move_history) : gameData.move_history;
        } catch (e) {
            console.error('Error parsing move_history:', e);
            history = [];
        }
    }
    
    if (!history || history.length === 0) {
        movesList.innerHTML = '<div class="no-moves">Još nema poteza</div>';
        return;
    }
    
    let html = '<table class="moves-table">';
    for (let i = 0; i < history.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = typeof history[i] === 'string' ? history[i] : history[i].san;
        const blackMove = history[i + 1] ? (typeof history[i + 1] === 'string' ? history[i + 1] : history[i + 1].san) : '';
        
        html += `<tr>
            <td class="move-num">${moveNum}.</td>
            <td class="white-move">${whiteMove}</td>
            <td class="black-move">${blackMove}</td>
        </tr>`;
    }
    html += '</table>';
    
    movesList.innerHTML = html;
    movesList.scrollTop = movesList.scrollHeight;
}

function updateGameStatus() {
    const statusEl = document.getElementById('game-status');
    
    let statusText = '';
    let statusClass = '';
    
    if (gameData.status === 'completed') {
        if (gameData.result === 'draw' || gameData.result === 'stalemate') {
            statusText = '🤝 Remi';
            statusClass = 'status-draw';
        } else if (gameData.result === 'white_win') {
            statusText = `🏆 ${gameData.white_player.username} pobjeđuje!`;
            statusClass = 'status-gameover';
        } else if (gameData.result === 'black_win') {
            statusText = `🏆 ${gameData.black_player.username} pobjeđuje!`;
            statusClass = 'status-gameover';
        } else {
            statusText = 'Igra završena';
            statusClass = 'status-gameover';
        }
    } else if (gameData.status === 'waiting') {
        statusText = '⏳ Čekanje igrača...';
        statusClass = 'status-waiting';
    } else {
        const turnPlayer = gameData.current_turn === 'white' ? gameData.white_player.username : gameData.black_player.username;
        statusText = `Na potezu: ${turnPlayer}`;
        statusClass = 'status-in-progress';
    }
    
    statusEl.innerHTML = `<span class="status-text ${statusClass}">${statusText}</span>`;
}

function updateTimerDisplay() {
    const whiteTimerEl = document.getElementById('white-timer');
    const blackTimerEl = document.getElementById('black-timer');
    
    whiteTimerEl.querySelector('.timer-display').textContent = formatTime(whiteTimeRemaining);
    blackTimerEl.querySelector('.timer-display').textContent = formatTime(blackTimeRemaining);
    
    // Highlight active player's timer
    if (gameData.current_turn === 'white') {
        whiteTimerEl.classList.add('active');
        blackTimerEl.classList.remove('active');
    } else {
        whiteTimerEl.classList.remove('active');
        blackTimerEl.classList.add('active');
    }
}

function formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startPolling(gameId) {
    console.log('[Spectator] Starting polling for game', gameId);
    
    pollInterval = setInterval(async () => {
        try {
            const token = auth.getAuthToken();
            const response = await fetch(getApiUrl(`/game/${gameId}/spectate/`), {
                headers: {
                    'X-Auth-Token': token
                }
            });
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            // Update time
            if (data.white_time_remaining !== undefined) {
                whiteTimeRemaining = data.white_time_remaining;
            }
            if (data.black_time_remaining !== undefined) {
                blackTimeRemaining = data.black_time_remaining;
            }
            updateTimerDisplay();
            
            // Check if game ended
            if (data.status === 'completed') {
                console.log('[Spectator] Game ended:', data.result);
                cleanup();
                gameData = data;
                updateGameStatus();
                showGameOver(data.result);
                return;
            }
            
            // Update board if position changed
            if (data.fen && data.fen !== chessBoard?.getPosition()) {
                gameData.fen = data.fen;
                gameData.current_turn = data.current_turn;
                gameData.move_history = data.move_history;
                chessBoard?.updateFromFEN(data.fen);
                updateMovesList();
                updateGameStatus();
                
                // Play sound for new move
                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscillator.frequency.value = 440;
                    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.1);
                } catch (e) {}
            }
            
        } catch (error) {
            console.error('Spectator polling error:', error);
        }
    }, 1500); // Poll every 1.5 seconds for spectators
}

function showGameOver(result) {
    const modal = document.getElementById('game-over-modal');
    const titleEl = document.getElementById('game-result-title');
    const iconEl = document.getElementById('game-result-icon');
    const textEl = document.getElementById('game-result-text');
    
    if (!modal) return;
    
    let title, icon, text;
    
    if (result === 'white_win') {
        title = `🏆 ${gameData.white_player.username} pobjeđuje!`;
        icon = '♔';
        text = 'Bijeli je pobijedio.';
    } else if (result === 'black_win') {
        title = `🏆 ${gameData.black_player.username} pobjeđuje!`;
        icon = '♚';
        text = 'Crni je pobijedio.';
    } else {
        title = '🤝 Remi';
        icon = '½';
        text = 'Partija je završila neriješeno.';
    }
    
    titleEl.textContent = title;
    iconEl.textContent = icon;
    textEl.textContent = text;
    
    modal.classList.remove('hidden');
}

function cleanup() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Clean up on page leave
window.addEventListener('beforeunload', cleanup);

// Export
export default renderSpectatorView;
