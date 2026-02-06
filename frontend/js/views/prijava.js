/**
 * View - Prijava korisnika
 */

import autentikacija from '../core/autentikacija.js';
import usmjerivac from '../core/usmjerivac.js';
import { prikaziGresku } from '../components/Toast.js';
import { validirajFormuPrijave, postaviOnemogucenjeForme, dodajRealtimeValidaciju } from '../utils/forme.js';
import { dohvatiElement, dohvatiVrijednost, dodajListener } from '../utils/dom.js';
import { validirajKorisnickoIme } from '../utils/validacija.js';
import { PORUKE } from '../config/konstante.js';

/**
 * Prikazuje stranicu za prijavu
 */
export default async function prikaziPrijavu() {
    console.log('DEBUG: prikaziPrijavu() pozvana');
    
    // Preusmjerava ako je već prijavljen
    if (autentikacija.jePrijavljen()) {
        console.log('DEBUG: Korisnik već prijavljen, preusmjeravam...');
        usmjerivac.idi('/pocetna');
        return;
    }
    
    console.log('DEBUG: Dohvaćam app element...');
    const app = dohvatiElement('app');
    console.log('DEBUG: App element:', app);
    app.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <img src="images/logo_cotisa.png" alt="COTISA" class="logo-icon auth-logo">
                    <p>Prijavite se na svoj račun</p>
                </div>
                
                <form id="forma-prijava">
                    <div class="form-group">
                        <label for="korisnicko-ime">Korisničko ime</label>
                        <input 
                            type="text" 
                            id="korisnicko-ime" 
                            name="korisnicko_ime"
                            class="form-control" 
                            placeholder="Unesite korisničko ime"
                            required
                            autocomplete="username"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="lozinka">Lozinka</label>
                        <input 
                            type="password" 
                            id="lozinka" 
                            name="lozinka"
                            class="form-control" 
                            placeholder="Unesite lozinku"
                            required
                            autocomplete="current-password"
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Prijavi se
                    </button>
                </form>
                
                <div class="auth-link">
                    Nemate račun? <a href="#/registracija" data-ruta="/registracija">Registrirajte se</a>
                </div>
            </div>
        </div>
    `;
    
    // Dodaje real-time validaciju
    dodajRealtimeValidaciju('korisnicko-ime', validirajKorisnickoIme);
    
    // Slušatelj za submit forme
    const forma = dohvatiElement('forma-prijava');
    dodajListener(forma, 'submit', async (e) => {
        e.preventDefault();
        
        // Validacija
        const validacija = validirajFormuPrijave('korisnicko-ime', 'lozinka');
        if (!validacija.validan) {
            return;
        }
        
        // Dohvaća vrijednosti
        const korisnickoIme = dohvatiVrijednost('korisnicko-ime').trim();
        const lozinka = dohvatiVrijednost('lozinka');
        
        // Onemogućava formu tokom slanja
        postaviOnemogucenjeForme(forma, true);
        
        // Pokušava prijavu
        const uspjeh = await autentikacija.prijava(korisnickoIme, lozinka);
        
        if (uspjeh) {
            // Preusmjerava na početnu
            usmjerivac.idi('/pocetna');
        } else {
            // Omogućava formu ponovo
            postaviOnemogucenjeForme(forma, false);
        }
    });
}
