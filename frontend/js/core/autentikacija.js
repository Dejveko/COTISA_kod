/**
 * Menadžer autentikacije - upravlja stanjem korisnika i autentikacijom
 */

import { autentikacijaAPI } from './api.js';
import { prikaziUspjeh, prikaziGresku } from '../components/Toast.js';
import { prikaziLoading, sakrijLoading } from '../components/Loading.js';
import { STORAGE_KEYS, PORUKE, NAZIVI_ROLA } from '../config/konstante.js';

/**
 * Klasa za upravljanje autentikacijom
 */
class MenadzerAutentikacije {
    constructor() {
        this.trenutniKorisnik = this.ucitajKorisnika();
        this.slusatelji = [];
    }
    
    /**
     * Učitava korisnika iz localStorage
     */
    ucitajKorisnika() {
        const podaci = localStorage.getItem(STORAGE_KEYS.USER);
        return podaci ? JSON.parse(podaci) : null;
    }
    
    /**
     * Sprema korisnika u localStorage
     */
    spremiKorisnika(korisnik) {
        this.trenutniKorisnik = korisnik;
        if (korisnik) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(korisnik));
            localStorage.setItem(STORAGE_KEYS.SESSION, Date.now().toString());
        } else {
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.SESSION);
        }
        this.obavijestSlusatelje();
    }
    
    /**
     * Registrira slušatelja za promjene stanja autentikacije
     */
    priPromjeniAutentikacije(callback) {
        this.slusatelji.push(callback);
    }
    
    /**
     * Obavještava sve slušatelje
     */
    obavijestSlusatelje() {
        this.slusatelji.forEach(callback => callback(this.trenutniKorisnik));
    }
    
    /**
     * Dohvaća trenutnog korisnika
     */
    dohvatiKorisnika() {
        return this.trenutniKorisnik;
    }
    
    /**
     * Provjerava je li korisnik prijavljen
     */
    jePrijavljen() {
        return this.trenutniKorisnik !== null;
    }
    
    /**
     * Provjerava je li korisnik admin
     */
    jeAdmin() {
        return this.trenutniKorisnik && this.trenutniKorisnik.role === 'admin';
    }
    
    /**
     * Prijava korisnika
     */
    async prijava(korisnicko_ime, lozinka) {
        prikaziLoading('Prijavljivanje...');
        try {
            const odgovor = await autentikacijaAPI.prijava(korisnicko_ime, lozinka);
            
            if (odgovor.success) {
                this.spremiKorisnika(odgovor.user);
                prikaziUspjeh(PORUKE.USPJESNA_PRIJAVA);
                return true;
            } else {
                prikaziGresku(odgovor.error || PORUKE.GRESKA_PRIJAVA);
                return false;
            }
        } catch (greska) {
            prikaziGresku(greska.message || PORUKE.GRESKA_PRIJAVA);
            return false;
        } finally {
            sakrijLoading();
        }
    }
    
    /**
     * Registracija novog korisnika
     */
    async registracija(korisnicko_ime, email, lozinka) {
        prikaziLoading('Registracija...');
        try {
            const odgovor = await autentikacijaAPI.registracija(korisnicko_ime, email, lozinka);
            
            if (odgovor.success) {
                // Auto-prijava nakon registracije
                this.spremiKorisnika(odgovor.user);
                prikaziUspjeh(PORUKE.USPJESNA_REGISTRACIJA);
                return true;
            } else {
                prikaziGresku(odgovor.error || PORUKE.GRESKA_REGISTRACIJA);
                return false;
            }
        } catch (greska) {
            prikaziGresku(greska.message || PORUKE.GRESKA_REGISTRACIJA);
            return false;
        } finally {
            sakrijLoading();
        }
    }
    
    /**
     * Odjava korisnika
     */
    async odjava() {
        prikaziLoading('Odjava...');
        try {
            await autentikacijaAPI.odjava();
            this.spremiKorisnika(null);
            prikaziUspjeh(PORUKE.USPJESNA_ODJAVA);
            window.location.hash = '#/prijava';
        } catch (greska) {
            console.error('Greška pri odjavi:', greska);
            // Prisilna odjava čak i ako API poziv ne uspije
            this.spremiKorisnika(null);
            window.location.hash = '#/prijava';
        } finally {
            sakrijLoading();
        }
    }
    
    /**
     * Provjerava validnost sesije (opciono - poziva se pri pokretanju app-a)
     */
    async provjeriSesiju() {
        if (!this.jePrijavljen()) {
            return false;
        }
        
        try {
            const odgovor = await autentikacijaAPI.mojeInfo();
            if (odgovor.success) {
                // Ažurira podatke korisnika
                this.spremiKorisnika(odgovor.user);
                return true;
            } else {
                // Sesija nevažeća, briše localStorage
                this.spremiKorisnika(null);
                return false;
            }
        } catch (greska) {
            console.error('Provjera sesije neuspješna:', greska);
            this.spremiKorisnika(null);
            return false;
        }
    }
    
    /**
     * Zahtijeva autentikaciju (preusmjerava ako nije prijavljen)
     */
    zahtijevaPrijavu() {
        if (!this.jePrijavljen()) {
            window.location.hash = '#/prijava';
            return false;
        }
        return true;
    }
    
    /**
     * Zahtijeva admin rolu
     */
    zahtijevaAdmin() {
        if (!this.jeAdmin()) {
            prikaziGresku(PORUKE.NEMA_PRISTUP);
            window.location.hash = '#/pocetna';
            return false;
        }
        return true;
    }
}

// Kreira i izvozi singleton instancu
const autentikacija = new MenadzerAutentikacije();

// NOTE: Logout handler is in app_main.js only - this module is legacy
// Postavlja slušatelje pri učitavanju DOM-a
document.addEventListener('DOMContentLoaded', () => {
    // Ažurira UI na osnovu stanja autentikacije
    autentikacija.priPromjeniAutentikacije((korisnik) => {
        const navbar = document.getElementById('navbar');
        const korisnickoImePrikaz = document.getElementById('username-display');
        const rolaPrikaz = document.getElementById('user-role');
        
        if (korisnik) {
            navbar?.classList.remove('hidden');
            
            if (korisnickoImePrikaz) {
                korisnickoImePrikaz.textContent = korisnik.username;
            }
            
            if (rolaPrikaz) {
                rolaPrikaz.textContent = NAZIVI_ROLA[korisnik.role] || korisnik.role;
                rolaPrikaz.className = `role-badge ${korisnik.role}`;
            }
        } else {
            navbar?.classList.add('hidden');
        }
    });
});

export default autentikacija;
