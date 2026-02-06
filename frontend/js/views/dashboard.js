// Dashboard View
import auth from '../auth.js';
import router from '../router.js';
import { tournamentAPI } from '../api.js';
import { showToast, showLoading, hideLoading, formatDate, formatTournamentType, renderEmptyState } from '../utils.js';

// Helper function for translations
const t = (key) => window.t ? window.t(key) : key;

export async function renderDashboard() {
    if (!auth.requireAuth()) return;
    
    const user = auth.getUser();
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>👋 ${t('dashboard.welcome')}, ${user.username}!</h2>
                    <p>${t('dashboard.subtitle')}</p>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-success" id="create-tournament-btn">
                        ➕ ${t('dashboard.createTournament')}
                    </button>
                    <button class="btn btn-primary" id="join-tournament-btn">
                        🔑 ${t('dashboard.joinTournament')}
                    </button>
                    <button class="btn btn-secondary" id="refresh-btn">
                        🔄 ${t('dashboard.refresh')}
                    </button>
                </div>
            </div>
            
            <!-- All Active Tournaments -->
            <div class="card">
                <div class="card-header">
                    <h2>${t('dashboard.activeTournaments')}</h2>
                </div>
                <div id="all-tournaments-list">
                    <div class="text-center" style="padding: 2rem;">
                        <div class="spinner"></div>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">${t('dashboard.loadingTournaments')}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Button handlers
    document.getElementById('create-tournament-btn').addEventListener('click', () => {
        router.navigate('/create-tournament');
    });
    
    document.getElementById('join-tournament-btn').addEventListener('click', () => {
        router.navigate('/join-tournament');
    });
    
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadTournaments();
    });
    
    // Load tournaments
    loadTournaments();
}

async function loadTournaments() {
    const allTournamentsList = document.getElementById('all-tournaments-list');
    
    try {
        // Load all tournaments
        const allResponse = await tournamentAPI.getAll();
        if (allResponse.success) {
            renderTournamentList(allTournamentsList, allResponse.tournaments, false);
        }
    } catch (error) {
        showToast(t('dashboard.errorLoading'), 'error');
        allTournamentsList.innerHTML = `<p class="text-center" style="color: var(--text-secondary);">${t('dashboard.errorLoading')}</p>`;
    }
}

function renderTournamentList(container, tournaments, isMyTournaments = false) {
    if (!tournaments || tournaments.length === 0) {
        renderEmptyState(
            container,
            '🏆',
            t('dashboard.noTournaments'),
            isMyTournaments ? t('dashboard.createTournament') + '!' : t('dashboard.noTournamentsDesc'),
            isMyTournaments ? { text: t('dashboard.createTournament'), handler: 'window.location.hash="#/create-tournament"' } : null
        );
        return;
    }
    
    const currentUser = auth.getUser();
    
    const html = tournaments.map(tournament => {
        const statusClass = tournament.status === 'active' ? 'active' : 
                           tournament.status === 'completed' ? 'completed' : 'pending';
        const statusText = tournament.status === 'active' ? t('tournament.active') :
                          tournament.status === 'completed' ? t('tournament.completed') : t('tournament.pending');
        
        // Show join button for public tournaments user hasn't created
        const showJoinButton = !isMyTournaments && tournament.is_public && tournament.status !== 'completed';
        
        return `
            <div class="tournament-card" data-tournament-id="${tournament.id}" data-tournament-code="${tournament.tournament_code || ''}">
                <div class="tournament-header">
                    <div>
                        <h3>${tournament.name}</h3>
                        <span class="tournament-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="tournament-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span><strong>${t('tournament.type')}:</strong> ${formatTournamentType(tournament.tournament_type)}</span>
                    </div>
                    <div class="meta-item">
                        <span>👥</span>
                        <span><strong>${t('tournament.players')}:</strong> ${tournament.current_participants || 0}/${tournament.max_participants}</span>
                    </div>
                    <div class="meta-item">
                        <span>🕐</span>
                        <span><strong>${t('tournament.created')}:</strong> ${formatDate(tournament.created_at)}</span>
                    </div>
                    ${tournament.created_by ? `
                    <div class="meta-item">
                        <span>👤</span>
                        <span><strong>${t('tournament.creator')}:</strong> ${tournament.created_by}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="tournament-actions">
                    <button class="btn btn-primary view-tournament-btn">
                        ${t('tournament.details')}
                    </button>
                    ${showJoinButton ? `
                        <button class="btn btn-success join-public-btn">
                            ➕ ${t('tournament.join')}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `<div class="tournament-list">${html}</div>`;
    
    // Add event listeners
    container.querySelectorAll('.view-tournament-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.tournament-card');
            const tournamentId = card.dataset.tournamentId;
            console.log('Dashboard: Navigating to tournament', tournamentId);
            router.navigate(`/tournament/${tournamentId}`);
        });
    });
    
    // Add join button listeners for public tournaments
    container.querySelectorAll('.join-public-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const card = e.target.closest('.tournament-card');
            const tournamentCode = card.dataset.tournamentCode;
            
            if (!tournamentCode) {
                showToast(t('dashboard.noCode'), 'error');
                return;
            }
            
            try {
                showLoading();
                const response = await tournamentAPI.join(tournamentCode);
                hideLoading();
                
                if (response.success) {
                    showToast(t('dashboard.joinSuccess'), 'success');
                    loadTournaments(); // Refresh the list
                } else {
                    showToast(response.error || t('dashboard.joinError'), 'error');
                }
            } catch (error) {
                hideLoading();
                showToast(error.message || t('dashboard.joinError'), 'error');
            }
        });
    });
}

// Register route
import routerInstance from '../router.js';
routerInstance.register('/dashboard', renderDashboard, true);
routerInstance.register('/', renderDashboard, true);
