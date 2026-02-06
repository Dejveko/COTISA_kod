/**
 * UI Komponenta - Loading spinner
 * Prikazuje animaciju učitavanja
 */

import { dohvatiElement, prikazi, sakrij, kreirajElement, dodajDijete, ukloniElement } from '../utils/dom.js';

let loadingElement = null;
let loadingCount = 0;

/**
 * Inicijalizira loading spinner
 */
function inicijalizirajLoading() {
    if (loadingElement) return;
    
    // Kreira overlay
    const overlay = kreirajElement('div', { 
        id: 'loading-overlay',
        className: 'loading-overlay'
    });
    
    // Kreira spinner
    const spinner = kreirajElement('div', { className: 'loading-spinner' });
    
    // Kreira točkice
    for (let i = 0; i < 3; i++) {
        const dot = kreirajElement('div', { className: 'loading-dot' });
        dodajDijete(spinner, dot);
    }
    
    // Kreira tekst
    const tekst = kreirajElement('div', { 
        className: 'loading-text',
        id: 'loading-text'
    }, 'Učitavanje...');
    
    dodajDijete(overlay, spinner);
    dodajDijete(overlay, tekst);
    
    dodajDijete(document.body, overlay);
    loadingElement = overlay;
    
    // Sakriva po defaultu
    sakrij(overlay);
}

/**
 * Prikazuje loading spinner
 * @param {string} tekst - Opcioni tekst za prikaz
 */
export function prikaziLoading(tekst = 'Učitavanje...') {
    if (!loadingElement) {
        inicijalizirajLoading();
    }
    
    loadingCount++;
    
    const tekstElement = dohvatiElement('loading-text');
    if (tekstElement) {
        tekstElement.textContent = tekst;
    }
    
    prikazi(loadingElement);
}

/**
 * Sakriva loading spinner
 * @param {boolean} force - Prisilno sakrij bez obzira na count
 */
export function sakrijLoading(force = false) {
    if (!loadingElement) return;
    
    loadingCount = Math.max(0, loadingCount - 1);
    
    if (force) {
        loadingCount = 0;
    }
    
    if (loadingCount === 0) {
        sakrij(loadingElement);
    }
}

/**
 * Prikazuje loading za određenu akciju
 * @param {Function} fn - Async funkcija za izvršiti
 * @param {string} tekst - Tekst za prikaz
 * @returns {Promise} - Rezultat funkcije
 */
export async function sLoading(fn, tekst = 'Učitavanje...') {
    prikaziLoading(tekst);
    try {
        const rezultat = await fn();
        return rezultat;
    } finally {
        sakrijLoading();
    }
}

/**
 * Resetuje loading state (u slučaju greške)
 */
export function resetujLoading() {
    loadingCount = 0;
    if (loadingElement) {
        sakrij(loadingElement);
    }
}

export default {
    prikaziLoading,
    sakrijLoading,
    sLoading,
    resetujLoading
};
