/**
 * Glavna aplikacija - Inicijalizira SPA i sve komponente
 */

import usmjerivac from './core/usmjerivac.js';
import autentikacija from './core/autentikacija.js';

// Import view-a
import prikaziPrijavu from './views/prijava.js';
import prikaziRegistraciju from './views/registracija.js';
import prikaziPocetnu from './views/pocetna.js';
// import prikaziProfil from './views/profil.js'; // TODO: refaktorirati

// Turnir view-i
import prikaziStvaranjeTurnira from './views/turnir/stvori.js';
import prikaziPridruzivanjeTurniru from './views/turnir/pridruzi.js';
// import prikaziDetaljeTurnira from './views/turnir/detalji.js'; // TODO: refaktorirati

/**
 * Inicijalizira aplikaciju
 */
async function inicijalizirajAplikaciju() {
    console.log('🎮 ŠahMajstor Pro - Pokretanje...');
    console.log('DEBUG: App element:', document.getElementById('app'));
    
    // Kreira toast kontejner ako ne postoji
    if (!document.getElementById('toast-container')) {
        const toastKontejner = document.createElement('div');
        toastKontejner.id = 'toast-container';
        toastKontejner.className = 'toast-container';
        document.body.appendChild(toastKontejner);
        console.log('✅ Toast kontejner kreiran');
    }
    
    // Provjerava sesiju ako je korisnik prijavljen
    const korisnik = autentikacija.dohvatiKorisnika();
    if (korisnik) {
        console.log('✅ Korisnik prijavljen:', korisnik.username);
        
        // Opciono provjerava sesiju s backendom
        const validna = await autentikacija.provjeriSesiju();
        if (!validna) {
            console.log('⚠️ Sesija nevažeća, preusmjeravanje na prijavu');
        }
    } else {
        console.log('ℹ️ Nema aktivne sesije - prikazujem prijavu');
    }
    
    // Registrira rute
    registrirajRute();
    console.log('✅ Rute registrirane');
    
    // Pokreće usmjerivač
    console.log('DEBUG: Pokrećem usmjerivač...');
    await usmjerivac.obradiRutu();
    
    console.log('✅ Aplikacija inicijalizirana');
    console.log('DEBUG: App HTML:', document.getElementById('app').innerHTML.substring(0, 200));
}

/**
 * Registrira sve rute aplikacije
 */
function registrirajRute() {
    console.log('📝 Registriranje ruta...');
    
    // Javne rute (ne zahtijevaju prijavu)
    usmjerivac.registriraj('/prijava', prikaziPrijavu, false);
    usmjerivac.registriraj('/registracija', prikaziRegistraciju, false);
    
    // Zaštićene rute (zahtijevaju prijavu)
    usmjerivac.registriraj('/pocetna', prikaziPocetnu);
    usmjerivac.registriraj('/', prikaziPocetnu); // Default ruta
    // usmjerivac.registriraj('/profil', prikaziProfil); // TODO
    
    // Turnir rute
    usmjerivac.registriraj('/turnir/stvori', prikaziStvaranjeTurnira);
    usmjerivac.registriraj('/turnir/pridruzi', prikaziPridruzivanjeTurniru);
    // usmjerivac.registriraj('/turnir/:id', prikaziDetaljeTurnira); // TODO
    
    console.log('✅ Rute registrirane');
}

// Globalni handler grešaka
window.addEventListener('error', (dogadaj) => {
    console.error('Globalna greška:', dogadaj.error);
});

// Rukuje neuhvaćenim odbijenim obećanjima
window.addEventListener('unhandledrejection', (dogadaj) => {
    console.error('Neuhvaćeno odbijeno obećanje:', dogadaj.reason);
});

// Inicijalizira aplikaciju kad je DOM spreman
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicijalizirajAplikaciju);
} else {
    inicijalizirajAplikaciju();
}

console.log('ŠahMajstor Pro v2.0 - Frontend učitan');

// Eksport za testiranje ili druge potrebe
export default {
    inicijalizirajAplikaciju,
    registrirajRute
};
