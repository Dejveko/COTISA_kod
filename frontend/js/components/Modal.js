/**
 * UI Komponenta - Modal dijalozi
 * Kreira i upravlja modal prozorima
 */

import { kreirajElement, dodajDijete, dodajListener, ukloniElement } from '../utils/dom.js';

let aktivniModal = null;

/**
 * Kreira i prikazuje modal dijalog
 * @param {Object} opcije - Opcije za modal
 * @param {string} opcije.naslov - Naslov modala
 * @param {string|HTMLElement} opcije.sadrzaj - Sadržaj modala
 * @param {Array} opcije.gumbovi - Array objekata gumbova {tekst, tip, onClick}
 * @param {boolean} opcije.zatvoriKlikom - Da li zatvoriti klikom na overlay (default: true)
 * @param {Function} opcije.priZatvaranju - Callback kad se modal zatvori
 * @returns {HTMLElement} - Modal element
 */
export function prikaziModal({
    naslov = '',
    sadrzaj = '',
    gumbovi = [],
    zatvoriKlikom = true,
    priZatvaranju = null
}) {
    // Zatvara prethodni modal ako postoji
    if (aktivniModal) {
        zatvoriModal();
    }
    
    // Kreira overlay - start hidden to prevent blocking clicks
    const overlay = kreirajElement('div', { className: 'modal-overlay hidden' });
    
    // Kreira modal kontejner
    const modal = kreirajElement('div', { className: 'modal' });
    
    // Header
    const header = kreirajElement('div', { className: 'modal-header' });
    const naslovElement = kreirajElement('h2', { className: 'modal-title' }, naslov);
    const zatvoriGumb = kreirajElement('button', { 
        className: 'modal-close',
        type: 'button'
    }, '×');
    
    dodajDijete(header, naslovElement);
    dodajDijete(header, zatvoriGumb);
    
    // Body
    const body = kreirajElement('div', { className: 'modal-body' });
    if (typeof sadrzaj === 'string') {
        body.innerHTML = sadrzaj;
    } else {
        dodajDijete(body, sadrzaj);
    }
    
    // Footer s gumbovima
    const footer = kreirajElement('div', { className: 'modal-footer' });
    
    gumbovi.forEach(gumb => {
        const btn = kreirajElement('button', {
            className: `btn ${gumb.tip || 'btn-secondary'}`,
            type: 'button'
        }, gumb.tekst);
        
        dodajListener(btn, 'click', async () => {
            if (gumb.onClick) {
                await gumb.onClick();
            }
            if (gumb.zatvori !== false) {
                zatvoriModal();
            }
        });
        
        dodajDijete(footer, btn);
    });
    
    // Sastavlja modal
    dodajDijete(modal, header);
    dodajDijete(modal, body);
    if (gumbovi.length > 0) {
        dodajDijete(modal, footer);
    }
    dodajDijete(overlay, modal);
    
    // Event listeneri za zatvaranje
    dodajListener(zatvoriGumb, 'click', () => zatvoriModal());
    
    if (zatvoriKlikom) {
        dodajListener(overlay, 'click', (e) => {
            if (e.target === overlay) {
                zatvoriModal();
            }
        });
    }
    
    // ESC za zatvaranje
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            zatvoriModal();
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Dodaje u DOM
    dodajDijete(document.body, overlay);
    aktivniModal = {
        element: overlay,
        priZatvaranju,
        escHandler
    };
    
    // Animacija otvaranja
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    return modal;
}

/**
 * Zatvara trenutno aktivni modal
 */
export function zatvoriModal() {
    if (!aktivniModal) return;
    
    const { element, priZatvaranju, escHandler } = aktivniModal;
    
    // Animacija zatvaranja
    element.classList.remove('active');
    
    setTimeout(() => {
        ukloniElement(element);
        document.removeEventListener('keydown', escHandler);
        
        if (priZatvaranju) {
            priZatvaranju();
        }
        
        aktivniModal = null;
    }, 300);
}

/**
 * Prikazuje modal za potvrdu
 * @param {string} poruka - Poruka za potvrdu
 * @param {string} naslov - Naslov modala
 * @returns {Promise<boolean>} - true ako je potvrđeno, false ako je odbijeno
 */
export function potvrdaModal(poruka, naslov = 'Potvrda') {
    return new Promise((resolve) => {
        prikaziModal({
            naslov,
            sadrzaj: `<p>${poruka}</p>`,
            gumbovi: [
                {
                    tekst: 'Otkaži',
                    tip: 'btn-secondary',
                    onClick: () => resolve(false)
                },
                {
                    tekst: 'Potvrdi',
                    tip: 'btn-primary',
                    onClick: () => resolve(true)
                }
            ],
            priZatvaranju: () => resolve(false)
        });
    });
}

/**
 * Prikazuje alert modal
 * @param {string} poruka - Poruka
 * @param {string} naslov - Naslov
 * @returns {Promise<void>}
 */
export function alertModal(poruka, naslov = 'Obavijest') {
    return new Promise((resolve) => {
        prikaziModal({
            naslov,
            sadrzaj: `<p>${poruka}</p>`,
            gumbovi: [
                {
                    tekst: 'U redu',
                    tip: 'btn-primary',
                    onClick: () => resolve()
                }
            ],
            priZatvaranju: () => resolve()
        });
    });
}

/**
 * Prikazuje modal s formom
 * @param {string} naslov - Naslov modala
 * @param {Array} polja - Array objekata polja {label, type, name, placeholder, required}
 * @param {Function} onSubmit - Callback s podacima forme
 * @returns {Promise<Object|null>} - Podaci forme ili null ako je otkazano
 */
export function formaModal(naslov, polja, onSubmit) {
    return new Promise((resolve) => {
        const forma = kreirajElement('form', { className: 'modal-form' });
        
        polja.forEach(polje => {
            const grupaPolja = kreirajElement('div', { className: 'form-group' });
            
            if (polje.label) {
                const label = kreirajElement('label', {}, polje.label);
                dodajDijete(grupaPolja, label);
            }
            
            let input;
            if (polje.type === 'textarea') {
                input = kreirajElement('textarea', {
                    name: polje.name,
                    placeholder: polje.placeholder || '',
                    required: polje.required || false,
                    className: 'form-control'
                });
            } else if (polje.type === 'select') {
                input = kreirajElement('select', {
                    name: polje.name,
                    required: polje.required || false,
                    className: 'form-control'
                });
                
                polje.opcije?.forEach(opcija => {
                    const option = kreirajElement('option', {
                        value: opcija.value
                    }, opcija.text);
                    dodajDijete(input, option);
                });
            } else {
                input = kreirajElement('input', {
                    type: polje.type || 'text',
                    name: polje.name,
                    placeholder: polje.placeholder || '',
                    required: polje.required || false,
                    className: 'form-control'
                });
            }
            
            dodajDijete(grupaPolja, input);
            dodajDijete(forma, grupaPolja);
        });
        
        prikaziModal({
            naslov,
            sadrzaj: forma,
            gumbovi: [
                {
                    tekst: 'Otkaži',
                    tip: 'btn-secondary',
                    onClick: () => resolve(null)
                },
                {
                    tekst: 'Potvrdi',
                    tip: 'btn-primary',
                    onClick: async () => {
                        const formData = new FormData(forma);
                        const podaci = Object.fromEntries(formData.entries());
                        
                        if (onSubmit) {
                            await onSubmit(podaci);
                        }
                        
                        resolve(podaci);
                    }
                }
            ],
            priZatvaranju: () => resolve(null)
        });
    });
}

export default {
    prikaziModal,
    zatvoriModal,
    potvrdaModal,
    alertModal,
    formaModal
};
