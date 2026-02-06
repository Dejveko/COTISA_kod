// Utility Functions

// Show toast notification
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Force dark text color with inline styles
    toast.style.cssText = 'background: #ffffff !important; color: #2c3e50 !important; border: 1px solid #e2e8f0 !important;';
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    
    toast.innerHTML = `
        <span class="toast-icon" style="color: #2c3e50 !important;">${icon}</span>
        <span class="toast-message" style="color: #2c3e50 !important;">${message}</span>
        <span class="toast-close" style="color: #718096 !important;">&times;</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    const timeoutId = setTimeout(() => {
        toast.remove();
    }, 5000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeoutId);
        toast.remove();
    });
}

// Show loading spinner
export function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

// Hide loading spinner
export function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Format date
export function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format tournament type
export function formatTournamentType(type) {
    if (typeof window.t === 'function') {
        const types = {
            'elimination': window.t('tournament.elimination'),
            'round_robin': window.t('tournament.roundRobin')
        };
        return types[type] || type;
    }
    const types = {
        'elimination': 'Eliminacija',
        'round_robin': 'Svi protiv svih'
    };
    return types[type] || type;
}

// Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Kopirano u međuspremnik!', 'success');
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('Kopirano u međuspremnik!', 'success');
            return true;
        } catch (err) {
            showToast('Greška pri kopiranju', 'error');
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate 6-digit code
export function isValidCode(code) {
    return /^\d{6}$/.test(code);
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get tournament status badge HTML
export function getStatusBadge(status) {
    const statusMap = {
        'pending': 'pending',
        'active': 'active',
        'completed': 'completed'
    };
    const statusText = {
        'pending': 'Na čekanju',
        'active': 'Aktivan',
        'completed': 'Završen'
    };
    
    return `<span class="tournament-status ${statusMap[status] || 'pending'}">${statusText[status] || status}</span>`;
}

// Render empty state
export function renderEmptyState(container, icon, title, subtitle, action = null) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${subtitle}</p>
            ${action ? `<button class="btn btn-primary mt-2" onclick="${action.handler}">${action.text}</button>` : ''}
        </div>
    `;
}

// Create modal
export function createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const actionsHTML = actions.map(action => 
        `<button class="btn ${action.class || 'btn-primary'}" data-action="${action.id}">${action.text}</button>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
                    ${actionsHTML}
                </div>
            ` : ''}
        </div>
    `;
    
    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Action buttons
    actions.forEach(action => {
        const btn = modal.querySelector(`[data-action="${action.id}"]`);
        if (btn) {
            btn.addEventListener('click', () => {
                action.handler();
                if (action.closeOnClick !== false) {
                    modal.remove();
                }
            });
        }
    });
    
    document.body.appendChild(modal);
    
    return modal;
}

// Confirm dialog
export function confirm(message, onConfirm) {
    createModal(
        'Potvrda',
        `<p>${message}</p>`,
        [
            {
                id: 'cancel',
                text: 'Odustani',
                class: 'btn-secondary',
                handler: () => {}
            },
            {
                id: 'confirm',
                text: 'Potvrdi',
                class: 'btn-primary',
                handler: onConfirm
            }
        ]
    );
}

// Format player count
export function formatPlayerCount(current, max) {
    return `${current}/${max} igrača`;
}

// Get match result display
export function getMatchResultDisplay(match) {
    if (!match.winner_id) {
        return '<span class="match-pending">U tijeku</span>';
    }
    
    const player1Class = match.winner_id === match.player1_id ? 'winner' : '';
    const player2Class = match.winner_id === match.player2_id ? 'winner' : '';
    
    return `
        <div class="match-result">
            <div class="match-player ${player1Class}">${match.player1_name}</div>
            <div class="match-vs">vs</div>
            <div class="match-player ${player2Class}">${match.player2_name}</div>
        </div>
    `;
}

// Calculate tournament progress percentage
export function calculateProgress(completedMatches, totalMatches) {
    if (totalMatches === 0) return 0;
    return Math.round((completedMatches / totalMatches) * 100);
}

// Get progress bar HTML
export function getProgressBar(percentage) {
    return `
        <div class="progress-bar" style="background: var(--gray-light); border-radius: 10px; height: 10px; overflow: hidden;">
            <div class="progress-fill" style="background: var(--success); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
        </div>
        <div class="progress-text" style="text-align: center; margin-top: 0.5rem; color: var(--text-secondary);">
            ${percentage}% završeno
        </div>
    `;
}

// Format player name with provisional indicator
export function formatPlayerName(player, isProvisional = null) {
    // Handle if player is a string (just a name)
    if (typeof player === 'string') {
        const name = player;
        if (isProvisional) {
            return `<span style="color: #FFD700; font-weight: bold;">●</span> ${name}`;
        }
        return name;
    }
    
    // Handle if player is an object
    const name = player.username || player.name || 'Unknown';
    const provisional = isProvisional !== null ? isProvisional : player.is_provisional;
    
    if (provisional) {
        return `<span style="color: #FFD700; font-weight: bold;">●</span> ${name}`;
    }
    
    return name;
}

// Export all utilities as default
export default {
    showToast,
    showLoading,
    hideLoading,
    formatDate,
    formatTournamentType,
    copyToClipboard,
    isValidEmail,
    isValidCode,
    debounce,
    getStatusBadge,
    renderEmptyState,
    createModal,
    confirm,
    formatPlayerCount,
    getMatchResultDisplay,
    calculateProgress,
    getProgressBar,
    formatPlayerName
};
