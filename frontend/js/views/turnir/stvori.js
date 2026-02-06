/**
 * View - Stvaranje novog turnira
 */

import autentikacija from '../../core/autentikacija.js';
import usmjerivac from '../../core/usmjerivac.js';
import { turnirAPI } from '../../core/api.js';
import { prikaziUspjeh, prikaziGresku } from '../../components/Toast.js';
import { prikaziLoading, sakrijLoading } from '../../components/Loading.js';
import { potvrdaModal } from '../../components/Modal.js';
import { 
    prikupiPodatke, 
    postaviOnemogucenjeForme, 
    prikaziGreskuPolja,
    ukloniGreskuPolja 
} from '../../utils/forme.js';
import { 
    validirajBrojIgraca, 
    jePotencijaBroja2, 
    sanitizirajUnos 
} from '../../utils/validacija.js';
import { dohvatiElement, dohvatiVrijednost, dodajListener } from '../../utils/dom.js';
import { PORUKE, TIPOVI_TURNIRA, NAZIVI_TURNIRA } from '../../config/konstante.js';

/**
 * Prikazuje stranicu za stvaranje turnira
 */
export default async function prikaziStvaranjeTurnira() {
    // Zahtijeva autentikaciju
    if (!autentikacija.zahtijevaPrijavu()) return;
    
    const app = dohvatiElement('app');
    app.innerHTML = `
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2>➕ Stvori novi turnir</h2>
                    <p>Popunite podatke za kreiranje novog turnira</p>
                </div>
                
                <form id="forma-turnir">
                    <div class="form-group">
                        <label for="naziv-turnira">Naziv turnira *</label>
                        <input 
                            type="text" 
                            id="naziv-turnira" 
                            name="name"
                            class="form-control" 
                            placeholder="npr. Proljetni kup 2025"
                            required
                            minlength="3"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="tip-turnira">Tip turnira *</label>
                        <select id="tip-turnira" name="tournament_type" class="form-control" required>
                            <option value="">-- Odaberite tip --</option>
                            <option value="${TIPOVI_TURNIRA.ELIMINACIJA}">${NAZIVI_TURNIRA[TIPOVI_TURNIRA.ELIMINACIJA]}</option>
                            <option value="${TIPOVI_TURNIRA.SVI_PROTIV_SVIH}">${NAZIVI_TURNIRA[TIPOVI_TURNIRA.SVI_PROTIV_SVIH]}</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="max-igraca">Maksimalan broj igrača *</label>
                        <input 
                            type="number" 
                            id="max-igraca" 
                            name="max_participants"
                            class="form-control" 
                            placeholder="npr. 8, 16, 32"
                            required
                            min="2"
                            max="128"
                        >
                        <small style="color: var(--text-secondary); font-size: 0.9rem;">
                            Za eliminaciju preporučeni brojevi: 4, 8, 16, 32 (potencija broja 2)
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="opis">Opis turnira (opcionalno)</label>
                        <textarea 
                            id="opis" 
                            name="description"
                            class="form-control" 
                            rows="4"
                            placeholder="Dodajte opis, pravila ili napomene za igrače..."
                        ></textarea>
                    </div>
                    
                    <div class="flex-between" style="margin-top: 2rem;">
                        <button type="button" class="btn btn-secondary" id="gumb-natrag">
                            ← Natrag
                        </button>
                        <button type="submit" class="btn btn-success">
                            🏆 Stvori turnir
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Slušatelj za natrag gumb
    dodajListener(dohvatiElement('gumb-natrag'), 'click', () => {
        usmjerivac.natrag();
    });
    
    // Validacija broja igrača na promjenu
    const maxIgracaPolje = dohvatiElement('max-igraca');
    const tipTurniraPolje = dohvatiElement('tip-turnira');
    
    dodajListener(maxIgracaPolje, 'blur', () => {
        const brojIgraca = parseInt(dohvatiVrijednost('max-igraca'));
        const tipTurnira = dohvatiVrijednost('tip-turnira');
        
        if (brojIgraca) {
            const validacija = validirajBrojIgraca(brojIgraca);
            
            if (!validacija.validan) {
                prikaziGreskuPolja('max-igraca', validacija.poruka);
            } else if (tipTurnira === TIPOVI_TURNIRA.ELIMINACIJA && !jePotencijaBroja2(brojIgraca)) {
                prikaziGreskuPolja('max-igraca', 
                    'Za eliminaciju broj igrača mora biti potencija broja 2 (4, 8, 16, 32...)'
                );
            } else {
                ukloniGreskuPolja('max-igraca');
            }
        }
    });
    
    // Slušatelj za submit forme
    const forma = dohvatiElement('forma-turnir');
    dodajListener(forma, 'submit', async (e) => {
        e.preventDefault();
        
        // Prikuplja podatke
        const podaci = prikupiPodatke(forma);
        
        // Validacija
        const brojIgraca = parseInt(podaci.max_participants);
        const validacija = validirajBrojIgraca(brojIgraca);
        
        if (!validacija.validan) {
            prikaziGreskuPolja('max-igraca', validacija.poruka);
            return;
        }
        
        // Dodatna validacija za eliminaciju
        if (podaci.tournament_type === TIPOVI_TURNIRA.ELIMINACIJA && 
            !jePotencijaBroja2(brojIgraca)) {
            prikaziGreskuPolja('max-igraca', 
                'Za eliminaciju broj igrača mora biti potencija broja 2'
            );
            return;
        }
        
        // Potvrda
        const potvrda = await potvrdaModal(
            `Želite li stvoriti turnir "${podaci.name}"?`,
            'Potvrda stvaranja turnira'
        );
        
        if (!potvrda) return;
        
        // Onemogućava formu
        postaviOnemogucenjeForme(forma, true);
        
        try {
            prikaziLoading('Stvaranje turnira...');
            const rezultat = await turnirAPI.stvori(podaci);
            sakrijLoading();
            
            if (rezultat.success) {
                prikaziUspjeh(PORUKE.TURNIR_STVOREN);
                
                // Preusmjerava na detalje turnira
                setTimeout(() => {
                    usmjerivac.idi(`/turnir/${rezultat.tournament.id}`);
                }, 1500);
            } else {
                throw new Error(rezultat.error || PORUKE.GRESKA_STVARANJE_TURNIRA);
            }
        } catch (greska) {
            sakrijLoading();
            console.error('Greška pri stvaranju turnira:', greska);
            prikaziGresku(greska.message || PORUKE.GRESKA_STVARANJE_TURNIRA);
            postaviOnemogucenjeForme(forma, false);
        }
    });
}
