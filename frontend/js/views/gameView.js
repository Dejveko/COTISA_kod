/**
 * Game View - Prikaz šahovske partije
 * Kompletni UI za igranje šaha
 */

import auth from '../auth.js';
import router from '../router.js';
import { showToast } from '../utils.js';
import ChessEngine from '../chess/ChessEngine.js';
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
let timerInterval = null;
let whiteTimeRemaining = 0;
let blackTimeRemaining = 0;
let lastMoveTime = null;
let gameEnded = false; // Prevent multiple endGame calls

export async function renderGameView(gameId) {
    if (!auth.isAuthenticated()) {
        router.navigate('/login');
        return;
    }

    // Parsiraj game ID
    const id = parseInt(gameId);
    if (!id || isNaN(id)) {
        showToast('Nevažeći ID igre', 'error');
        router.navigate('/dashboard');
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="game-page">
            <div class="game-main">
                <!-- Protivnik info -->
                <div class="player-panel opponent-panel">
                    <div class="player-info">
                        <img src="" alt="" class="player-avatar" id="opponent-avatar">
                        <div class="player-details">
                            <span class="player-name" id="opponent-name">Učitavanje...</span>
                            <span class="player-elo" id="opponent-elo"></span>
                        </div>
                    </div>
                    <div class="timer opponent-timer" id="opponent-timer">
                        <span class="timer-display">--:--</span>
                    </div>
                </div>
                
                <!-- Šahovska ploča -->
                <div class="board-section">
                    <div id="chess-board-container"></div>
                    
                    <div class="game-status" id="game-status">
                        <span class="status-text">Učitavanje igre...</span>
                    </div>
                </div>
                
                <!-- Tvoj info -->
                <div class="player-panel your-panel">
                    <div class="player-info">
                        <img src="" alt="" class="player-avatar" id="your-avatar">
                        <div class="player-details">
                            <span class="player-name" id="your-name">Ti</span>
                            <span class="player-elo" id="your-elo"></span>
                        </div>
                    </div>
                    <div class="timer your-timer" id="your-timer">
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
                
                <div class="sidebar-section game-controls">
                    <button class="btn btn-danger" id="resign-btn">
                        <span>🏳️</span> Predaj
                    </button>
                    <button class="btn btn-secondary" id="draw-btn">
                        <span>🤝</span> Ponudi Remi
                    </button>
                    <button class="btn btn-secondary" id="flip-btn">
                        <span>🔄</span> Okreni Ploču
                    </button>
                </div>
                
                <div class="sidebar-section" id="back-btn-container" style="display: none;">
                    <button class="btn btn-outline" id="back-btn">
                        ← Natrag na Turnir
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Game Over Modal -->
        <div class="modal-overlay hidden" id="game-over-modal">
            <div class="modal-content game-over-content">
                <h2 id="game-result-title">Igra Završena</h2>
                <div class="game-result-icon" id="game-result-icon">♔</div>
                <p id="game-result-text">Rezultat</p>
                <div class="game-result-stats" id="game-result-stats"></div>
                <div class="modal-actions" id="game-over-actions">
                    <button class="btn btn-primary" id="back-to-tournament-btn">🏆 Natrag na turnir</button>
                    <button class="btn btn-secondary" id="back-to-dashboard-btn">🏠 Dashboard</button>
                </div>
            </div>
        </div>
        
        <!-- Draw Offer Modal -->
        <div class="modal-overlay hidden" id="draw-offer-modal">
            <div class="modal-content">
                <h2>🤝 Ponuda Remija</h2>
                <p>Protivnik nudi remi. Prihvaćaš?</p>
                <div class="modal-actions" style="margin-top: 1.5rem;">
                    <button class="btn btn-success" id="accept-draw-btn">✓ Prihvati</button>
                    <button class="btn btn-danger" id="decline-draw-btn">✗ Odbij</button>
                </div>
            </div>
        </div>
        
        <!-- Promotion Modal -->
        <div class="modal-overlay hidden" id="promotion-modal">
            <div class="modal-content promotion-content">
                <h3>Odaberi figuru</h3>
                <div class="promotion-pieces">
                    <button class="promotion-piece" data-piece="q">♕</button>
                    <button class="promotion-piece" data-piece="r">♖</button>
                    <button class="promotion-piece" data-piece="b">♗</button>
                    <button class="promotion-piece" data-piece="n">♘</button>
                </div>
            </div>
        </div>
    `;

    // Event listeneri - dodaj PRIJE loadGame da rade čak i za completed igre
    document.getElementById('resign-btn').addEventListener('click', handleResign);
    document.getElementById('draw-btn').addEventListener('click', handleDrawOffer);
    document.getElementById('flip-btn').addEventListener('click', () => chessBoard?.flip());
    
    // Draw offer modal buttons
    document.getElementById('accept-draw-btn').addEventListener('click', handleAcceptDraw);
    document.getElementById('decline-draw-btn').addEventListener('click', handleDeclineDraw);
    
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
    
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        cleanup();
        router.navigate('/dashboard');
    });
    
    // Učitaj igru
    await loadGame(id);
}

async function loadGame(gameId) {
    // Reset game state
    gameEnded = false;
    
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameId}/`), {
            headers: {
                'X-Auth-Token': token
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Greška pri učitavanju igre');
        }

        gameData = await response.json();
        
        console.log('[loadGame] Učitana igra:', {
            gameId: gameData.game_id,
            status: gameData.status,
            whiteJoined: gameData.white_joined,
            blackJoined: gameData.black_joined,
            currentTurn: gameData.current_turn,
            fen: gameData.fen,
            tournamentType: gameData.tournament_type
        });
        
        // Odredi boju igrača
        const currentUser = auth.getUser();
        const playerColor = gameData.white_player.id === currentUser.id ? 'white' : 'black';
        
        console.log('[loadGame] Ti si:', playerColor);
        
        // Postavi info igrača
        setupPlayerInfo(playerColor);
        
        // Postavi tajmere iz servera
        whiteTimeRemaining = gameData.white_time_remaining || 600;
        blackTimeRemaining = gameData.black_time_remaining || 600;
        updateTimerDisplay();
        
        // Inicijaliziraj ploču sa FEN pozicijom
        initializeBoard(playerColor, gameData.fen);
        
        // Prikaži odgovarajuće gumbove ovisno o tome je li igra dio turnira
        updateNavigationButtons();
        
        // Ako je igra već završena, samo prikaži rezultat
        if (gameData.status === 'completed') {
            console.log('[loadGame] Igra je već završena, prikazujem rezultat');
            showGameOver(gameData.result);
            return;
        }
        
        // Join the game (označi kao spreman) - samo ako nije završena
        await joinGame(gameId);
        
        // Provjeri čeka li se na protivnika
        if (gameData.status === 'waiting') {
            console.log('[loadGame] Status: waiting - prikazujem waiting screen');
            showWaitingScreen(playerColor);
            startPolling(gameId);
            return;
        }
        
        // Igra je u tijeku - omogući gumbe i ploču
        console.log('[loadGame] Status: in_progress - omogućavam gumbe i pokrećem timer');
        document.getElementById('resign-btn').disabled = false;
        
        // Disable draw offers in elimination tournaments
        const drawBtn = document.getElementById('draw-btn');
        if (gameData.tournament_type === 'elimination') {
            drawBtn.disabled = true;
            drawBtn.title = 'Remi nije dozvoljen u eliminacijskom turniru';
            drawBtn.style.opacity = '0.5';
            drawBtn.style.cursor = 'not-allowed';
            console.log('[loadGame] Draw disabled for elimination tournament');
        } else {
            drawBtn.disabled = false;
        }
        if (chessBoard) {
            chessBoard.setDraggable(true);
        }
        
        startPolling(gameId);
        startTimer(playerColor);
        
        // Ažuriraj status
        updateGameStatus();
        
    } catch (error) {
        console.error('Error loading game:', error);
        showToast(error.message, 'error');
        
        // Prikaži error poruku na stranici
        document.getElementById('game-status').innerHTML = 
            `<span class="status-text" style="color: var(--danger);">❌ ${error.message}</span>`;
        document.getElementById('chess-board-container').innerHTML = 
            `<div style="text-align: center; padding: 3rem;">
                <p style="color: var(--danger); margin-bottom: 1rem;">${error.message}</p>
                <button class="btn btn-secondary" onclick="history.back()">← Natrag</button>
            </div>`;
    }
}

async function joinGame(gameId) {
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameId}/join/`), {
            method: 'POST',
            headers: {
                'X-Auth-Token': token
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            gameData.status = data.status;
            gameData.white_joined = data.white_joined;
            gameData.black_joined = data.black_joined;
            if (data.started_at) {
                gameData.started_at = data.started_at;
            }
        }
    } catch (error) {
        console.error('Error joining game:', error);
    }
}

function updateNavigationButtons() {
    const isTournament = gameData?.tournament_id;
    
    console.log('[updateNavigationButtons] Is tournament:', isTournament, 'Tournament ID:', gameData?.tournament_id);
    
    // Sidebar back button - prikaži samo za turnire
    const backBtnContainer = document.getElementById('back-btn-container');
    if (backBtnContainer) {
        backBtnContainer.style.display = isTournament ? 'block' : 'none';
        console.log('[updateNavigationButtons] Sidebar button display:', backBtnContainer.style.display);
    }
    
    // Modal buttons
    const tournamentBtn = document.getElementById('back-to-tournament-btn');
    const dashboardBtn = document.getElementById('back-to-dashboard-btn');
    
    if (!isTournament) {
        // Za obične igre: sakrij tournament gumb
        if (tournamentBtn) {
            tournamentBtn.remove();
        }
        // Dashboard gumb postaje primary
        if (dashboardBtn) {
            dashboardBtn.classList.remove('btn-secondary');
            dashboardBtn.classList.add('btn-primary');
        }
        console.log('[updateNavigationButtons] Regular game - tournament button removed, dashboard is primary');
    } else {
        console.log('[updateNavigationButtons] Tournament mode - both buttons visible');
    }
}

function showWaitingScreen(playerColor) {
    const statusEl = document.getElementById('game-status');
    const opponent = playerColor === 'white' ? gameData.black_player : gameData.white_player;
    
    console.log('[showWaitingScreen] Prikazujem ekran čekanja');
    
    statusEl.innerHTML = `
        <div class="waiting-container">
            <div class="waiting-spinner"></div>
            <span class="status-text status-waiting">⏳ Čekanje protivnika ${opponent.username}...</span>
            <p class="waiting-hint">Igra će početi kada oba igrača budu spremna</p>
        </div>
    `;
    
    // Disable board while waiting
    if (chessBoard) {
        chessBoard.setDraggable(false);
    }
    
    // Disable game controls
    document.getElementById('resign-btn').disabled = true;
    document.getElementById('draw-btn').disabled = true;
}

function hideWaitingScreen(playerColor) {
    console.log('[hideWaitingScreen] Omogućavam ploču i gumbe');
    
    // Enable board
    if (chessBoard) {
        chessBoard.setDraggable(true);
    }
    
    // Enable game controls
    document.getElementById('resign-btn').disabled = false;
    document.getElementById('draw-btn').disabled = false;
    
    // Start the timer now that both players are ready
    startTimer(playerColor);
    
    // Update status
    updateGameStatus();
}

function setupPlayerInfo(playerColor) {
    const user = auth.getUser();
    const opponent = playerColor === 'white' ? gameData.black_player : gameData.white_player;
    const you = playerColor === 'white' ? gameData.white_player : gameData.black_player;
    
    console.log('[setupPlayerInfo] Opponent:', opponent);
    console.log('[setupPlayerInfo] You:', you);
    
    // Protivnik
    document.getElementById('opponent-name').textContent = opponent.username;
    document.getElementById('opponent-elo').textContent = `ELO: ${opponent.elo_rating || '?'}`;
    const oppAvatar = document.getElementById('opponent-avatar');
    
    // Postavi default
    oppAvatar.src = getDefaultAvatar('#667eea');
    
    if (opponent.profile_picture) {
        // Koristi getMediaUrl helper za profile picture
        const imageUrl = getMediaUrl(opponent.profile_picture);
        
        // Pokušaj učitati sliku, vrati se na default ako ne uspije
        oppAvatar.onerror = () => {
            oppAvatar.src = getDefaultAvatar('#667eea');
            oppAvatar.onerror = null; // Reset error handler
        };
        oppAvatar.src = imageUrl;
    }
    
    // Ti
    document.getElementById('your-name').textContent = you.username + ' (Ti)';
    document.getElementById('your-elo').textContent = `ELO: ${you.elo_rating}`;
    const yourAvatar = document.getElementById('your-avatar');
    
    // Postavi default
    yourAvatar.src = getDefaultAvatar('#764ba2');
    
    if (you.profile_picture) {
        // Koristi getMediaUrl helper za profile picture
        const imageUrl = getMediaUrl(you.profile_picture);
        
        yourAvatar.onerror = () => {
            yourAvatar.src = getDefaultAvatar('#764ba2');
            yourAvatar.onerror = null;
        };
        yourAvatar.src = imageUrl;
    }
    
    // Dodaj boju figuri pored imena
    document.querySelector('.opponent-panel').dataset.color = playerColor === 'white' ? 'black' : 'white';
    document.querySelector('.your-panel').dataset.color = playerColor;
}

function initializeBoard(playerColor, fen) {
    const engine = new ChessEngine(fen || undefined);
    
    chessBoard = new ChessBoard('chess-board-container', {
        engine,
        orientation: playerColor,
        draggable: true,
        onMove: handleMove,
        onGameEnd: handleGameEnd
    });
    
    // Ažuriraj listu poteza ako ima povijesti
    if (gameData.move_history) {
        try {
            const history = JSON.parse(gameData.move_history);
            updateMovesList(history);
        } catch (e) {}
    }
}

async function handleMove(move) {
    // Provjeri je li tvoj red (server će također validirati)
    const currentUser = auth.getUser();
    const isWhite = gameData.white_player.id === currentUser.id;
    const currentTurn = chessBoard?.engine?.turn; // 'w' ili 'b'
    
    console.log('[handleMove]', {
        isWhite,
        currentTurn,
        gameDataCurrentTurn: gameData.current_turn,
        whitePlayerId: gameData.white_player.id,
        blackPlayerId: gameData.black_player.id,
        currentUserId: currentUser.id,
        gameStatus: gameData.status,
        draggable: chessBoard?.draggable
    });
    
    // PRIVREMENO: Uklonjena provjera - pusti sve kroz
    
    // Privremeno onemogući ploču dok server ne potvrdi
    chessBoard?.setDraggable(false);
    
    updateMovesList();
    updateGameStatus();
    
    // Pošalji potez na server
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameData.game_id}/move/`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            body: JSON.stringify({
                from: move.from,
                to: move.to,
                promotion: move.piece?.toLowerCase() === 'p' ? 'q' : undefined,
                san: move.san,
                fen: chessBoard.getPosition()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Greška pri slanju poteza');
        }
        
        const data = await response.json();
        
        // Ažuriraj lokalno stanje igre
        gameData.fen = chessBoard.getPosition();
        gameData.current_turn = data.current_turn;
        
        // Ažuriraj move_history lokalno
        let moveHistory = [];
        try {
            moveHistory = typeof gameData.move_history === 'string' ? JSON.parse(gameData.move_history) : (gameData.move_history || []);
        } catch (e) {
            moveHistory = [];
        }
        moveHistory.push({ san: move.san, from: move.from, to: move.to });
        gameData.move_history = moveHistory;
        updateMovesList();
        
        // Ažuriraj vrijeme sa servera
        if (data.white_time_remaining !== undefined) {
            whiteTimeRemaining = data.white_time_remaining;
            blackTimeRemaining = data.black_time_remaining;
            updateTimerDisplay();
        }
        
    } catch (error) {
        console.error('Greška pri slanju poteza:', error);
        showToast(error.message || 'Greška pri slanju poteza', 'error');
        // Vrati potez pri grešci
        if (gameData.fen) {
            chessBoard?.updateFromFEN(gameData.fen);
        }
    } finally {
        // Ponovno omogući ploču
        chessBoard?.setDraggable(true);
    }
}

function handleGameEnd(result) {
    console.log('[handleGameEnd] Igra završena:', result);
    if (gameEnded) {
        console.log('[handleGameEnd] Already ended, skipping');
        return;
    }
    cleanup();
    endGame(result);
}

function updateMovesList(historyData = null) {
    const movesList = document.getElementById('moves-list');
    
    // Use server move_history if available, otherwise fall back to local engine history
    let history = historyData;
    if (!history && gameData?.move_history) {
        try {
            history = typeof gameData.move_history === 'string' ? JSON.parse(gameData.move_history) : gameData.move_history;
        } catch (e) {
            console.error('Error parsing move_history:', e);
            history = [];
        }
    }
    if (!history) {
        history = chessBoard?.getHistory() || [];
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
    const engine = chessBoard?.engine;
    
    if (!engine) {
        console.log('[updateGameStatus] Nema engine-a');
        return;
    }
    
    let statusText = '';
    let statusClass = '';
    
    const currentTurn = engine.getCurrentTurn();
    const user = auth.getUser();
    const isYourTurn = (currentTurn === 'w' && gameData.white_player.id === user.id) ||
                       (currentTurn === 'b' && gameData.black_player.id === user.id);
    
    console.log('[updateGameStatus]', {
        currentTurn,
        userId: user.id,
        whiteId: gameData.white_player.id,
        blackId: gameData.black_player.id,
        isYourTurn,
        gameStatus: gameData.status
    });
    
    if (engine.isCheckmate()) {
        statusText = `Šah mat! ${currentTurn === 'w' ? 'Crni' : 'Bijeli'} pobjeđuje!`;
        statusClass = 'status-gameover';
    } else if (engine.isStalemate()) {
        statusText = 'Pat! Igra je neriješena.';
        statusClass = 'status-draw';
    } else if (engine.isDraw()) {
        statusText = 'Remi!';
        statusClass = 'status-draw';
    } else if (engine.isInCheck(currentTurn)) {
        statusText = `${isYourTurn ? 'Ti si' : 'Protivnik je'} u šahu!`;
        statusClass = 'status-check';
    } else {
        statusText = isYourTurn ? 'Tvoj potez' : 'Protivnikov potez';
        statusClass = isYourTurn ? 'status-your-turn' : 'status-waiting';
    }
    
    console.log('[updateGameStatus] Postavljam status:', statusText);
    statusEl.innerHTML = `<span class="status-text ${statusClass}">${statusText}</span>`;
}

function updateTimerDisplay() {
    const user = auth.getUser();
    const isWhite = gameData.white_player.id === user.id;
    
    const yourTime = isWhite ? whiteTimeRemaining : blackTimeRemaining;
    const opponentTime = isWhite ? blackTimeRemaining : whiteTimeRemaining;
    
    document.getElementById('your-timer').innerHTML = 
        `<span class="timer-display">${formatTime(yourTime)}</span>`;
    document.getElementById('opponent-timer').innerHTML = 
        `<span class="timer-display">${formatTime(opponentTime)}</span>`;
    
    // Highlight aktivni timer
    const engine = chessBoard?.engine;
    if (engine) {
        const currentTurn = engine.getCurrentTurn();
        const yourPanel = document.querySelector('.your-panel');
        const opponentPanel = document.querySelector('.opponent-panel');
        
        const isYourTurn = (currentTurn === 'w' && isWhite) || (currentTurn === 'b' && !isWhite);
        
        yourPanel.classList.toggle('active-turn', isYourTurn);
        opponentPanel.classList.toggle('active-turn', !isYourTurn);
    }
}

function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer(playerColor) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    lastMoveTime = Date.now();
    
    timerInterval = setInterval(() => {
        const engine = chessBoard?.engine;
        if (!engine || engine.isGameOver() || gameData.status !== 'in_progress') {
            clearInterval(timerInterval);
            timerInterval = null;
            return;
        }
        
        const currentTurn = engine.getCurrentTurn(); // 'w' ili 'b'
        
        // Oduzmi samo jednu sekundu od trenutnog igrača
        if (currentTurn === 'w') {
            whiteTimeRemaining = Math.max(0, whiteTimeRemaining - 1);
            if (whiteTimeRemaining <= 0) {
                handleTimeout('w');
                return;
            }
        } else {
            blackTimeRemaining = Math.max(0, blackTimeRemaining - 1);
            if (blackTimeRemaining <= 0) {
                handleTimeout('b');
                return;
            }
        }
        
        updateTimerDisplay();
    }, 1000);
}

function handleTimeout(loserColor) {
    console.log('[handleTimeout] Pozvan za boju:', loserColor);
    cleanup();
    
    const result = loserColor === 'w' ? 'black_win' : 'white_win';
    console.log('[handleTimeout] Završavam igru sa rezultatom:', result);
    endGame(result, 'timeout');
}

function startPolling(gameId) {
    const currentUser = auth.getUser();
    const playerColor = gameData.white_player.id === currentUser.id ? 'white' : 'black';
    
    console.log('[startPolling] Započinjem polling za igru', gameId, 'status:', gameData.status);
    
    // Polling interval - check server every 3 seconds but don't override time aggressively
    pollInterval = setInterval(async () => {
        try {
            const token = auth.getAuthToken();
            const response = await fetch(getApiUrl(`/game/${gameId}/`), {
                headers: {
                    'X-Auth-Token': token
                }
            });
            
            if (!response.ok) return;
            
            // Skip if game already ended
            if (gameEnded) {
                console.log('[polling] Game already ended, stopping poll');
                cleanup();
                return;
            }
            
            const data = await response.json();
            
            // Provjeri je li igra završena - MORA BITI PRVO!
            if (data.status === 'completed') {
                console.log('[polling] Igra završena! Result:', data.result);
                if (!gameEnded) {
                    gameEnded = true;
                    cleanup();
                    showGameOver(data.result);
                }
                return; // Izađi iz pollinga
            }
            if (gameData.status === 'waiting' && data.status === 'in_progress') {
                console.log('[polling] Igra počinje! Oba igrača su se priključila.');
                gameData.status = data.status;
                gameData.white_joined = data.white_joined;
                gameData.black_joined = data.black_joined;
                hideWaitingScreen(playerColor);
            }
            
            // Procesuiraj samo ako je igra u tijeku
            if (data.status === 'in_progress') {
                // Sync time from server only when FEN changes (new move) or significant drift
                // This prevents constant time reset while allowing server to be authoritative
                const fenChanged = data.fen && data.fen !== chessBoard?.getPosition();
                
                if (fenChanged) {
                    // New move detected - sync time from server
                    if (data.white_time_remaining !== undefined && data.black_time_remaining !== undefined) {
                        whiteTimeRemaining = data.white_time_remaining;
                        blackTimeRemaining = data.black_time_remaining;
                        updateTimerDisplay();
                    }
                    
                    gameData.fen = data.fen;
                    gameData.current_turn = data.current_turn;
                    gameData.move_history = data.move_history;
                    chessBoard?.updateFromFEN(data.fen);
                    updateMovesList();
                    updateGameStatus();
                    
                    // Provjeri je li igra završena (mat, pat, itd)
                    if (chessBoard?.engine?.isGameOver()) {
                        const result = chessBoard.engine.getGameResult();
                        console.log('[polling] Engine detektirao kraj igre:', result);
                        cleanup();
                        endGame(result);
                        return; // Izađi iz pollinga
                    }
                    
                    // Reproduciraj zvuk
                    try {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const oscillator = audioCtx.createOscillator();
                        const gainNode = audioCtx.createGain();
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.frequency.value = 440;
                        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                        oscillator.start();
                        oscillator.stop(audioCtx.currentTime + 0.1);
                    } catch (e) {}
                }
            }
            
            // Provjeri je li igra završena
            if (data.status === 'completed') {
                console.log('[polling] Igra završena (second check)! Result:', data.result);
                if (!gameEnded) {
                    gameEnded = true;
                    cleanup();
                    showGameOver(data.result);
                }
                return; // Izađi iz pollinga
            }
            
            // Provjeri draw offer od protivnika
            if (data.status === 'in_progress') {
                const user = auth.getUser();
                const isWhite = gameData.white_player.id === user.id;
                const opponentOffersDraw = isWhite ? data.black_offers_draw : data.white_offers_draw;
                
                // Ako protivnik nudi remi i mi još nismo vidjeli to
                if (opponentOffersDraw && !gameData.opponentDrawOfferShown) {
                    gameData.opponentDrawOfferShown = true;
                    showDrawOfferModal();
                }
            }
            
            // Provjeri timeout na serveru
            if (data.status === 'in_progress') {
                if (data.white_time_remaining !== undefined && data.white_time_remaining <= 0) {
                    console.log('[polling] Bijeli je izgubio na vrijeme!');
                    endGame('black_win', 'timeout');
                    return;
                }
                if (data.black_time_remaining !== undefined && data.black_time_remaining <= 0) {
                    console.log('[polling] Crni je izgubio na vrijeme!');
                    endGame('white_win', 'timeout');
                    return;
                }
            }
            
        } catch (error) {
            console.error('Greška pri pollingu:', error);
        }
    }, 3000); // Poll every 3 seconds
}

async function handleResign() {
    console.log('[handleResign] Funkcija pozvana');
    
    if (!confirm('Jesi li siguran da želiš predati partiju?')) {
        console.log('[handleResign] Korisnik otkazao predaju');
        return;
    }
    
    console.log('[handleResign] Šaljem zahtjev za predaju...');
    
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameData.game_id}/resign/`), {
            method: 'POST',
            headers: {
                'X-Auth-Token': token
            }
        });
        
        console.log('[handleResign] Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('[handleResign] Response data:', data);
            cleanup();
            showGameOver(data.result, 'resignation');
        } else {
            const errorData = await response.json();
            console.error('[handleResign] Error response:', errorData);
            showToast(errorData.error || 'Greška pri predaji', 'error');
        }
    } catch (error) {
        console.error('[handleResign] Exception:', error);
        showToast('Greška pri predaji', 'error');
    }
}

async function handleDrawOffer() {
    console.log('[handleDrawOffer] Šaljem ponudu remija...');
    
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameData.game_id}/draw-offer/`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.draw_accepted) {
                // Both players agreed - show game over
                showToast('Remi prihvaćen!', 'success');
                cleanup();
                showGameOver('draw');
            } else {
                // Offer sent, waiting for opponent
                showToast('Ponuda remija poslana. Čekam odgovor protivnika...', 'info');
                // Update local state
                const user = auth.getUser();
                const isWhite = gameData.white_player.id === user.id;
                if (isWhite) {
                    gameData.white_offers_draw = true;
                } else {
                    gameData.black_offers_draw = true;
                }
                // Update button to show offer is pending
                const drawBtn = document.getElementById('draw-btn');
                if (drawBtn) {
                    drawBtn.innerHTML = '<span>✓</span> Ponuda poslana';
                    drawBtn.disabled = true;
                }
            }
        } else {
            showToast(data.error || 'Greška', 'error');
        }
    } catch (error) {
        console.error('[handleDrawOffer] Exception:', error);
        showToast('Greška pri slanju ponude', 'error');
    }
}

function showDrawOfferModal() {
    const modal = document.getElementById('draw-offer-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

function hideDrawOfferModal() {
    const modal = document.getElementById('draw-offer-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('active');
    }
}

async function handleAcceptDraw() {
    hideDrawOfferModal();
    // Accepting draw = also offering draw, which triggers the draw
    await handleDrawOffer();
}

function handleDeclineDraw() {
    hideDrawOfferModal();
    showToast('Odbio si ponudu remija', 'info');
    // Reset opponent's offer so we can receive it again if they offer again
    gameData.opponentDrawOfferShown = false;
}

async function endGame(result, reason = null) {
    // Prevent double-calling
    if (gameEnded) {
        console.log('[endGame] Already ended, skipping');
        return;
    }
    gameEnded = true;
    
    // Ensure cleanup happens first
    cleanup();
    
    try {
        const token = auth.getAuthToken();
        const response = await fetch(getApiUrl(`/game/${gameData.game_id}/end/`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            body: JSON.stringify({ 
                result, 
                pgn: chessBoard?.getPGN(),
                reason
            })
        });
        
        const data = await response.json();
        
        // Check if replay is required (stalemate in elimination)
        if (data.replay_required) {
            console.log('[endGame] Replay required - showing replay modal');
            showReplayModal(data.message);
            return;
        }
    } catch (error) {
        console.error('Error ending game:', error);
    }
    
    showGameOver(result, reason);
}

function showReplayModal(message) {
    const modal = document.getElementById('game-over-modal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.innerHTML = `
            <h2 style="color: var(--warning);">⚠️ Pat - Ponovljeni Meč</h2>
            <div style="font-size: 3rem; margin: 1rem 0;">🔄</div>
            <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">${message || 'Remi nije dozvoljen u eliminacijskom turniru. Meč će se ponoviti.'}</p>
            <div class="modal-actions">
                <button class="btn btn-primary" id="back-to-tournament-replay-btn">🏆 Natrag na turnir</button>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.zIndex = '99999';
    
    // Add event listener
    setTimeout(() => {
        const btn = document.getElementById('back-to-tournament-replay-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                cleanup();
                if (gameData?.tournament_id) {
                    router.navigate(`/tournament/${gameData.tournament_id}`);
                } else {
                    router.navigate('/dashboard');
                }
            });
        }
    }, 100);
}

function showGameOver(result, reason = null) {
    console.log('[showGameOver] Pozvan sa:', {result, reason});
    
    // Ažuriraj navigacijske gumbove ovisno o tome je li igra dio turnira
    updateNavigationButtons();
    
    const modal = document.getElementById('game-over-modal');
    const modalContent = modal?.querySelector('.modal-content');
    const titleEl = document.getElementById('game-result-title');
    const iconEl = document.getElementById('game-result-icon');
    const textEl = document.getElementById('game-result-text');
    const statsEl = document.getElementById('game-result-stats');
    
    if (!modal) {
        console.error('[showGameOver] Modal element ne postoji!');
        return;
    }
    
    console.log('[showGameOver] Modal pronađen, prikazujem...');
    
    const user = auth.getUser();
    const isWhite = gameData.white_player.id === user.id;
    
    let title, icon, text, resultType;
    
    if (result === 'white_win') {
        if (isWhite) {
            title = 'POBJEDA!';
            icon = '🏆';
            text = 'Čestitamo! Sjajno odigrana partija!';
            resultType = 'win';
        } else {
            title = 'Poraz';
            icon = '😔';
            text = 'Bijeli je pobijedio. Sretno sljedeći put!';
            resultType = 'loss';
        }
    } else if (result === 'black_win') {
        if (!isWhite) {
            title = 'POBJEDA!';
            icon = '🏆';
            text = 'Čestitamo! Sjajno odigrana partija!';
            resultType = 'win';
        } else {
            title = 'Poraz';
            icon = '😔';
            text = 'Crni je pobijedio. Sretno sljedeći put!';
            resultType = 'loss';
        }
    } else {
        title = 'Remi';
        icon = '🤝';
        text = 'Partija je završila neriješeno.';
        resultType = 'draw';
    }
    
    // Reason text
    let reasonText = '';
    if (reason === 'timeout') {
        reasonText = 'Isteklo vrijeme';
    } else if (reason === 'resignation') {
        reasonText = 'Predaja protivnika';
        if (resultType === 'loss') reasonText = 'Predali ste partiju';
    } else if (reason === 'checkmate') {
        reasonText = 'Šah-mat!';
    } else if (reason === 'stalemate') {
        reasonText = 'Pat pozicija';
    } else if (reason === 'agreement') {
        reasonText = 'Dogovoreni remi';
    }
    
    // Remove previous result classes
    if (modalContent) {
        modalContent.classList.remove('result-win', 'result-loss', 'result-draw');
        modalContent.classList.add(`result-${resultType}`);
    }
    
    // Build enhanced content
    const moves = chessBoard?.getHistory().length || 0;
    const opponent = isWhite ? gameData.black_player : gameData.white_player;
    
    // Create confetti effect for wins
    let confettiHTML = '';
    if (resultType === 'win') {
        confettiHTML = '<div class="confetti-container" id="confetti"></div>';
    }
    
    titleEl.innerHTML = `
        <span class="result-icon ${resultType}">${icon}</span>
        <span class="result-title-text">${title}</span>
    `;
    iconEl.style.display = 'none'; // Hide old icon element
    textEl.innerHTML = `
        <p class="result-main-text">${text}</p>
        ${reasonText ? `<p class="result-reason">${reasonText}</p>` : ''}
    `;
    
    console.log('[showGameOver] Postavljam sadržaj modala:', {title, icon, text});
    
    // Enhanced stats
    statsEl.innerHTML = `
        ${confettiHTML}
        <div class="game-result-details">
            <div class="result-stat">
                <span class="stat-label">Protivnik</span>
                <span class="stat-value">${opponent.username}</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">Broj poteza</span>
                <span class="stat-value">${moves}</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">Vaša boja</span>
                <span class="stat-value">${isWhite ? '⬜ Bijeli' : '⬛ Crni'}</span>
            </div>
        </div>
    `;
    
    // Add custom styles for the result popup
    addResultPopupStyles();
    
    console.log('[showGameOver] Prikazujem modal - uklanjam hidden klasu');
    modal.classList.remove('hidden');
    modal.classList.add('active');
    
    // FORCE visibility with inline styles to bypass any CSS issues
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.zIndex = '99999';
    modal.style.pointerEvents = 'auto';
    
    // Trigger confetti animation for wins
    if (resultType === 'win') {
        setTimeout(() => createConfetti(), 100);
    }
    
    console.log('[showGameOver] Modal classList:', modal.classList.toString());
    console.log('[showGameOver] Modal computed style:', window.getComputedStyle(modal).display);
    console.log('[showGameOver] Modal opacity:', window.getComputedStyle(modal).opacity);
    console.log('[showGameOver] Modal z-index:', window.getComputedStyle(modal).zIndex);
    
    // Disable board and buttons
    if (chessBoard) {
        chessBoard.setDraggable(false);
    }
    
    // Disable game action buttons
    const resignBtn = document.getElementById('resign-btn');
    const drawBtn = document.getElementById('draw-btn');
    if (resignBtn) resignBtn.disabled = true;
    if (drawBtn) drawBtn.disabled = true;
}

function addResultPopupStyles() {
    if (document.getElementById('result-popup-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'result-popup-styles';
    styles.textContent = `
        .modal-content.result-win {
            background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%) !important;
            border: 3px solid #FFD700 !important;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 60px rgba(255, 215, 0, 0.1) !important;
            animation: winPulse 2s ease-in-out infinite !important;
        }
        
        .modal-content.result-loss {
            background: linear-gradient(135deg, #4a1c1c 0%, #5c2828 50%, #4a1c1c 100%) !important;
            border: 3px solid #8B0000 !important;
            box-shadow: 0 0 20px rgba(139, 0, 0, 0.3) !important;
        }
        
        .modal-content.result-draw {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%) !important;
            border: 3px solid #95a5a6 !important;
            box-shadow: 0 0 20px rgba(149, 165, 166, 0.3) !important;
        }
        
        @keyframes winPulse {
            0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 60px rgba(255, 215, 0, 0.1); }
            50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), inset 0 0 80px rgba(255, 215, 0, 0.15); }
        }
        
        .result-icon {
            font-size: 4rem;
            display: block;
            margin-bottom: 0.5rem;
            animation: iconBounce 0.6s ease-out;
        }
        
        .result-icon.win {
            animation: iconBounce 0.6s ease-out, trophyGlow 1.5s ease-in-out infinite;
        }
        
        @keyframes iconBounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        
        @keyframes trophyGlow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
            50% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
        }
        
        .result-title-text {
            font-size: 2rem;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .result-win .result-title-text {
            color: #FFD700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        
        .result-loss .result-title-text {
            color: #ff6b6b;
        }
        
        .result-draw .result-title-text {
            color: #95a5a6;
        }
        
        .result-main-text {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .result-reason {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
            margin-top: 0.25rem;
        }
        
        .game-result-details {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
        }
        
        .result-stat {
            text-align: center;
            min-width: 80px;
        }
        
        .stat-label {
            display: block;
            font-size: 0.8rem;
            color: #666 !important;
            margin-bottom: 0.25rem;
        }
        
        .stat-value {
            display: block;
            font-size: 1.1rem;
            font-weight: bold;
            color: #1a1a2e !important;
        }
        
        .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 10;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            animation: confettiFall 3s ease-out forwards;
        }
        
        @keyframes confettiFall {
            0% {
                transform: translateY(-100%) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(400px) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styles);
}

function createConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;
    
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#FF69B4'];
    const shapes = ['square', 'circle'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)] === 'circle' ? '50%' : '0';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

function cleanup() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Clean up on page leave
window.addEventListener('beforeunload', cleanup);

// Export
export default renderGameView;
