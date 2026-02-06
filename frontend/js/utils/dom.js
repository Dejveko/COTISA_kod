/**
 * Utils - DOM manipulacija
 * Sve funkcije za rad s DOM-om
 */

/**
 * Dohvaća element po ID-u
 * @param {string} id - ID elementa
 * @returns {HTMLElement|null}
 */
export function dohvatiElement(id) {
    return document.getElementById(id);
}

/**
 * Dohvaća sve elemente po selektoru
 * @param {string} selektor - CSS selektor
 * @param {HTMLElement} roditelj - Roditeljski element (opciono)
 * @returns {NodeList}
 */
export function dohvatiElemente(selektor, roditelj = document) {
    return roditelj.querySelectorAll(selektor);
}

/**
 * Dohvaća prvi element po selektoru
 * @param {string} selektor - CSS selektor
 * @param {HTMLElement} roditelj - Roditeljski element (opciono)
 * @returns {HTMLElement|null}
 */
export function dohvatiPrviElement(selektor, roditelj = document) {
    return roditelj.querySelector(selektor);
}

/**
 * Dodaje klasu elementu
 * @param {HTMLElement} element - Element
 * @param {string} klasa - Naziv klase
 */
export function dodajKlasu(element, klasa) {
    if (element) element.classList.add(klasa);
}

/**
 * Uklanja klasu s elementa
 * @param {HTMLElement} element - Element
 * @param {string} klasa - Naziv klase
 */
export function ukloniKlasu(element, klasa) {
    if (element) element.classList.remove(klasa);
}

/**
 * Togglea klasu na elementu
 * @param {HTMLElement} element - Element
 * @param {string} klasa - Naziv klase
 */
export function toggleKlasu(element, klasa) {
    if (element) element.classList.toggle(klasa);
}

/**
 * Provjerava ima li element klasu
 * @param {HTMLElement} element - Element
 * @param {string} klasa - Naziv klase
 * @returns {boolean}
 */
export function imaKlasu(element, klasa) {
    return element && element.classList.contains(klasa);
}

/**
 * Postavlja HTML sadržaj elementa
 * @param {HTMLElement} element - Element
 * @param {string} html - HTML sadržaj
 */
export function postaviHTML(element, html) {
    if (element) element.innerHTML = html;
}

/**
 * Postavlja tekst elementa
 * @param {HTMLElement} element - Element
 * @param {string} tekst - Tekstualni sadržaj
 */
export function postaviTekst(element, tekst) {
    if (element) element.textContent = tekst;
}

/**
 * Dohvaća vrijednost input polja
 * @param {HTMLElement|string} element - Element ili ID
 * @returns {string}
 */
export function dohvatiVrijednost(element) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    return el ? el.value.trim() : '';
}

/**
 * Postavlja vrijednost input polja
 * @param {HTMLElement|string} element - Element ili ID
 * @param {string} vrijednost - Vrijednost
 */
export function postaviVrijednost(element, vrijednost) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    if (el) el.value = vrijednost;
}

/**
 * Prikazuje element (uklanja 'hidden' klasu)
 * @param {HTMLElement|string} element - Element ili ID
 */
export function prikazi(element) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    ukloniKlasu(el, 'hidden');
}

/**
 * Sakriva element (dodaje 'hidden' klasu)
 * @param {HTMLElement|string} element - Element ili ID
 */
export function sakrij(element) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    dodajKlasu(el, 'hidden');
}

/**
 * Toggle prikaza elementa
 * @param {HTMLElement|string} element - Element ili ID
 */
export function togglePrikaz(element) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    toggleKlasu(el, 'hidden');
}

/**
 * Dodaje event listener
 * @param {HTMLElement|string} element - Element ili ID
 * @param {string} dogadaj - Tip događaja
 * @param {Function} handler - Handler funkcija
 */
export function dodajListener(element, dogadaj, handler) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    if (el) el.addEventListener(dogadaj, handler);
}

/**
 * Uklanja event listener
 * @param {HTMLElement|string} element - Element ili ID
 * @param {string} dogadaj - Tip događaja
 * @param {Function} handler - Handler funkcija
 */
export function ukloniListener(element, dogadaj, handler) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    if (el) el.removeEventListener(dogadaj, handler);
}

/**
 * Uklanja sve djecu iz elementa
 * @param {HTMLElement|string} element - Element ili ID
 */
export function ocistiElement(element) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    if (el) el.innerHTML = '';
}

/**
 * Kreira novi HTML element
 * @param {string} tag - HTML tag
 * @param {Object} atributi - Atributi elementa
 * @param {string} sadrzaj - Tekstualni sadržaj
 * @returns {HTMLElement}
 */
export function kreirajElement(tag, atributi = {}, sadrzaj = '') {
    const element = document.createElement(tag);
    
    Object.entries(atributi).forEach(([kljuc, vrijednost]) => {
        if (kljuc === 'className') {
            element.className = vrijednost;
        } else if (kljuc === 'onClick') {
            element.addEventListener('click', vrijednost);
        } else {
            element.setAttribute(kljuc, vrijednost);
        }
    });
    
    if (sadrzaj) element.textContent = sadrzaj;
    
    return element;
}

/**
 * Dodaje element kao dijete
 * @param {HTMLElement} roditelj - Roditeljski element
 * @param {HTMLElement} dijete - Element za dodavanje
 */
export function dodajDijete(roditelj, dijete) {
    if (roditelj && dijete) {
        roditelj.appendChild(dijete);
    }
}

/**
 * Uklanja element iz DOM-a
 * @param {HTMLElement} element - Element za uklanjanje
 */
export function ukloniElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Fokusira element
 * @param {HTMLElement|string} element - Element ili ID
 */
export function fokusiraj(element) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    if (el && el.focus) {
        el.focus();
    }
}

/**
 * Scrolla do elementa
 * @param {HTMLElement|string} element - Element ili ID
 * @param {Object} opcije - Scroll opcije
 */
export function scrollajDo(element, opcije = { behavior: 'smooth' }) {
    const el = typeof element === 'string' ? dohvatiElement(element) : element;
    if (el && el.scrollIntoView) {
        el.scrollIntoView(opcije);
    }
}

export default {
    dohvatiElement,
    dohvatiElemente,
    dohvatiPrviElement,
    dodajKlasu,
    ukloniKlasu,
    toggleKlasu,
    imaKlasu,
    postaviHTML,
    postaviTekst,
    dohvatiVrijednost,
    postaviVrijednost,
    prikazi,
    sakrij,
    togglePrikaz,
    dodajListener,
    ukloniListener,
    ocistiElement,
    kreirajElement,
    dodajDijete,
    ukloniElement,
    fokusiraj,
    scrollajDo,
};
