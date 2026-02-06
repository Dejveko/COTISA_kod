/**
 * View - Registracija novog korisnika
 */

import autentikacija from '../core/autentikacija.js';
import usmjerivac from '../core/usmjerivac.js';
import { validirajFormuRegistracije, postaviOnemogucenjeForme, dodajRealtimeValidaciju } from '../utils/forme.js';
import { dohvatiElement, dohvatiVrijednost, dodajListener } from '../utils/dom.js';
import { validirajKorisnickoIme, validirajEmail, validirajLozinku } from '../utils/validacija.js';

/**
 * Prikazuje stranicu za registraciju
 */
export default async function prikaziRegistraciju() {
    // Preusmjerava ako je već prijavljen
    if (autentikacija.jePrijavljen()) {
        usmjerivac.idi('/pocetna');
        return;
    }
    
    const app = dohvatiElement('app');
    app.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <img src="images/logo_cotisa.png" alt="COTISA" class="logo-icon auth-logo">
                    <p>Kreirajte novi račun</p>
                </div>
                
                <form id="forma-registracija">
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
                        <label for="email">Email adresa</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            class="form-control" 
                            placeholder="Unesite email"
                            required
                            autocomplete="email"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="lozinka">Lozinka</label>
                        <input 
                            type="password" 
                            id="lozinka" 
                            name="lozinka"
                            class="form-control" 
                            placeholder="Unesite lozinku (minimalno 6 znakova)"
                            required
                            autocomplete="new-password"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="potvrdi-lozinku">Potvrdi lozinku</label>
                        <input 
                            type="password" 
                            id="potvrdi-lozinku" 
                            name="potvrdi_lozinku"
                            class="form-control" 
                            placeholder="Potvrdite lozinku"
                            required
                            autocomplete="new-password"
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">
                        Registriraj se
                    </button>
                </form>
                
                <div class="auth-link">
                    Već imate račun? <a href="#/prijava" data-ruta="/prijava">Prijavite se</a>
                </div>
            </div>
        </div>
    `;
    
    // Dodaje real-time validaciju
    dodajRealtimeValidaciju('korisnicko-ime', validirajKorisnickoIme);
    dodajRealtimeValidaciju('email', (email) => ({
        validan: validirajEmail(email),
        poruka: 'Unesite validan email'
    }));
    dodajRealtimeValidaciju('lozinka', validirajLozinku);
    
    // Slušatelj za submit forme
    const forma = dohvatiElement('forma-registracija');
    dodajListener(forma, 'submit', async (e) => {
        e.preventDefault();
        
        // Validacija
        const validacija = validirajFormuRegistracije(
            'korisnicko-ime',
            'email',
            'lozinka',
            'potvrdi-lozinku'
        );
        
        if (!validacija.validan) {
            return;
        }
        
        // Dohvaća vrijednosti
        const korisnickoIme = dohvatiVrijednost('korisnicko-ime').trim();
        const email = dohvatiVrijednost('email').trim();
        const lozinka = dohvatiVrijednost('lozinka');
        
        // Onemogućava formu tokom slanja
        postaviOnemogucenjeForme(forma, true);
        
        // Pokušava registraciju
        const uspjeh = await autentikacija.registracija(korisnickoIme, email, lozinka);
        
        if (uspjeh) {
            // Preusmjerava na početnu (korisnik je automatski prijavljen)
            usmjerivac.idi('/pocetna');
        } else {
            // Omogućava formu ponovo
            postaviOnemogucenjeForme(forma, false);
        }
    });
}
