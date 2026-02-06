/**
 * Game View - Router wrapper
 * Registrira rutu /game/:id i koristi novi gameView
 */

import router from '../router.js';
import renderGameView from './gameView.js';

// Register route with game ID parameter - handles #/game/14
router.register('/game/:id', async (gameId) => {
    console.log('Game route triggered with ID:', gameId);
    await renderGameView(gameId);
}, true);

// Support old format /game?id=X
router.register('/game', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let gameId = urlParams.get('id');
    
    if (!gameId) {
        // Try to extract from hash like #/game14
        const hash = window.location.hash;
        const match = hash.match(/\/game(\d+)/);
        if (match) {
            gameId = match[1];
        }
    }
    
    if (gameId) {
        await renderGameView(gameId);
    } else {
        router.navigate('/dashboard');
    }
}, true);

console.log('✅ Game routes registered');

// Dummy export for compatibility
export async function renderGame() {
    // Redirect to new implementation
    const hash = window.location.hash;
    const match = hash.match(/\/game[\/]?(\d+)/);
    if (match) {
        await renderGameView(match[1]);
    }
}
