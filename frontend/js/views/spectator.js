/**
 * Spectator View - Router wrapper
 * Registrira rutu /spectate/:id za promatranje igara
 */

import router from '../router.js';
import renderSpectatorView from './spectatorView.js';

// Register route with game ID parameter - handles #/spectate/14
router.register('/spectate/:id', async (gameId) => {
    console.log('Spectator route triggered with game ID:', gameId);
    await renderSpectatorView(gameId);
}, true);

console.log('✅ Spectator routes registered');

export default renderSpectatorView;
