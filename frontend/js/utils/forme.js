/**
 * Util modul za rad s formama
 * Olakšava validaciju i rukovanje formama
 */

import { dohvatiElement, dohvatiVrijednost } from './dom.js';
import { 
    validirajEmail,
    validirajKorisnickoIme,
    validirajLozinku,
    usporediLozinke,
    sanitizirajUnos
} from './validacija.js';

/**
 * Sakuplja podatke iz forme
 * @param {HTMLFormElement|string} forma - Form element ili ID
 * @returns {Object} - Objekt s podacima forme
 */
export function prikupiPodatke(forma) {
    const formElement = typeof forma === 'string' ? dohvatiElement(forma) : forma;
    if (!formElement) return null;
    
    const formData = new FormData(formElement);
    const podaci = {};
    
    for (const [kljuc, vrijednost] of formData.entries()) {
        podaci[kljuc] = sanitizirajUnos(vrijednost);
    }
    
    return podaci;
}

/**
 * Prikazuje grešku za određeno polje
 * @param {string} poljeId - ID polja
 * @param {string} poruka - Poruka greške
 */
export function prikaziGreskuPolja(poljeId, poruka) {
    const polje = dohvatiElement(poljeId);
    if (!polje) return;
    
    // Dodaje klasu za grešku
    polje.classList.add('invalid');
    
    // Uklanja postojeću poruku greške ako postoji
    const postojecaGreska = polje.parentElement.querySelector('.error-message');
    if (postojecaGreska) {
        postojecaGreska.remove();
    }
    
    // Dodaje novu poruku greške
    const greskaPoruka = document.createElement('div');
    greskaPoruka.className = 'error-message';
    greskaPoruka.textContent = poruka;
    polje.parentElement.appendChild(greskaPoruka);
}

/**
 * Uklanja grešku s polja
 * @param {string} poljeId - ID polja
 */
export function ukloniGreskuPolja(poljeId) {
    const polje = dohvatiElement(poljeId);
    if (!polje) return;
    
    polje.classList.remove('invalid');
    
    const greskaPoruka = polje.parentElement.querySelector('.error-message');
    if (greskaPoruka) {
        greskaPoruka.remove();
    }
}

/**
 * Uklanja sve greške iz forme
 * @param {HTMLFormElement|string} forma - Form element ili ID
 */
export function ocistiGreske(forma) {
    const formElement = typeof forma === 'string' ? dohvatiElement(forma) : forma;
    if (!formElement) return;
    
    // Uklanja sve invalid klase
    const invalidPolja = formElement.querySelectorAll('.invalid');
    invalidPolja.forEach(polje => polje.classList.remove('invalid'));
    
    // Uklanja sve poruke grešaka
    const poruke = formElement.querySelectorAll('.error-message');
    poruke.forEach(poruka => poruka.remove());
}

/**
 * Validira formu za prijavu
 * @param {string} korisnickoImeId - ID polja korisničkog imena
 * @param {string} lozinkaId - ID polja lozinke
 * @returns {Object} - {validan: boolean, greske: Object}
 */
export function validirajFormuPrijave(korisnickoImeId, lozinkaId) {
    const korisnickoIme = dohvatiVrijednost(korisnickoImeId);
    const lozinka = dohvatiVrijednost(lozinkaId);
    
    const greske = {};
    let validan = true;
    
    // Validacija korisničkog imena
    const korisnickoImeValidacija = validirajKorisnickoIme(korisnickoIme);
    if (!korisnickoImeValidacija.validan) {
        greske.korisnickoIme = korisnickoImeValidacija.poruka;
        prikaziGreskuPolja(korisnickoImeId, korisnickoImeValidacija.poruka);
        validan = false;
    } else {
        ukloniGreskuPolja(korisnickoImeId);
    }
    
    // Validacija lozinke
    if (!lozinka) {
        greske.lozinka = 'Lozinka je obavezna';
        prikaziGreskuPolja(lozinkaId, 'Lozinka je obavezna');
        validan = false;
    } else {
        ukloniGreskuPolja(lozinkaId);
    }
    
    return { validan, greske };
}

/**
 * Validira formu za registraciju
 * @param {string} korisnickoImeId - ID polja korisničkog imena
 * @param {string} emailId - ID polja emaila
 * @param {string} lozinkaId - ID polja lozinke
 * @param {string} potvrdiLozinkuId - ID polja potvrde lozinke
 * @returns {Object} - {validan: boolean, greske: Object}
 */
export function validirajFormuRegistracije(korisnickoImeId, emailId, lozinkaId, potvrdiLozinkuId) {
    const korisnickoIme = dohvatiVrijednost(korisnickoImeId);
    const email = dohvatiVrijednost(emailId);
    const lozinka = dohvatiVrijednost(lozinkaId);
    const potvrdiLozinku = dohvatiVrijednost(potvrdiLozinkuId);
    
    const greske = {};
    let validan = true;
    
    // Validacija korisničkog imena
    const korisnickoImeValidacija = validirajKorisnickoIme(korisnickoIme);
    if (!korisnickoImeValidacija.validan) {
        greske.korisnickoIme = korisnickoImeValidacija.poruka;
        prikaziGreskuPolja(korisnickoImeId, korisnickoImeValidacija.poruka);
        validan = false;
    } else {
        ukloniGreskuPolja(korisnickoImeId);
    }
    
    // Validacija emaila
    if (!validirajEmail(email)) {
        greske.email = 'Unesite validan email';
        prikaziGreskuPolja(emailId, 'Unesite validan email');
        validan = false;
    } else {
        ukloniGreskuPolja(emailId);
    }
    
    // Validacija lozinke
    const lozinkaValidacija = validirajLozinku(lozinka);
    if (!lozinkaValidacija.validan) {
        greske.lozinka = lozinkaValidacija.poruka;
        prikaziGreskuPolja(lozinkaId, lozinkaValidacija.poruka);
        validan = false;
    } else {
        ukloniGreskuPolja(lozinkaId);
    }
    
    // Usporedba lozinki
    const usporedba = usporediLozinke(lozinka, potvrdiLozinku);
    if (!usporedba.validan) {
        greske.potvrdiLozinku = usporedba.poruka;
        prikaziGreskuPolja(potvrdiLozinkuId, usporedba.poruka);
        validan = false;
    } else {
        ukloniGreskuPolja(potvrdiLozinkuId);
    }
    
    return { validan, greske };
}

/**
 * Dodaje real-time validaciju na polje
 * @param {string} poljeId - ID polja
 * @param {Function} validacijaFn - Funkcija za validaciju
 */
export function dodajRealtimeValidaciju(poljeId, validacijaFn) {
    const polje = dohvatiElement(poljeId);
    if (!polje) return;
    
    polje.addEventListener('blur', () => {
        const rezultat = validacijaFn(polje.value);
        
        if (rezultat.validan === false) {
            prikaziGreskuPolja(poljeId, rezultat.poruka);
        } else {
            ukloniGreskuPolja(poljeId);
        }
    });
    
    // Uklanja grešku dok korisnik tipka
    polje.addEventListener('input', () => {
        if (polje.classList.contains('invalid')) {
            ukloniGreskuPolja(poljeId);
        }
    });
}

/**
 * Resetuje formu
 * @param {HTMLFormElement|string} forma - Form element ili ID
 */
export function resetujFormu(forma) {
    const formElement = typeof forma === 'string' ? dohvatiElement(forma) : forma;
    if (!formElement) return;
    
    formElement.reset();
    ocistiGreske(formElement);
}

/**
 * Onemogućuje formu (tokom slanja)
 * @param {HTMLFormElement|string} forma - Form element ili ID
 * @param {boolean} onemoguceno - Da li onemogućiti
 */
export function postaviOnemogucenjeForm(forma, onemoguceno) {
    const formElement = typeof forma === 'string' ? dohvatiElement(forma) : forma;
    if (!formElement) return;
    
    const polja = formElement.querySelectorAll('input, select, textarea, button');
    polja.forEach(polje => {
        polje.disabled = onemoguceno;
    });
}

export default {
    prikupiPodatke,
    prikaziGreskuPolja,
    ukloniGreskuPolja,
    ocistiGreske,
    validirajFormuPrijave,
    validirajFormuRegistracije,
    dodajRealtimeValidaciju,
    resetujFormu,
    postaviOnemogucenjeForm
};
