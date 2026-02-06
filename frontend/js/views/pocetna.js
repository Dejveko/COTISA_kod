/**
 * View - Početna stranica (Dashboard)
 */

import autentikacija from '../core/autentikacija.js';
import usmjerivac from '../core/usmjerivac.js';
import { turnirAPI } from '../core/api.js';
import { prikaziGresku } from '../components/Toast.js';
import { prikaziLoading, sakrijLoading } from '../components/Loading.js';
import { karticaTurnira, praznaKartica, loadingKartica, gridKartica } from '../components/Card.js';
import { dohvatiElement, postaviHTML, dodajListener } from '../utils/dom.js';
import { PORUKE } from '../config/konstante.js';

/**
 * Prikazuje početnu stranicu s turniirma
 */
export default async function prikaziPocetnu() {
    // Zahtijeva autentikaciju
    if (!autentikacija.zahtijevaPrijavu()) return;
    
    const korisnik = autentikacija.dohvatiKorisnika();
    const app = dohvatiElement('app');
    
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>👋 Dobrodošli, ${korisnik.username}!</h2>
                    <p>Upravljajte svojim turnirima i pratite natjecanja</p>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-success" id="gumb-stvori-turnir">
                        ➕ Stvori novi turnir
                    </button>
                    <button class="btn btn-primary" id="gumb-pridruzi-turnir">
                        🔑 Pridruži se s kodom
                    </button>
                    <button class="btn btn-secondary" id="gumb-osvjezi">
                        🔄 Osvježi
                    </button>
                </div>
            </div>
            
            <!-- Moji turniri -->
            <div class="card">
                <div class="card-header">
                    <h2>Moji turniri</h2>
                </div>
                <div id="moji-turniri-lista">
                    <!-- Popunjava se dinamički -->
                </div>
            </div>
            
            <!-- Svi aktivni turniri -->
            <div class="card">
                <div class="card-header">
                    <h2>Svi aktivni turniri</h2>
                </div>
                <div id="svi-turniri-lista">
                    <!-- Popunjava se dinamički -->
                </div>
            </div>
        </div>
    `;
    
    // Slušatelji za gumbove
    dodajListener(dohvatiElement('gumb-stvori-turnir'), 'click', () => {
        usmjerivac.idi('/turnir/stvori');
    });
    
    dodajListener(dohvatiElement('gumb-pridruzi-turnir'), 'click', () => {
        usmjerivac.idi('/turnir/pridruzi');
    });
    
    dodajListener(dohvatiElement('gumb-osvjezi'), 'click', () => {
        ucitajTurnire();
    });
    
    // Učitava turnire
    await ucitajTurnire();
}

/**
 * Učitava sve turnire
 */
async function ucitajTurnire() {
    const mojiTurniriKontejner = dohvatiElement('moji-turniri-lista');
    const sviTurniriKontejner = dohvatiElement('svi-turniri-lista');
    
    // Prikazuje loading kartice
    postaviHTML(mojiTurniriKontejner, '');
    mojiTurniriKontejner.appendChild(loadingKartica());
    
    postaviHTML(sviTurniriKontejner, '');
    sviTurniriKontejner.appendChild(loadingKartica());
    
    try {
        // Učitava moje turnire
        const mojiOdgovor = await turnirAPI.dohvatiMoje();
        if (mojiOdgovor.success) {
            prikaziListuTurnira(mojiTurniriKontejner, mojiOdgovor.tournaments, true);
        } else {
            throw new Error(mojiOdgovor.error || PORUKE.GRESKA_UCITAVANJE);
        }
        
        // Učitava sve turnire
        const sviOdgovor = await turnirAPI.dohvatiSve();
        if (sviOdgovor.success) {
            prikaziListuTurnira(sviTurniriKontejner, sviOdgovor.tournaments, false);
        } else {
            throw new Error(sviOdgovor.error || PORUKE.GRESKA_UCITAVANJE);
        }
    } catch (greska) {
        console.error('Greška pri učitavanju turnira:', greska);
        prikaziGresku(PORUKE.GRESKA_UCITAVANJE);
        
        // Prikazuje prazne kartice s greškom
        postaviHTML(mojiTurniriKontejner, '');
        mojiTurniriKontejner.appendChild(
            praznaKartica('Greška pri učitavanju turnira', '⚠️')
        );
        
        postaviHTML(sviTurniriKontejner, '');
        sviTurniriKontejner.appendChild(
            praznaKartica('Greška pri učitavanju turnira', '⚠️')
        );
    }
}

/**
 * Prikazuje listu turnira kao kartice
 * @param {HTMLElement} kontejner - Kontejner element
 * @param {Array} turniri - Array turnira
 * @param {boolean} prikaziKod - Da li prikazati turnirski kod
 */
function prikaziListuTurnira(kontejner, turniri, prikaziKod = false) {
    // Briše sadržaj
    postaviHTML(kontejner, '');
    
    // Ako nema turnira
    if (!turniri || turniri.length === 0) {
        const poruka = prikaziKod 
            ? 'Stvorite svoj prvi turnir!' 
            : 'Trenutno nema aktivnih turnira';
        kontejner.appendChild(praznaKartica(poruka, '🏆'));
        return;
    }
    
    // Kreira kartice
    const kartice = turniri.map(turnir => {
        // Handler za detalje
        const prikaziDetalje = (id) => {
            usmjerivac.idi(`/turnir/${id}`);
        };
        
        // Handler za pridruživanje (samo za listu svih turnira)
        const pridruzise = !prikaziKod ? (id) => {
            // Implementirati kasnije - možda modal za unos koda?
            usmjerivac.idi('/turnir/pridruzi');
        } : null;
        
        return karticaTurnira(turnir, prikaziDetalje, pridruzise);
    });
    
    // Dodaje grid s karticama
    const grid = gridKartica(kartice);
    kontejner.appendChild(grid);
    
    // Ako je "moji turniri", dodaje funkciju kopiranja koda
    if (prikaziKod) {
        dodajKopiranjKoda(kontejner);
    }
}

/**
 * Dodaje funkcionalnost kopiranja turnirskog koda
 * @param {HTMLElement} kontejner - Kontejner s karticama
 */
function dodajKopiranjKoda(kontejner) {
    const kartice = kontejner.querySelectorAll('.tournament-card');
    
    kartice.forEach(kartica => {
        const kodElement = kartica.querySelector('.tournament-code');
        if (kodElement) {
            kodElement.style.cursor = 'pointer';
            kodElement.title = 'Klikni za kopiranje koda';
            
            dodajListener(kodElement, 'click', async (e) => {
                e.stopPropagation();
                const kod = kodElement.textContent;
                
                try {
                    await navigator.clipboard.writeText(kod);
                    
                    // Privremeno prikazuje "Kopirano!"
                    const originalTekst = kodElement.textContent;
                    kodElement.textContent = '✓ Kopirano!';
                    setTimeout(() => {
                        kodElement.textContent = originalTekst;
                    }, 2000);
                } catch (greska) {
                    console.error('Greška pri kopiranju:', greska);
                }
            });
        }
    });
}
