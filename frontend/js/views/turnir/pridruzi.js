/**
 * View - Pridruživanje turniru s 6-znamenkastim kodom
 */

import autentikacija from '../../core/autentikacija.js';
import usmjerivac from '../../core/usmjerivac.js';
import { turnirAPI } from '../../core/api.js';
import { prikaziUspjeh, prikaziGresku } from '../../components/Toast.js';
import { prikaziLoading, sakrijLoading } from '../../components/Loading.js';
import { validirajKod } from '../../utils/validacija.js';
import { dohvatiElement, dodajListener } from '../../utils/dom.js';
import { PORUKE, VALIDACIJA } from '../../config/konstante.js';

/**
 * Prikazuje stranicu za pridruživanje turniru
 */
export default async function prikaziPridruzivanjeTurniru() {
    // Zahtijeva autentikaciju
    if (!autentikacija.zahtijevaPrijavu()) return;
    
    const app = dohvatiElement('app');
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>🔑 Pridruži se turniru</h2>
                    <p>Unesite 6-znamenkasti kod turnira</p>
                </div>
                
                <div style="padding: 2rem 0;">
                    <div class="code-input">
                        <input type="text" class="digit-input" maxlength="1" data-index="0" pattern="[0-9]" inputmode="numeric">
                        <input type="text" class="digit-input" maxlength="1" data-index="1" pattern="[0-9]" inputmode="numeric">
                        <input type="text" class="digit-input" maxlength="1" data-index="2" pattern="[0-9]" inputmode="numeric">
                        <input type="text" class="digit-input" maxlength="1" data-index="3" pattern="[0-9]" inputmode="numeric">
                        <input type="text" class="digit-input" maxlength="1" data-index="4" pattern="[0-9]" inputmode="numeric">
                        <input type="text" class="digit-input" maxlength="1" data-index="5" pattern="[0-9]" inputmode="numeric">
                    </div>
                    
                    <div id="poruka-greske" class="text-center" style="color: var(--accent); margin-top: 1rem;"></div>
                </div>
                
                <div class="flex-between">
                    <button type="button" class="btn btn-secondary" id="gumb-natrag">
                        ← Natrag
                    </button>
                    <button type="button" class="btn btn-primary" id="gumb-pridruzi" disabled>
                        Pridruži se
                    </button>
                </div>
            </div>
            
            <!-- Info kartica -->
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h3 style="margin-bottom: 1rem;">💡 Kako dobiti kod?</h3>
                <p style="opacity: 0.9;">
                    Kod turnira dobivate od organizatora turnira. To je jedinstveni 6-znamenkasti broj
                    koji omogućuje pristup turniru. Pitajte organizatora za kod ili provjerite pozivnicu.
                </p>
            </div>
        </div>
    `;
    
    // Dohvaća elemente
    const polja = document.querySelectorAll('.digit-input');
    const gumbPridruzi = dohvatiElement('gumb-pridruzi');
    const porukGreske = dohvatiElement('poruka-greske');
    
    // Fokusira prvo polje
    polja[0]?.focus();
    
    // Handler za unos
    polja.forEach((polje, indeks) => {
        // Samo brojevi
        dodajListener(polje, 'input', (e) => {
            const vrijednost = e.target.value;
            
            // Uklanja ne-brojeve
            if (!/^\d*$/.test(vrijednost)) {
                e.target.value = '';
                return;
            }
            
            // Auto-fokus na sljedeće polje
            if (vrijednost && indeks < polja.length - 1) {
                polja[indeks + 1].focus();
            }
            
            // Ažurira stanje gumba
            azurirajGumbPridruzi();
            porukGreske.textContent = '';
        });
        
        // Backspace navigacija
        dodajListener(polje, 'keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && indeks > 0) {
                polja[indeks - 1].focus();
                polja[indeks - 1].value = '';
            }
        });
        
        // Paste handler - omogućava lijepljenje cijelog koda
        dodajListener(polje, 'paste', (e) => {
            e.preventDefault();
            const zalijepljeno = e.clipboardData.getData('text').replace(/\D/g, '');
            
            if (zalijepljeno.length === VALIDACIJA.DULJINA_KODA) {
                polja.forEach((p, i) => {
                    p.value = zalijepljeno[i] || '';
                });
                polja[polja.length - 1].focus();
                azurirajGumbPridruzi();
            }
        });
    });
    
    /**
     * Ažurira stanje gumba za pridruživanje
     */
    function azurirajGumbPridruzi() {
        const kod = Array.from(polja).map(p => p.value).join('');
        gumbPridruzi.disabled = kod.length !== VALIDACIJA.DULJINA_KODA;
    }
    
    /**
     * Dohvaća uneseni kod
     */
    function dohvatiKod() {
        return Array.from(polja).map(p => p.value).join('');
    }
    
    /**
     * Resetuje polja
     */
    function resetujPolja() {
        polja.forEach(p => p.value = '');
        polja[0]?.focus();
        azurirajGumbPridruzi();
    }
    
    // Slušatelj za natrag gumb
    dodajListener(dohvatiElement('gumb-natrag'), 'click', () => {
        usmjerivac.natrag();
    });
    
    // Slušatelj za pridruživanje
    dodajListener(gumbPridruzi, 'click', async () => {
        const kod = dohvatiKod();
        
        // Validacija
        if (!validirajKod(kod)) {
            porukGreske.textContent = 'Neispravan kod. Unesite 6 znamenki.';
            resetujPolja();
            return;
        }
        
        // Onemogućava gumb
        gumbPridruzi.disabled = true;
        porukGreske.textContent = '';
        
        try {
            prikaziLoading('Pridruživanje turniru...');
            const rezultat = await turnirAPI.pridruziSe(kod);
            sakrijLoading();
            
            if (rezultat.success) {
                prikaziUspjeh(PORUKE.USPJESNO_PRIDRUZIVANJE);
                
                // Preusmjerava na detalje turnira
                setTimeout(() => {
                    usmjerivac.idi(`/turnir/${rezultat.tournament.id}`);
                }, 1500);
            } else {
                throw new Error(rezultat.error || PORUKE.GRESKA_PRIDRUZIVANJE);
            }
        } catch (greska) {
            sakrijLoading();
            console.error('Greška pri pridruživanju:', greska);
            porukGreske.textContent = greska.message || PORUKE.GRESKA_PRIDRUZIVANJE;
            resetujPolja();
            gumbPridruzi.disabled = false;
        }
    });
    
    // Enter za submit
    polja.forEach(polje => {
        dodajListener(polje, 'keypress', (e) => {
            if (e.key === 'Enter' && !gumbPridruzi.disabled) {
                gumbPridruzi.click();
            }
        });
    });
}
