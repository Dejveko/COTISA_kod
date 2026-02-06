/**
 * Utils - Validacija podataka
 * Sve validacijske funkcije na jednom mjestu
 */

import { VALIDACIJA, REGEX, PORUKE } from '../config/konstante.js';

/**
 * Validira email adresu
 * @param {string} email - Email adresa
 * @returns {boolean}
 */
export function validirajEmail(email) {
    return REGEX.EMAIL.test(email);
}

/**
 * Validira 6-znamenkasti kod
 * @param {string} kod - Turnirski kod
 * @returns {boolean}
 */
export function validirajKod(kod) {
    return REGEX.KOD_6_ZNAMENKI.test(kod);
}

/**
 * Validira korisničko ime
 * @param {string} korisnickoIme - Korisničko ime
 * @returns {object} - {validan: boolean, greska: string|null}
 */
export function validirajKorisnickoIme(korisnickoIme) {
    if (!korisnickoIme || korisnickoIme.trim().length === 0) {
        return { validan: false, greska: PORUKE.POPUNI_SVA_POLJA };
    }
    
    if (korisnickoIme.length < VALIDACIJA.MIN_DULJINA_KORISNICKOG_IMENA) {
        return { validan: false, greska: PORUKE.KORISNICKO_IME_PREKRATKO };
    }
    
    return { validan: true, greska: null };
}

/**
 * Validira lozinku
 * @param {string} lozinka - Lozinka
 * @returns {object} - {validan: boolean, greska: string|null}
 */
export function validirajLozinku(lozinka) {
    if (!lozinka || lozinka.length === 0) {
        return { validan: false, greska: PORUKE.POPUNI_SVA_POLJA };
    }
    
    if (lozinka.length < VALIDACIJA.MIN_DULJINA_LOZINKE) {
        return { validan: false, greska: PORUKE.LOZINKA_PREKRATKA };
    }
    
    return { validan: true, greska: null };
}

/**
 * Validira email s porukom greške
 * @param {string} email - Email adresa
 * @returns {object} - {validan: boolean, greska: string|null}
 */
export function validirajEmailSGreskom(email) {
    if (!email || email.trim().length === 0) {
        return { validan: false, greska: PORUKE.POPUNI_SVA_POLJA };
    }
    
    if (!validirajEmail(email)) {
        return { validan: false, greska: PORUKE.NEISPRAVNA_EMAIL };
    }
    
    return { validan: true, greska: null };
}

/**
 * Uspoređuje dvije lozinke
 * @param {string} lozinka1 - Prva lozinka
 * @param {string} lozinka2 - Druga lozinka
 * @returns {object} - {podudaraju: boolean, greska: string|null}
 */
export function usporediLozinke(lozinka1, lozinka2) {
    if (lozinka1 !== lozinka2) {
        return { podudaraju: false, greska: PORUKE.LOZINKE_SE_NE_PODUDARAJU };
    }
    
    return { podudaraju: true, greska: null };
}

/**
 * Validira broj igrača
 * @param {number} broj - Broj igrača
 * @returns {object} - {validan: boolean, greska: string|null}
 */
export function validirajBrojIgraca(broj) {
    if (isNaN(broj) || broj < VALIDACIJA.MIN_IGRACA) {
        return { 
            validan: false, 
            greska: `Broj igrača mora biti najmanje ${VALIDACIJA.MIN_IGRACA}` 
        };
    }
    
    if (broj > VALIDACIJA.MAX_IGRACA) {
        return { 
            validan: false, 
            greska: `Broj igrača ne smije biti veći od ${VALIDACIJA.MAX_IGRACA}` 
        };
    }
    
    return { validan: true, greska: null };
}

/**
 * Validira je li broj potencija broja 2 (za eliminaciju)
 * @param {number} broj - Broj za provjeru
 * @returns {boolean}
 */
export function jePotencijaBroja2(broj) {
    return broj > 0 && (broj & (broj - 1)) === 0;
}

/**
 * Provjerava je li string prazan
 * @param {string} str - String za provjeru
 * @returns {boolean}
 */
export function jePrazan(str) {
    return !str || str.trim().length === 0;
}

/**
 * Sanitizira unos (uklanja opasne znakove)
 * @param {string} unos - Korisnički unos
 * @returns {string}
 */
export function sanitizirajUnos(unos) {
    if (!unos) return '';
    
    return unos
        .trim()
        .replace(/[<>]/g, '') // Ukloni < i >
        .replace(/javascript:/gi, '') // Ukloni javascript: protokol
        .replace(/on\w+=/gi, ''); // Ukloni onevent atribute
}

export default {
    validirajEmail,
    validirajKod,
    validirajKorisnickoIme,
    validirajLozinku,
    validirajEmailSGreskom,
    usporediLozinke,
    validirajBrojIgraca,
    jePotencijaBroja2,
    jePrazan,
    sanitizirajUnos,
};
