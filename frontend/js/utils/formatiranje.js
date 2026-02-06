/**
 * Utils - Formatiranje podataka
 * Sve funkcije za formatiranje na jednom mjestu
 */

import { NAZIVI_TURNIRA, NAZIVI_STATUSA, NAZIVI_ROLA } from '../config/konstante.js';

/**
 * Formatira datum u hrvatski format
 * @param {string|Date} datum - Datum za formatiranje
 * @returns {string}
 */
export function formatirajDatum(datum) {
    if (!datum) return '-';
    
    const d = new Date(datum);
    
    return d.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formatira tip turnira u hrvatski naziv
 * @param {string} tip - Tip turnira
 * @returns {string}
 */
export function formatirajTipTurnira(tip) {
    return NAZIVI_TURNIRA[tip] || tip;
}

/**
 * Formatira status turnira u hrvatski naziv
 * @param {string} status - Status turnira
 * @returns {string}
 */
export function formatirajStatus(status) {
    return NAZIVI_STATUSA[status] || status;
}

/**
 * Formatira rolu korisnika u hrvatski naziv
 * @param {string} rola - Rola korisnika
 * @returns {string}
 */
export function formatirajRolu(rola) {
    return NAZIVI_ROLA[rola] || rola;
}

/**
 * Formatira broj igrača (trenutno/maksimalno)
 * @param {number} trenutno - Trenutni broj igrača
 * @param {number} maksimalno - Maksimalan broj igrača
 * @returns {string}
 */
export function formatirajBrojIgraca(trenutno, maksimalno) {
    return `${trenutno}/${maksimalno} igrača`;
}

/**
 * Formatira postotak
 * @param {number} broj - Broj za formatiranje
 * @returns {string}
 */
export function formatirajPostotak(broj) {
    return `${Math.round(broj)}%`;
}

/**
 * Formatira veliki broj sa separatorom tisuca
 * @param {number} broj - Broj za formatiranje
 * @returns {string}
 */
export function formatirajBroj(broj) {
    return new Intl.NumberFormat('hr-HR').format(broj);
}

/**
 * Skraćuje tekst na određeni broj znakova
 * @param {string} tekst - Tekst za skraćivanje
 * @param {number} max - Maksimalan broj znakova
 * @returns {string}
 */
export function skratiTekst(tekst, max = 50) {
    if (!tekst || tekst.length <= max) return tekst;
    return tekst.substring(0, max) + '...';
}

/**
 * Pretvara prvi znak u veliko slovo
 * @param {string} str - String za pretvaranje
 * @returns {string}
 */
export function velikoSlovo(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatira vrijeme proteklo od određenog datuma
 * @param {string|Date} datum - Datum
 * @returns {string}
 */
export function protekloVrijeme(datum) {
    const sad = new Date();
    const proslo = new Date(datum);
    const razlika = sad - proslo;
    
    const sekunde = Math.floor(razlika / 1000);
    const minute = Math.floor(sekunde / 60);
    const sati = Math.floor(minute / 60);
    const dani = Math.floor(sati / 24);
    
    if (dani > 0) return `prije ${dani} dan${dani > 1 ? 'a' : ''}`;
    if (sati > 0) return `prije ${sati} sat${sati > 1 ? 'a' : ''}`;
    if (minute > 0) return `prije ${minute} minut${minute > 1 ? 'a' : ''}`;
    return 'upravo sad';
}

export default {
    formatirajDatum,
    formatirajTipTurnira,
    formatirajStatus,
    formatirajRolu,
    formatirajBrojIgraca,
    formatirajPostotak,
    formatirajBroj,
    skratiTekst,
    velikoSlovo,
    protekloVrijeme,
};
