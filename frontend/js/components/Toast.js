/**
 * UI Komponenta - Toast notifikacije
 * Prikazuje poruke korisniku
 */

import { dohvatiElement, kreirajElement, dodajDijete, ukloniElement } from '../utils/dom.js';
import { UI_CONFIG } from '../config/konstante.js';

/**
 * Prikazuje toast notifikaciju
 * @param {string} poruka - Poruka za prikaz
 * @param {string} tip - Tip poruke ('success', 'error', 'warning', 'info')
 * @param {number} trajanje - Trajanje prikaza u ms
 */
export function prikaziToast(poruka, tip = 'info', trajanje = UI_CONFIG.TRAJANJE_TOASTA) {
    const kontejner = dohvatiElement('toast-container');
    if (!kontejner) {
        console.error('Toast kontejner nije pronađen!');
        return;
    }
    
    // Kreira toast element
    const toast = kreirajElement('div', { className: `toast ${tip}` });
    
    // Ikona ovisno o tipu
    const ikone = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const ikona = kreirajElement('span', { className: 'toast-icon' }, ikone[tip] || ikone.info);
    const tekstElement = kreirajElement('span', { className: 'toast-message' }, poruka);
    const zatvoriGumb = kreirajElement('span', { className: 'toast-close' }, '×');
    
    // Dodaje elemente u toast
    dodajDijete(toast, ikona);
    dodajDijete(toast, tekstElement);
    dodajDijete(toast, zatvoriGumb);
    
    // Dodaje toast u kontejner
    dodajDijete(kontejner, toast);
    
    // Auto-uklanjanje nakon određenog vremena
    const timeoutId = setTimeout(() => {
        ukloniToast(toast);
    }, trajanje);
    
    // Ručno zatvaranje
    zatvoriGumb.addEventListener('click', () => {
        clearTimeout(timeoutId);
        ukloniToast(toast);
    });
}

/**
 * Uklanja toast iz DOM-a s animacijom
 * @param {HTMLElement} toast - Toast element
 */
function ukloniToast(toast) {
    if (!toast) return;
    
    // Dodaje klasu za fade out animaciju
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    
    setTimeout(() => {
        ukloniElement(toast);
    }, UI_CONFIG.ANIMACIJA_TRAJANJE);
}

/**
 * Prikazuje uspješnu poruku
 * @param {string} poruka - Poruka
 */
export function prikaziUspjeh(poruka) {
    prikaziToast(poruka, 'success');
}

/**
 * Prikazuje poruku o grešci
 * @param {string} poruka - Poruka
 */
export function prikaziGresku(poruka) {
    prikaziToast(poruka, 'error');
}

/**
 * Prikazuje upozorenje
 * @param {string} poruka - Poruka
 */
export function prikaziUpozorenje(poruka) {
    prikaziToast(poruka, 'warning');
}

/**
 * Prikazuje info poruku
 * @param {string} poruka - Poruka
 */
export function prikaziInfo(poruka) {
    prikaziToast(poruka, 'info');
}

export default {
    prikaziToast,
    prikaziUspjeh,
    prikaziGresku,
    prikaziUpozorenje,
    prikaziInfo,
};
