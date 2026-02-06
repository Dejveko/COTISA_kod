// Player Profile View (for viewing other players)
import auth from '../auth.js';
import router from '../router.js';
import { playerAPI, friendsAPI, getMediaUrl } from '../api.js';
import { showToast, showLoading, hideLoading, formatDate } from '../utils.js';

// Default chess piece avatar - URL-encoded for safe use in inline handlers
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2250%22 text-anchor=%22middle%22 fill=%22white%22%3E%E2%99%94%3C/text%3E%3C/svg%3E';

// Make it globally available for onerror handlers
window.DEFAULT_AVATAR = DEFAULT_AVATAR;

function getDefaultAvatar() {
    return DEFAULT_AVATAR;
}

export async function renderPlayerProfile(playerId) {
    if (!auth.requireAuth()) return;
    
    const currentUser = auth.getUser();
    const app = document.getElementById('app');
    const isMobile = window.innerWidth <= 576;
    
    // Show loading
    app.innerHTML = `
        <div class="container">
            <div class="text-center" style="padding: 3rem;">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">${t('common.loading')}</p>
            </div>
        </div>
    `;
    
    try {
        const response = await playerAPI.getProfile(playerId);
        
        if (!response.success || !response.player) {
            throw new Error(t('playerProfile.notFound'));
        }
        
        const player = response.player;
        const isOwnProfile = currentUser.id === player.id;
        
        app.innerHTML = `
            <div class="container" style="max-width: 1000px; padding: ${isMobile ? '12px' : '20px'};">
                <!-- Back Button -->
                <button class="btn btn-secondary" onclick="history.back()" style="margin-bottom: 1rem;">
                    ← ${t('common.back')}
                </button>
                
                <!-- Profile Header -->
                <div class="profile-header" style="padding: ${isMobile ? '20px 16px' : '2rem'}; margin-bottom: ${isMobile ? '16px' : '1.5rem'}; text-align: center;">
                    <div class="profile-avatar" style="width: ${isMobile ? '80px' : '100px'}; height: ${isMobile ? '80px' : '100px'}; margin: 0 auto 1rem; border-radius: 50%; overflow: hidden;">
                        ${player.profile_picture ? 
                            `<img src="${getMediaUrl(player.profile_picture)}" alt="${player.username}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src=window.DEFAULT_AVATAR">` :
                            `<img src="${DEFAULT_AVATAR}" alt="${player.username}" style="width: 100%; height: 100%; object-fit: cover;">`
                        }
                    </div>
                    <h1 style="font-size: ${isMobile ? '1.5rem' : '1.75rem'}; margin-bottom: 0.25rem; color: white !important;">
                        ${player.is_provisional ? '<span style="color: #FFD700; font-weight: bold;">●</span> ' : ''}
                        ${player.active_title ? `<span style="color: ${player.active_title.color};">${player.active_title.icon || '🏅'}</span> ` : ''}
                        ${player.username}
                        ${(player.role === 'admin' || player.role === 'Administrator') ? ' <span style="color: gold;">👑</span>' : ''}
                    </h1>
                    ${player.active_title ? `<p style="color: ${player.active_title.color}; font-weight: 600; margin: 0.25rem 0;">${player.active_title.name}</p>` : ''}
                    ${player.full_name ? `<p style="color: rgba(255,255,255,0.9) !important; font-size: 0.9rem;">${player.full_name}</p>` : ''}
                    ${player.is_provisional ? `
                        <div style="background: rgba(255, 215, 0, 0.2); border: 1px solid #FFD700; padding: 0.4rem 0.8rem; border-radius: 20px; margin-top: 0.5rem; display: inline-block;">
                            <small style="color: #FFD700; font-weight: 600;">🌱 ${t('profile.provisional')} (${player.matches_played || 0}/5 ${t('profile.matchesPlayed')})</small>
                        </div>
                    ` : ''}
                    <div style="margin-top: 0.5rem;">
                        <span class="role-badge ${player.role}">
                            ${player.role === 'admin' || player.role === 'Administrator' ? '👑 ' + t('profile.admin') : '♟️ ' + t('profile.player')}
                        </span>
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(${isMobile ? '2' : '4'}, 1fr); gap: ${isMobile ? '8px' : '1rem'}; margin-bottom: ${isMobile ? '16px' : '1.5rem'};">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${player.elo_rating || 800}</div>
                        <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('profile.generalElo')}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #11998e, #38ef7d); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${player.wins || 0}</div>
                        <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('players.wins')}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #eb3349, #f45c43); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${player.losses || 0}</div>
                        <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('players.losses')}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #606c88, #3f4c6b); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                        <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${player.draws || 0}</div>
                        <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('players.draws')}</div>
                    </div>
                </div>
                
                <!-- ELO po kategorijama -->
                <div class="card" style="margin-bottom: ${isMobile ? '16px' : '1.5rem'};">
                    <div class="card-header" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                        <h2 style="font-size: 1.1rem; margin: 0;">♟️ ${t('profile.eloByCategory')}</h2>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(${isMobile ? '2' : '4'}, 1fr); gap: 0; border-top: 1px solid var(--border-color);">
                        <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'}; ${isMobile ? '' : 'border-right: 1px solid var(--border-color);'} ${isMobile ? 'border-bottom: 1px solid var(--border-color);' : ''}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                                <span>⚡</span> Bullet
                            </div>
                            <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${player.elo_bullet || 800}</div>
                        </div>
                        <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'}; ${isMobile ? 'border-bottom: 1px solid var(--border-color);' : 'border-right: 1px solid var(--border-color);'}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                                <span>🔥</span> Blitz
                            </div>
                            <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${player.elo_blitz || 800}</div>
                        </div>
                        <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'}; ${isMobile ? '' : 'border-right: 1px solid var(--border-color);'}">
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                                <span>⏱️</span> Rapid
                            </div>
                            <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${player.elo_rapid || 800}</div>
                        </div>
                        <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'};">
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                                <span>📅</span> Daily
                            </div>
                            <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${player.elo_daily || 800}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Info + Akcije -->
                <div style="display: grid; grid-template-columns: ${isMobile || isOwnProfile ? '1fr' : '2fr 1fr'}; gap: ${isMobile ? '16px' : '1.5rem'}; margin-bottom: ${isMobile ? '16px' : '1.5rem'};">
                    <!-- Player Info -->
                    <div class="card">
                        <div class="card-header" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                            <h2 style="font-size: 1.1rem; margin: 0;">📋 ${t('playerProfile.info')}</h2>
                        </div>
                        <div style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                            <div style="display: grid; gap: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                    <span style="color: var(--text-secondary);">${t('playerProfile.experienceLevel')}</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">
                                        ${player.experience_level === 'beginner' ? '🌱 ' + t('playerProfile.levelBeginner') : 
                                          player.experience_level === 'intermediate' ? '♟️ ' + t('playerProfile.levelIntermediate') : 
                                          player.experience_level === 'advanced' ? '👑 ' + t('playerProfile.levelAdvanced') : 'N/A'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                    <span style="color: var(--text-secondary);">${t('profile.totalMatches')}</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">${player.total_matches || 0}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                    <span style="color: var(--text-secondary);">${t('playerProfile.rankedMatches')}</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">
                                        ${player.matches_played || 0}
                                        ${player.is_provisional ? ` <span style="color: #FFD700;">(${t('profile.provisional')})</span>` : ''}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                    <span style="color: var(--text-secondary);">${t('profile.winRate')}</span>
                                    <span style="font-weight: 600; color: var(--success);">
                                        ${player.total_matches > 0 ? Math.round((player.wins / player.total_matches) * 100) + '%' : 'N/A'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                    <span style="color: var(--text-secondary);">${t('playerProfile.memberSince')}</span>
                                    <span style="font-weight: 600; color: var(--text-primary);">${player.created_at ? formatDate(player.created_at) : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${!isOwnProfile ? `
                    <!-- Akcije -->
                    <div class="card">
                        <div class="card-header" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                            <h2 style="font-size: 1.1rem; margin: 0;">🎮 ${t('playerProfile.actions')}</h2>
                        </div>
                        <div style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'}; display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-primary" style="width: 100%;" onclick="challengePlayer(${player.id})">
                                ⚔️ ${t('playerProfile.challenge')}
                            </button>
                            <button class="btn btn-secondary" style="width: 100%;" id="friend-btn" onclick="addFriend(${player.id})" data-player-id="${player.id}">
                                <span class="spinner-small" style="display: none;"></span>
                                <span class="btn-text">➕ ${t('playerProfile.addFriend')}</span>
                            </button>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Check friendship status if not own profile
        if (!isOwnProfile) {
            checkAndUpdateFriendButton(player.id);
        }
        
    } catch (error) {
        console.error('Error loading player profile:', error);
        app.innerHTML = `
            <div class="container">
                <div class="card">
                    <div class="text-center" style="padding: 2rem;">
                        <p style="color: var(--danger); margin-bottom: 1rem;">❌ ${error.message || t('playerProfile.errorLoading')}</p>
                        <button class="btn btn-secondary" onclick="history.back()">
                            ← ${t('common.back')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global functions for actions
window.challengePlayer = async function(playerId) {
    const modal = document.createElement('div');
    modal.className = 'challenge-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 2rem; border-radius: 12px; max-width: 450px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); color: var(--text-primary);">
            <h3 style="margin-bottom: 1.5rem; color: var(--primary); text-align: center;">⚔️ ${t('challenge.title')}</h3>
            
            <!-- Quick Time Controls -->
            <div style="margin-bottom: 1.5rem;">
                <label style="font-weight: 600; display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">${t('challenge.quickTime')}:</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <button class="btn btn-outline-primary time-preset" data-minutes="1" data-increment="0" onclick="selectTimePreset(this, 1, 0)">⚡ Bullet 1+0</button>
                    <button class="btn btn-outline-primary time-preset" data-minutes="3" data-increment="0" onclick="selectTimePreset(this, 3, 0)">⚡ Blitz 3+0</button>
                    <button class="btn btn-outline-primary time-preset" data-minutes="5" data-increment="3" onclick="selectTimePreset(this, 5, 3)">⚡ Blitz 5+3</button>
                    <button class="btn btn-outline-primary time-preset" data-minutes="10" data-increment="0" onclick="selectTimePreset(this, 10, 0)">🎯 Rapid 10+0</button>
                    <button class="btn btn-outline-primary time-preset" data-minutes="15" data-increment="10" onclick="selectTimePreset(this, 15, 10)">🎯 Rapid 15+10</button>
                    <button class="btn btn-outline-primary time-preset" data-minutes="30" data-increment="0" onclick="selectTimePreset(this, 30, 0)">📖 Classical 30+0</button>
                </div>
            </div>
            
            <!-- Custom Time Controls -->
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-color);">
                <label style="font-weight: 600; display: block; margin-bottom: 0.75rem; color: var(--text-primary);">${t('challenge.customTime')}:</label>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.85rem; color: var(--text-secondary);">${t('challenge.minutesPerPlayer')}</label>
                        <input type="number" id="challenge-minutes" min="1" max="180" value="10" 
                               style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; font-size: 1rem; background: var(--bg-primary); color: var(--text-primary);"
                               onchange="updateTimePresets()">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 0.85rem; color: var(--text-secondary);">${t('challenge.increment')}</label>
                        <input type="number" id="challenge-increment" min="0" max="60" value="0"
                               style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; font-size: 1rem; background: var(--bg-primary); color: var(--text-primary);"
                               onchange="updateTimePresets()">
                    </div>
                </div>
            </div>
            
            <!-- Color Selection -->
            <div style="margin-bottom: 1.5rem;">
                <label style="font-weight: 600; display: block; margin-bottom: 0.75rem; color: var(--text-secondary); font-size: 0.9rem;">${t('challenge.chooseColor')}:</label>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="btn color-choice active" id="color-random" onclick="selectColor('random')" 
                            style="flex: 1; padding: 1rem; display: flex; flex-direction: column; align-items: center; background: var(--bg-secondary); border: 2px solid var(--border-color); color: var(--text-primary);">
                        <span style="font-size: 1.5rem;">🎲</span>
                        <span style="font-size: 0.85rem;">${t('challenge.random')}</span>
                    </button>
                    <button class="btn color-choice" id="color-white" onclick="selectColor('white')"
                            style="flex: 1; padding: 1rem; display: flex; flex-direction: column; align-items: center; background: #f0f0f0; border: 2px solid var(--border-color); color: #333;">
                        <span style="font-size: 1.5rem;">♔</span>
                        <span style="font-size: 0.85rem;">${t('challenge.white')}</span>
                    </button>
                    <button class="btn color-choice" id="color-black" onclick="selectColor('black')"
                            style="flex: 1; padding: 1rem; display: flex; flex-direction: column; align-items: center; background: #333; color: #f0f0f0; border: 2px solid #222;">
                        <span style="font-size: 1.5rem;">♚</span>
                        <span style="font-size: 0.85rem;">${t('challenge.black')}</span>
                    </button>
                </div>
            </div>
            
            <input type="hidden" id="challenge-color" value="random">
            <input type="hidden" id="challenge-player-id" value="${playerId}">
            
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="hideModal()" style="flex: 1;">
                    ${t('challenge.cancel')}
                </button>
                <button class="btn btn-success" onclick="sendChallengeCustom()" style="flex: 1;">
                    ⚔️ ${t('challenge.send')}
                </button>
            </div>
        </div>
    `;
        
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Select default preset
    setTimeout(() => selectTimePreset(document.querySelector('.time-preset[data-minutes="10"]'), 10, 0), 0);
};

// Time preset selection
window.selectTimePreset = function(btn, minutes, increment) {
    // Remove active from all presets
    document.querySelectorAll('.time-preset').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
    });
    
    // Add active to selected
    if (btn) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-primary');
    }
    
    // Update input fields
    document.getElementById('challenge-minutes').value = minutes;
    document.getElementById('challenge-increment').value = increment;
};

// Update presets when custom values change
window.updateTimePresets = function() {
    // Remove active from all presets (custom values selected)
    document.querySelectorAll('.time-preset').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
    });
};

// Color selection
window.selectColor = function(color) {
    document.querySelectorAll('.color-choice').forEach(b => b.classList.remove('active'));
    document.getElementById(`color-${color}`).classList.add('active');
    document.getElementById('challenge-color').value = color;
    
    // Update button styles
    document.querySelectorAll('.color-choice').forEach(b => {
        if (b.id === `color-${color}`) {
            b.style.boxShadow = '0 0 0 3px var(--primary)';
            b.style.transform = 'scale(1.05)';
        } else {
            b.style.boxShadow = 'none';
            b.style.transform = 'scale(1)';
        }
    });
};

// Send custom challenge
window.sendChallengeCustom = async function() {
    const playerId = document.getElementById('challenge-player-id').value;
    const minutes = parseInt(document.getElementById('challenge-minutes').value) || 10;
    const increment = parseInt(document.getElementById('challenge-increment').value) || 0;
    const color = document.getElementById('challenge-color').value;
    
    // Determine time control type
    let timeControlType = 'rapid';
    if (minutes < 3) timeControlType = 'bullet';
    else if (minutes < 10) timeControlType = 'blitz';
    else if (minutes >= 60) timeControlType = 'classical';
    
    try {
        const response = await playerAPI.challengePlayer(playerId, timeControlType, minutes, increment, color);
        
        if (response.success) {
            showToast(response.message || t('challenge.sent'), 'success');
            hideModal();
        } else {
            showToast(response.error || t('challenge.sendError'), 'error');
        }
    } catch (error) {
        console.error('Challenge error:', error);
        showToast(error.message || t('challenge.sendError'), 'error');
    }
};

// Hide modal function
window.hideModal = function() {
    const modal = document.querySelector('.challenge-modal');
    if (modal) modal.remove();
};

window.addFriend = async function(playerId) {
    const btn = document.getElementById('friend-btn');
    if (!btn) return;
    
    const textSpan = btn.querySelector('.btn-text');
    const originalText = textSpan?.textContent;
    
    try {
        btn.disabled = true;
        if (textSpan) textSpan.textContent = `⏳ ${t('challenge.sending')}`;
        
        const response = await friendsAPI.addFriend(playerId);
        
        if (response.success) {
            showToast(response.message || t('playerProfile.requestSent'), 'success');
            // Update button based on new status
            checkAndUpdateFriendButton(playerId);
        } else {
            showToast(response.error || t('common.error'), 'error');
            if (textSpan) textSpan.textContent = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Add friend error:', error);
        showToast(error.message || t('playerProfile.requestError'), 'error');
        if (textSpan) textSpan.textContent = originalText;
        btn.disabled = false;
    }
};

// Check friendship status and update button
async function checkAndUpdateFriendButton(playerId) {
    const btn = document.getElementById('friend-btn');
    if (!btn) return;
    
    try {
        const response = await friendsAPI.checkFriendship(playerId);
        
        if (response.success) {
            const textSpan = btn.querySelector('.btn-text') || btn;
            
            switch(response.status) {
                case 'accepted':
                    textSpan.textContent = `✅ ${t('playerProfile.friends')}`;
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-success');
                    btn.onclick = () => confirmRemoveFriend(playerId);
                    btn.disabled = false;
                    break;
                case 'pending':
                    if (response.is_sender) {
                        textSpan.textContent = `⏳ ${t('playerProfile.requestPending')}`;
                        btn.disabled = true;
                    } else {
                        textSpan.textContent = `✅ ${t('playerProfile.acceptRequest')}`;
                        btn.classList.remove('btn-secondary');
                        btn.classList.add('btn-success');
                        btn.onclick = () => respondToFriendRequest(response.friendship_id, 'accept');
                        btn.disabled = false;
                    }
                    break;
                case 'declined':
                case 'none':
                default:
                    textSpan.textContent = `➕ ${t('playerProfile.addFriend')}`;
                    btn.onclick = () => addFriend(playerId);
                    btn.disabled = false;
                    break;
            }
        }
    } catch (error) {
        console.error('Check friendship error:', error);
    }
}

// Confirm removing friend
window.confirmRemoveFriend = function(playerId) {
    if (confirm(t('playerProfile.removeFriendConfirm'))) {
        removeFriend(playerId);
    }
};

// Remove friend
window.removeFriend = async function(playerId) {
    try {
        showLoading();
        const response = await friendsAPI.removeFriend(playerId);
        hideLoading();
        
        if (response.success) {
            showToast(t('playerProfile.friendRemoved'), 'success');
            checkAndUpdateFriendButton(playerId);
        } else {
            showToast(response.error || t('common.error'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('common.error'), 'error');
    }
};

// Respond to friend request
window.respondToFriendRequest = async function(friendshipId, action) {
    try {
        showLoading();
        const response = await friendsAPI.respondToRequest(friendshipId, action);
        hideLoading();
        
        if (response.success) {
            showToast(response.message || t('common.success'), 'success');
            // Refresh the page to update UI
            location.reload();
        } else {
            showToast(response.error || t('common.error'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('common.error'), 'error');
    }
};

// Actually send the challenge
window.sendChallenge = async function(playerId, timeControl) {
    // Close modal first
    hideModal();
    
    try {
        showLoading();
        const response = await playerAPI.challengePlayer(playerId, timeControl);
        hideLoading();
        
        if (response.success) {
            showToast(t('challenge.sentNotification'), 'success');
            // Stay on current page - don't navigate anywhere
        } else {
            showToast(response.error || t('challenge.sendError'), 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Challenge error:', error);
        showToast(error.message || t('challenge.sendError'), 'error');
    }
};

// Register route
import routerInstance from '../router.js';
routerInstance.register('/player/:id', renderPlayerProfile, true);

