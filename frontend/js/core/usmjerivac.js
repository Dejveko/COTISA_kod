/**
 * SPA Usmjerivač - Usmjeravanje na klijentskoj strani bez ponovnog učitavanja stranice
 */

import autentikacija from './autentikacija.js';

/**
 * Klasa za upravljanje rutama
 */
class Usmjerivac {
    constructor() {
        this.rute = {};
        this.trenutnaRuta = null;
        
        // Slušatelj za promjene hash-a
        window.addEventListener('hashchange', () => this.obradiRutu());
        window.addEventListener('load', () => this.obradiRutu());
    }
    
    /**
     * Registrira rutu
     * @param {string} putanja - Putanja rute
     * @param {Function} handler - Funkcija za izvršiti
     * @param {boolean} zahtijevaPrijavu - Da li zahtijeva autentikaciju
     */
    registriraj(putanja, handler, zahtijevaPrijavu = true) {
        this.rute[putanja] = { handler, zahtijevaPrijavu };
    }
    
    /**
     * Obrađuje trenutnu rutu
     */
    async obradiRutu() {
        const hash = window.location.hash.slice(1) || '/';
        const [putanja, ...parametri] = hash.split('/').filter(Boolean);
        const rutaPutanja = `/${putanja || ''}`;
        
        console.log('DEBUG: obradiRutu - hash:', hash, 'rutaPutanja:', rutaPutanja);
        console.log('DEBUG: Registrirane rute:', Object.keys(this.rute));
        
        // Traži odgovarajuću rutu
        let ruta = this.rute[rutaPutanja];
        console.log('DEBUG: Pronađena ruta:', ruta ? 'DA' : 'NE');
        
        // Ako nema točno podudaranje, traži rute s parametrima
        if (!ruta) {
            // Pokušava pronaći rute s parametrima (npr. /turnir/123)
            const nadeniKljuc = Object.keys(this.rute).find(kljuc => {
                const uzorak = kljuc.replace(/:\w+/g, '([^/]+)');
                const regex = new RegExp(`^${uzorak}$`);
                return regex.test(rutaPutanja);
            });
            
            if (nadeniKljuc) {
                ruta = this.rute[nadeniKljuc];
            }
        }
        
        // Defaultna ruta - pocetna ako prijavljen, prijava ako nije
        if (!ruta) {
            console.log('DEBUG: Nema rute, biram defaultnu...');
            if (autentikacija.jePrijavljen()) {
                console.log('DEBUG: Korisnik prijavljen -> /pocetna');
                ruta = this.rute['/pocetna'];
            } else {
                console.log('DEBUG: Korisnik nije prijavljen -> /prijava');
                ruta = this.rute['/prijava'];
            }
        }
        
        // Provjerava autentikaciju
        if (ruta.zahtijevaPrijavu && !autentikacija.jePrijavljen()) {
            console.log('DEBUG: Ruta zahtijeva prijavu, preusmjeravam...');
            window.location.hash = '#/prijava';
            return;
        }
        
        // Izvršava handler rute
        this.trenutnaRuta = rutaPutanja;
        console.log('DEBUG: Izvršavam handler rute...', ruta.handler.name);
        try {
            await ruta.handler(...parametri);
            console.log('DEBUG: Handler izvršen uspješno');
        } catch (greska) {
            console.error('❌ Greška u handleru rute:', greska);
            this.prikaziGresku('Greška pri učitavanju stranice');
        }
    }
    
    /**
     * Navigira na rutu
     * @param {string} putanja - Putanja
     */
    idi(putanja) {
        window.location.hash = `#${putanja}`;
    }
    
    /**
     * Vraća se natrag
     */
    natrag() {
        window.history.back();
    }
    
    /**
     * Prikazuje stranicu s greškom
     * @param {string} poruka - Poruka greške
     */
    prikaziGresku(poruka) {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <div class="container">
                <div class="card text-center">
                    <h2>⚠️ Greška</h2>
                    <p>${poruka}</p>
                    <button class="btn btn-primary" onclick="window.location.hash='#/pocetna'">
                        Povratak na početnu
                    </button>
                </div>
            </div>
        `;
    }
}

// Kreira i izvozi singleton
const usmjerivac = new Usmjerivac();

// Postavlja slušatelje za klikove na linkove
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('[data-ruta]');
        if (link) {
            e.preventDefault();
            const ruta = link.getAttribute('data-ruta');
            usmjerivac.idi(ruta);
        }
    });
});

export default usmjerivac;
