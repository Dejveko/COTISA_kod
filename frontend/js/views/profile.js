// Profile View
import auth from '../auth.js';
import router from '../router.js';
import { playerAPI, friendsAPI, tournamentAPI, getMediaUrl } from '../api.js';
import { showToast, showLoading, hideLoading, formatDate, formatTournamentType, renderEmptyState } from '../utils.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

// Default chess piece avatar - as a global constant for safe use in inline handlers
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23667eea%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2250%22 text-anchor=%22middle%22 fill=%22white%22%3E%E2%99%94%3C/text%3E%3C/svg%3E';

// Make it globally available for onerror handlers
window.DEFAULT_AVATAR = DEFAULT_AVATAR;

function getDefaultAvatar() {
    return DEFAULT_AVATAR;
}

export async function renderProfile() {
    if (!auth.requireAuth()) return;
    
    // Refresh user data from server (to get updated profile picture, etc.)
    let user = auth.getUser();
    try {
        const response = await playerAPI.getMyProfile();
        if (response.user) {
            // Update stored user with fresh data (preserve auth token)
            // Force overwrite profile_picture to ensure latest is used
            const updatedUser = { ...user, ...response.user };
            auth.updateUser(updatedUser);
            // Use the updated user for rendering
            user = updatedUser;
        }
    } catch (e) {
        console.log('Could not refresh user profile:', e);
    }
    const app = document.getElementById('app');
    
    // Check if mobile
    const isMobile = window.innerWidth <= 576;
    
    app.innerHTML = `
        <div class="container" style="max-width: 1000px; padding: ${isMobile ? '12px' : '20px'};">
            <!-- Profile Header -->
            <div class="profile-header" style="padding: ${isMobile ? '20px 16px' : '2rem'}; margin-bottom: ${isMobile ? '16px' : '1.5rem'}; text-align: center;">
                <div class="profile-avatar" style="width: ${isMobile ? '80px' : '100px'}; height: ${isMobile ? '80px' : '100px'}; margin: 0 auto 1rem; border-radius: 50%; overflow: hidden;">
                    ${user.profile_picture ? 
                        `<img src="${getMediaUrl(user.profile_picture)}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src=window.DEFAULT_AVATAR">` :
                        `<img src="${DEFAULT_AVATAR}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover;">`
                    }
                </div>
                <h1 style="font-size: ${isMobile ? '1.5rem' : '1.75rem'}; margin-bottom: 0.25rem; color: white !important;">
                    ${user.active_title ? `<span style="color: ${user.active_title.color};">${user.active_title.icon || '🏅'}</span> ` : ''}
                    ${user.username}
                    ${user.role === 'admin' ? ' <span style="color: gold;">👑</span>' : ''}
                </h1>
                ${user.active_title ? `<p style="color: ${user.active_title.color}; font-weight: 600; margin: 0.25rem 0;">${user.active_title.name}</p>` : ''}
                <p style="color: rgba(255,255,255,0.9) !important; font-size: ${isMobile ? '0.85rem' : '0.9rem'};">${user.email}</p>
                ${user.is_provisional ? `
                    <div style="background: rgba(255, 215, 0, 0.2); border: 1px solid #FFD700; padding: 0.4rem 0.8rem; border-radius: 20px; margin-top: 0.5rem; display: inline-block;">
                        <small style="color: #FFD700; font-weight: 600;">🌱 ${t('profile.provisional')} (${user.matches_played || 0}/5 ${t('profile.matchesPlayed')})</small>
                    </div>
                ` : ''}
            </div>
            
            <!-- Main Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(${isMobile ? '2' : '4'}, 1fr); gap: ${isMobile ? '8px' : '1rem'}; margin-bottom: ${isMobile ? '16px' : '1.5rem'};">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${user.elo_rating || 800}</div>
                    <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('profile.generalElo')}</div>
                </div>
                <div style="background: linear-gradient(135deg, #11998e, #38ef7d); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${user.wins || 0}</div>
                    <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('players.wins')}</div>
                </div>
                <div style="background: linear-gradient(135deg, #eb3349, #f45c43); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${user.losses || 0}</div>
                    <div style="font-size: ${isMobile ? '0.7rem' : '0.85rem'}; opacity: 0.9;">${t('players.losses')}</div>
                </div>
                <div style="background: linear-gradient(135deg, #606c88, #3f4c6b); padding: ${isMobile ? '12px' : '1.5rem'}; border-radius: 12px; text-align: center; color: white;">
                    <div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; font-weight: 700;">${user.draws || 0}</div>
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
                        <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${user.elo_bullet || 800}</div>
                    </div>
                    <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'}; ${isMobile ? 'border-bottom: 1px solid var(--border-color);' : 'border-right: 1px solid var(--border-color);'}">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span>🔥</span> Blitz
                        </div>
                        <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${user.elo_blitz || 800}</div>
                    </div>
                    <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'}; ${isMobile ? '' : 'border-right: 1px solid var(--border-color);'}">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span>⏱️</span> Rapid
                        </div>
                        <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${user.elo_rapid || 800}</div>
                    </div>
                    <div style="padding: ${isMobile ? '12px' : '1rem 1.25rem'};">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">
                            <span>📅</span> Daily
                        </div>
                        <div style="font-size: ${isMobile ? '1.1rem' : '1.25rem'}; font-weight: 700; color: var(--text-primary);">${user.elo_daily || 800}</div>
                    </div>
                </div>
            </div>
            
            <!-- Dva stupca na desktopu, jedan na mobitelu -->
            <div style="display: grid; grid-template-columns: ${isMobile ? '1fr' : '2fr 1fr'}; gap: ${isMobile ? '16px' : '1.5rem'}; margin-bottom: ${isMobile ? '16px' : '1.5rem'};">
                <!-- Profile Info -->
                <div class="card" style="${isMobile ? 'order: 2;' : ''}">
                    <div class="card-header" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                        <h2 style="font-size: 1.1rem; margin: 0;">📋 ${t('profile.data')}</h2>
                    </div>
                    <div style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="color: var(--text-secondary);">${t('profile.username')}</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${user.username}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); ${isMobile ? 'flex-wrap: wrap; gap: 4px;' : ''}">
                                <span style="color: var(--text-secondary);">${t('profile.email')}</span>
                                <span style="font-weight: 600; color: var(--text-primary); ${isMobile ? 'font-size: 0.85rem; word-break: break-all;' : ''}">${user.email}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="color: var(--text-secondary);">${t('profile.role')}</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${user.role === 'admin' ? '👑 ' + t('profile.admin') : '♟️ ' + t('profile.player')}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="color: var(--text-secondary);">${t('profile.totalMatches')}</span>
                                <span style="font-weight: 600; color: var(--text-primary);">${user.total_matches || 0}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span style="color: var(--text-secondary);">${t('profile.winRate')}</span>
                                <span style="font-weight: 600; color: var(--success);">${user.total_matches > 0 ? Math.round((user.wins / user.total_matches) * 100) : 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Brze akcije -->
                <div class="card" style="${isMobile ? 'order: 1;' : ''}">
                    <div class="card-header" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                        <h2 style="font-size: 1.1rem; margin: 0;">⚡ ${t('profile.actions')}</h2>
                    </div>
                    <div style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'}; display: flex; flex-direction: column; gap: 0.75rem;">
                        <input type="file" id="profile-picture-input" accept="image/*" style="display: none;">
                        <button class="btn btn-primary" style="width: 100%;" onclick="document.getElementById('profile-picture-input').click()">
                            📷 ${t('profile.changePhoto')}
                        </button>
                        <button class="btn btn-secondary" style="width: 100%;" onclick="window.location.hash='#/dashboard'">
                            🏠 Dashboard
                        </button>
                        <button class="btn btn-danger" style="width: 100%;" id="logout-profile-btn">
                            🚪 ${t('profile.logout')}
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Titule -->
            <div class="card" style="margin-bottom: ${isMobile ? '16px' : '1.5rem'};">
                <div class="card-header" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                    <h2 style="font-size: 1.1rem; margin: 0;">🏅 ${t('profile.titles')}</h2>
                </div>
                <div id="titles-container" style="padding: ${isMobile ? '12px 16px' : '1rem 1.5rem'};">
                    <div class="text-center" style="padding: 1rem;">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
            
            <!-- Dva stupca: Turniri i Prijatelji -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <!-- Moji turniri -->
                <div class="card">
                    <div class="card-header" style="padding: 1rem 1.5rem;">
                        <h2 style="font-size: 1.1rem; margin: 0;">🏆 ${t('profile.tournaments')}</h2>
                    </div>
                    <div id="my-tournaments-container" style="padding: 1rem 1.5rem; max-height: 400px; overflow-y: auto;">
                        <div class="text-center" style="padding: 1rem;">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Moji prijatelji -->
                <div class="card">
                    <div class="card-header" style="padding: 1rem 1.5rem;">
                        <h2 style="font-size: 1.1rem; margin: 0;">👥 ${t('profile.friends')}</h2>
                    </div>
                    <div id="friends-container" style="padding: 1rem 1.5rem; max-height: 400px; overflow-y: auto;">
                        <div class="text-center" style="padding: 1rem;">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Zahtjevi za prijateljstvo -->
            <div class="card" id="friend-requests-card" style="margin-bottom: 1.5rem; display: none;">
                <div class="card-header" style="padding: 1rem 1.5rem;">
                    <h2 style="font-size: 1.1rem; margin: 0;">📬 ${t('profile.friendRequests')}</h2>
                </div>
                <div id="friend-requests-container" style="padding: 1rem 1.5rem;">
                    <div class="text-center" style="padding: 1rem;">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
            
            <!-- Povijest turnira -->
            <div class="card">
                <div class="card-header" style="padding: 1rem 1.5rem;">
                    <h2 style="font-size: 1.1rem; margin: 0;">📜 ${t('profile.history')}</h2>
                </div>
                <div id="history-container" style="padding: 1rem 1.5rem;">
                    <div class="text-center" style="padding: 1rem;">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Logout button
    document.getElementById('logout-profile-btn').addEventListener('click', () => {
        auth.logout();
    });
    
    // Load history
    loadHistory();
    
    // Load titles
    loadTitles();
    
    // Load friends
    loadFriends();
    
    // Load friend requests
    loadFriendRequests();
    
    // Load my tournaments
    loadMyTournaments();
    
    // Profile picture upload handler
    document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureUpload);
}

async function loadStatistics() {
    const container = document.getElementById('stats-container');
    
    try {
        const response = await playerAPI.getStats();
        
        if (response.success && response.stats) {
            const stats = response.stats;
            
            container.innerHTML = `
                <div class="dashboard-grid">
                    <div class="stat-card" style="background: linear-gradient(135deg, #3498db, #2980b9);">
                        <h3>${stats.tournaments_played || 0}</h3>
                        <p>${t('profile.tournamentsPlayed')}</p>
                    </div>
                    
                    <div class="stat-card" style="background: linear-gradient(135deg, #27ae60, #229954);">
                        <h3>${stats.tournaments_won || 0}</h3>
                        <p>${t('profile.wins')}</p>
                    </div>
                    
                    <div class="stat-card" style="background: linear-gradient(135deg, #f39c12, #e67e22);">
                        <h3>${stats.tournaments_created || 0}</h3>
                        <p>${t('profile.tournamentsCreated')}</p>
                    </div>
                    
                    <div class="stat-card" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">
                        <h3>${stats.matches_won || 0}/${stats.matches_played || 0}</h3>
                        <p>${t('profile.matchesLabel')}</p>
                    </div>
                </div>
                
                ${stats.win_rate !== undefined ? `
                    <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-secondary); border-radius: var(--border-radius); text-align: center;">
                        <h3 style="color: var(--primary);">${t('profile.winPercentage')}</h3>
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--success); margin: 1rem 0;">
                            ${Math.round(stats.win_rate)}%
                        </div>
                        <div class="progress-bar" style="background: var(--gray-light); border-radius: 10px; height: 10px; overflow: hidden;">
                            <div style="background: var(--success); height: 100%; width: ${stats.win_rate}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                ` : ''}
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>${t('profile.noStats')}</h3>
                    <p>${t('profile.noStatsDesc')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>${t('profile.statsUnavailable')}</h3>
                <p>${t('profile.statsUnavailableDesc')}</p>
            </div>
        `;
    }
}

async function loadHistory() {
    const container = document.getElementById('history-container');
    
    try {
        const response = await playerAPI.getHistory();
        
        if (response.success && response.history && response.history.length > 0) {
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${response.history.slice(0, 5).map(tournament => {
                        const statusColor = tournament.status === 'completed' ? '#27ae60' : 
                                           tournament.status === 'in_progress' ? '#f39c12' : '#667eea';
                        const placement = tournament.your_position;
                        const placementEmoji = placement === 1 ? '🥇' : placement === 2 ? '🥈' : placement === 3 ? '🥉' : '';
                        
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; cursor: pointer;" onclick="window.location.hash='#/tournament/${tournament.id}'">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <span style="font-size: 1.5rem;">${placementEmoji || '🏆'}</span>
                                    <div>
                                        <div style="font-weight: 600; color: var(--text-primary);">${tournament.name}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${formatDate(tournament.created_at)}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    ${placement ? `<div style="font-weight: 600; color: ${placement <= 3 ? '#FFD700' : 'var(--text-primary)'};">${placement}. ${t('tournament.place')}</div>` : ''}
                                    <div style="font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: ${statusColor}; color: white;">
                                        ${tournament.status === 'completed' ? t('tournament.completed') : tournament.status === 'in_progress' ? t('tournament.inProgress') : t('tournament.waiting')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${response.history.length > 5 ? `
                    <div style="text-align: center; margin-top: 1rem;">
                        <button class="btn btn-secondary btn-sm">${t('common.showAll')} (${response.history.length})</button>
                    </div>
                ` : ''}
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📜</div>
                    <p>${t('profile.noHistory')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading history:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📜</div>
                <p>Povijest trenutno nije dostupna</p>
            </div>
        `;
    }
}

// Profile picture upload handler
async function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
        showToast(t('profile.imageTooLarge'), 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast(t('profile.pleaseSelectImage'), 'error');
        return;
    }
    
    try {
        showLoading();
        const response = await playerAPI.uploadProfilePicture(file);
        hideLoading();
        
        if (response.success) {
            showToast(t('profile.pictureUploaded'), 'success');
            
            // Update localStorage with new profile picture URL immediately
            // Backend returns picture_url
            const newPictureUrl = response.picture_url;
            if (newPictureUrl) {
                const currentUser = auth.getUser();
                // Add cache buster to force reload
                const pictureWithCacheBuster = newPictureUrl + '?t=' + Date.now();
                auth.updateUser({ ...currentUser, profile_picture: pictureWithCacheBuster });
            }
            
            // Re-render profile page to show new picture
            setTimeout(() => renderProfile(), 500);
        } else {
            showToast(response.error || t('profile.pictureUploadError'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('profile.pictureUploadError'), 'error');
    }
}
// Load player titles
async function loadTitles() {
    const container = document.getElementById('titles-container');
    
    try {
        const user = auth.getUser();
        const response = await playerAPI.getTitles(user.id);
        
        if (response.success && response.titles.length > 0) {
            const titles = response.titles;
            
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem;">
                    ${titles.map(title => `
                        <div 
                            class="title-option ${title.is_active ? 'active' : ''}"
                            style="padding: 1rem; background: ${title.is_active ? `linear-gradient(135deg, ${title.color}22, ${title.color}44)` : 'var(--bg-secondary)'}; 
                                   border: 2px solid ${title.is_active ? title.color : 'var(--border-color)'}; 
                                   border-radius: 10px; cursor: pointer; text-align: center; transition: all 0.2s;"
                            onclick="setActiveTitle(${title.id})"
                        >
                            <div style="font-size: 1.75rem;">${title.icon || '🏅'}</div>
                            <div style="font-weight: 600; color: ${title.color}; margin-top: 0.25rem; text-shadow: 0 0 3px rgba(0,0,0,0.3), 1px 1px 2px rgba(0,0,0,0.2);">${title.name}</div>
                            ${title.is_active ? `<div style="font-size: 0.7rem; color: var(--success); margin-top: 0.25rem;">✓ ${t('profile.active')}</div>` : ''}
                        </div>
                    `).join('')}
                    <div 
                        class="title-option ${!titles.some(t => t.is_active) ? 'active' : ''}"
                        style="padding: 1rem; background: ${!titles.some(t => t.is_active) ? 'rgba(102, 126, 234, 0.1)' : 'var(--bg-secondary)'}; 
                               border: 2px solid ${!titles.some(t => t.is_active) ? 'var(--primary)' : 'transparent'}; 
                               border-radius: 10px; cursor: pointer; text-align: center; transition: all 0.2s;"
                        onclick="clearActiveTitle()"
                    >
                        <div style="font-size: 1.75rem;">🚫</div>
                        <div style="font-weight: 600; color: var(--text-secondary); margin-top: 0.25rem;">${t('profile.noTitle')}</div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 1.5rem; color: var(--text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏅</div>
                    <p style="margin: 0; color: var(--text-secondary);">${t('profile.noTitles')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading titles:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--danger);">
                ${t('profile.titlesError')}
            </div>
        `;
    }
}

// Set active title
window.setActiveTitle = async function(titleId) {
    try {
        showLoading();
        const response = await playerAPI.setActiveTitle(titleId);
        hideLoading();
        
        if (response.success) {
            showToast(t('profile.titleSet'), 'success');
            // Reload titles to show updated UI
            loadTitles();
            // Reload the entire profile to update header
            setTimeout(() => {
                showProfile();
            }, 100);
        } else {
            showToast(response.error || t('common.error'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('profile.titleSetError'), 'error');
    };
};

// Clear active title
window.clearActiveTitle = async function() {
    try {
        showLoading();
        const response = await playerAPI.setActiveTitle(null);
        hideLoading();
        
        if (response.success) {
            showToast(t('profile.titleRemoved'), 'success');
            // Reload titles to show updated UI
            loadTitles();
            // Reload the entire profile to update header
            setTimeout(() => {
                showProfile();
            }, 100);
        } else {
            showToast(response.error || t('common.error'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('common.error'), 'error');
    }
};

// Load friends list
async function loadFriends() {
    const container = document.getElementById('friends-container');
    
    try {
        const response = await friendsAPI.getFriends();
        
        if (response.success) {
            const friends = response.friends || [];
            
            if (friends.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; opacity: 0.6;">
                        <p style="margin: 0;">${t('profile.noFriends')}</p>
                        <small>${t('profile.addFriendsHint')}</small>
                    </div>
                `;
                return;
            }
            
            // Display friends as nice name plates
            const friendsHTML = friends.map(friend => {
                // Build proper image URL using helper
                let imgSrc = getDefaultAvatar();
                if (friend.profile_picture) {
                    imgSrc = getMediaUrl(friend.profile_picture);
                }
                
                return `
                    <div style="display: flex; align-items: center; padding: 0.75rem 1rem; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s;" 
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" 
                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
                         onclick="location.hash='#/player/${friend.id}'">
                        <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin-right: 0.75rem; border: 2px solid var(--primary); flex-shrink: 0;">
                            <img src="${imgSrc}" alt="${friend.username}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src=window.DEFAULT_AVATAR">
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">
                                ${friend.username}
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; color: white; margin-left: 0.5rem;">
                            ${friend.elo_rating || 800}
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = `${friendsHTML}`;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: var(--danger);">
                    ${response.error || t('profile.friendsError')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading friends:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--danger);">
                    ${t('profile.friendsError')}
            </div>
        `;
    }
}

// Load friend requests
async function loadFriendRequests() {
    const container = document.getElementById('friend-requests-container');
    const card = document.getElementById('friend-requests-card');
    
    try {
        const response = await friendsAPI.getRequests();
        
        if (response.success) {
            const received = response.received || [];
            
            if (received.length === 0) {
                // Hide the entire card if no requests
                if (card) card.style.display = 'none';
                return;
            }
            
            // Show card
            if (card) card.style.display = 'block';
            
            const requestsHTML = received.map(req => {
                const fromPlayer = req.from_player;
                const picture = fromPlayer.profile_picture ? 
                    `<img src="${getMediaUrl(fromPlayer.profile_picture)}" alt="${fromPlayer.username}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; margin-right: 1rem;" onerror="this.onerror=null;this.src=window.DEFAULT_AVATAR">` :
                    `<img src="${DEFAULT_AVATAR}" alt="${fromPlayer.username}" style="width: 45px; height: 45px; border-radius: 50%; margin-right: 1rem;">`;
                
                return `
                    <div style="display: flex; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 0.5rem;">
                        ${picture}
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${fromPlayer.username}</div>
                            <div style="font-size: 0.85rem; opacity: 0.7;">ELO: ${fromPlayer.elo_rating || 800}</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-success" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="acceptFriendRequest(${req.id})">
                                ✓ ${t('profile.accept')}
                            </button>
                            <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="declineFriendRequest(${req.id})">
                                ✕ ${t('profile.decline')}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = `
                <div style="margin-bottom: 0.5rem; opacity: 0.7; font-size: 0.9rem;">
                    ${received.length} ${t('profile.pendingRequests')}
                </div>
                ${requestsHTML}
            `;
        } else {
            if (card) card.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading friend requests:', error);
        if (card) card.style.display = 'none';
    }
}

// Accept friend request
window.acceptFriendRequest = async function(friendshipId) {
    try {
        showLoading();
        const response = await friendsAPI.respondToRequest(friendshipId, 'accept');
        hideLoading();
        
        if (response.success) {
            showToast(t('profile.friendAccepted'), 'success');
            // Reload both sections
            loadFriends();
            loadFriendRequests();
        } else {
            showToast(response.error || t('common.error'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('profile.acceptError'), 'error');
    }
};

// Decline friend request
window.declineFriendRequest = async function(friendshipId) {
    try {
        showLoading();
        const response = await friendsAPI.respondToRequest(friendshipId, 'decline');
        hideLoading();
        
        if (response.success) {
            showToast(t('profile.requestDeclined'), 'info');
            loadFriendRequests();
        } else {
            showToast(response.error || t('common.error'), 'error');
        }
    } catch (error) {
        hideLoading();
        showToast(error.message || t('profile.declineError'), 'error');
    }
};

// Load my tournaments
async function loadMyTournaments() {
    const container = document.getElementById('my-tournaments-container');
    
    try {
        const response = await tournamentAPI.getMy();
        
        if (response.success) {
            const tournaments = response.tournaments || [];
            
            if (tournaments.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        <p style="margin: 0; color: var(--text-secondary);">${t('profile.noTournaments')}</p>
                        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="window.location.hash='#/create-tournament'">
                            ➕ ${t('profile.createTournament')}
                        </button>
                    </div>
                `;
                return;
            }
            
            const tournamentsHTML = tournaments.slice(0, 10).map(t_item => {
                const statusClass = t_item.status === 'active' || t_item.status === 'in_progress' ? 'success' : 
                                   t_item.status === 'completed' ? 'gray' : 'warning';
                const statusText = t_item.status === 'active' ? t('tournament.active') :
                                  t_item.status === 'in_progress' ? t('tournament.inProgress') :
                                  t_item.status === 'completed' ? t('tournament.completed') : t('tournament.pending');
                
                return `
                    <div style="display: flex; align-items: center; padding: 0.75rem; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s;" 
                         onmouseover="this.style.background='var(--bg-tertiary)'" 
                         onmouseout="this.style.background='var(--bg-hover)'"
                         onclick="location.hash='#/tournament/${t_item.id}'">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--text-primary);">${t_item.name}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                ${formatTournamentType(t_item.tournament_type)} • ${t_item.current_participants || 0}/${t_item.max_participants} ${t('tournament.playersCount')}
                            </div>
                        </div>
                        <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: var(--${statusClass}); color: white;">
                            ${statusText}
                        </span>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = `
                <div style="margin-bottom: 0.5rem; opacity: 0.7; font-size: 0.9rem;">
                    ${tournaments.length} ${tournaments.length === 1 ? t('tournament.tournamentCountSingular') : t('tournament.tournamentCount')}
                </div>
                ${tournamentsHTML}
            `;
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: var(--danger);">
                    ${response.error || t('profile.tournamentsError')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading my tournaments:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--danger);">
                    ${t('profile.tournamentsError')}
            </div>
        `;
    }
}

// Register route
import routerInstance from '../router.js';
routerInstance.register('/profile', renderProfile, true);

