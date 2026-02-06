/**
 * UI Komponenta - Card komponenta
 * Kreira različite tipove kartice za prikaz podataka
 */

import { kreirajElement, dodajDijete, dodajListener } from '../utils/dom.js';
import { formatirajDatum, formatirajStatus, formatirajBrojIgraca } from '../utils/formatiranje.js';

/**
 * Kreira karticu za turnir
 * @param {Object} turnir - Podaci o turniru
 * @param {Function} onDetalji - Callback kad se klikne na karticu
 * @param {Function} onPridruzise - Callback za pridruživanje (opciono)
 * @returns {HTMLElement} - Card element
 */
export function karticaTurnira(turnir, onDetalji, onPridruzise = null) {
    const card = kreirajElement('div', { className: 'card tournament-card' });
    
    // Header
    const header = kreirajElement('div', { className: 'card-header' });
    const naslov = kreirajElement('h3', { className: 'card-title' }, turnir.naziv);
    const status = kreirajElement('span', { 
        className: `status-badge status-${turnir.status}` 
    }, formatirajStatus(turnir.status));
    
    dodajDijete(header, naslov);
    dodajDijete(header, status);
    
    // Body
    const body = kreirajElement('div', { className: 'card-body' });
    
    const info = [
        { ikona: '📅', tekst: `Početak: ${formatirajDatum(turnir.datum_pocetka)}` },
        { ikona: '👥', tekst: formatirajBrojIgraca(turnir.broj_igraca, turnir.max_igraca) },
        { ikona: '🏆', tekst: `Tip: ${turnir.tip_turnira}` }
    ];
    
    if (turnir.lokacija) {
        info.push({ ikona: '📍', tekst: turnir.lokacija });
    }
    
    info.forEach(({ ikona, tekst }) => {
        const infoClanica = kreirajElement('div', { className: 'info-item' });
        const ikonaElement = kreirajElement('span', { className: 'info-icon' }, ikona);
        const tekstElement = kreirajElement('span', { className: 'info-text' }, tekst);
        
        dodajDijete(infoClanica, ikonaElement);
        dodajDijete(infoClanica, tekstElement);
        dodajDijete(body, infoClanica);
    });
    
    // Footer
    const footer = kreirajElement('div', { className: 'card-footer' });
    
    const detaljButton = kreirajElement('button', {
        className: 'btn btn-secondary btn-sm',
        type: 'button'
    }, 'Detalji');
    
    dodajListener(detaljButton, 'click', (e) => {
        e.stopPropagation();
        onDetalji(turnir.id);
    });
    
    dodajDijete(footer, detaljButton);
    
    // Gumb za pridruživanje (ako je potreban)
    if (onPridruzise && turnir.status === 'predstojeci' && turnir.broj_igraca < turnir.max_igraca) {
        const pridruziButton = kreirajElement('button', {
            className: 'btn btn-primary btn-sm',
            type: 'button'
        }, 'Pridruži se');
        
        dodajListener(pridruziButton, 'click', (e) => {
            e.stopPropagation();
            onPridruzise(turnir.id);
        });
        
        dodajDijete(footer, pridruziButton);
    }
    
    // Sastavlja karticu
    dodajDijete(card, header);
    dodajDijete(card, body);
    dodajDijete(card, footer);
    
    // Cijela kartica je klikabilna
    dodajListener(card, 'click', () => onDetalji(turnir.id));
    
    return card;
}

/**
 * Kreira karticu za igrača
 * @param {Object} igrac - Podaci o igraču
 * @param {Function} onKlik - Callback kad se klikne
 * @returns {HTMLElement} - Card element
 */
export function karticaIgraca(igrac, onKlik = null) {
    const card = kreirajElement('div', { className: 'card player-card' });
    
    // Avatar/inicijali
    const avatar = kreirajElement('div', { className: 'player-avatar' }, 
        igrac.ime?.charAt(0) || igrac.korisnicko_ime?.charAt(0) || '?'
    );
    
    // Info
    const info = kreirajElement('div', { className: 'player-info' });
    const ime = kreirajElement('h4', { className: 'player-name' }, 
        igrac.ime || igrac.korisnicko_ime
    );
    
    dodajDijete(info, ime);
    
    if (igrac.email) {
        const email = kreirajElement('p', { className: 'player-email' }, igrac.email);
        dodajDijete(info, email);
    }
    
    if (igrac.elo_rating) {
        const elo = kreirajElement('p', { className: 'player-elo' }, `ELO: ${igrac.elo_rating}`);
        dodajDijete(info, elo);
    }
    
    dodajDijete(card, avatar);
    dodajDijete(card, info);
    
    if (onKlik) {
        dodajListener(card, 'click', () => onKlik(igrac));
    }
    
    return card;
}

/**
 * Kreira praznu karticu (placeholder)
 * @param {string} poruka - Poruka za prikaz
 * @param {string} ikona - Ikona (opciono)
 * @returns {HTMLElement} - Card element
 */
export function praznaKartica(poruka, ikona = '📝') {
    const card = kreirajElement('div', { className: 'card empty-card' });
    
    const ikonaElement = kreirajElement('div', { className: 'empty-icon' }, ikona);
    const tekst = kreirajElement('p', { className: 'empty-message' }, poruka);
    
    dodajDijete(card, ikonaElement);
    dodajDijete(card, tekst);
    
    return card;
}

/**
 * Kreira loading karticu
 * @returns {HTMLElement} - Card element sa loading animacijom
 */
export function loadingKartica() {
    const card = kreirajElement('div', { className: 'card loading-card' });
    
    const spinner = kreirajElement('div', { className: 'loading-spinner-small' });
    for (let i = 0; i < 3; i++) {
        const dot = kreirajElement('div', { className: 'loading-dot' });
        dodajDijete(spinner, dot);
    }
    
    const tekst = kreirajElement('p', {}, 'Učitavanje...');
    
    dodajDijete(card, spinner);
    dodajDijete(card, tekst);
    
    return card;
}

/**
 * Kreira grid kontejner za kartice
 * @param {Array<HTMLElement>} kartice - Array kartica
 * @param {string} klasa - Dodatna CSS klasa (opciono)
 * @returns {HTMLElement} - Grid kontejner
 */
export function gridKartica(kartice, klasa = '') {
    const grid = kreirajElement('div', { 
        className: `cards-grid ${klasa}` 
    });
    
    kartice.forEach(kartica => dodajDijete(grid, kartica));
    
    return grid;
}

export default {
    karticaTurnira,
    karticaIgraca,
    praznaKartica,
    loadingKartica,
    gridKartica
};
