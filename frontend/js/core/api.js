/**
 * API Servis - Upravlja svim Django REST API pozivima
 */

import { API_CONFIG, API_ENDPOINTI } from '../config/konstante.js';

/**
 * Dohvaća CSRF token iz cookieja
 * @param {string} ime - Ime cookieja
 * @returns {string|null} - Vrijednost cookieja
 */
function dohvatiCookie(ime) {
    let vrijednost = null;
    if (document.cookie && document.cookie !== '') {
        const cookieji = document.cookie.split(';');
        for (let i = 0; i < cookieji.length; i++) {
            const cookie = cookieji[i].trim();
            if (cookie.substring(0, ime.length + 1) === (ime + '=')) {
                vrijednost = decodeURIComponent(cookie.substring(ime.length + 1));
                break;
            }
        }
    }
    return vrijednost;
}

/**
 * Osnovna fetch funkcija s obradom grešaka
 * @param {string} endpoint - API endpoint
 * @param {Object} opcije - Fetch opcije
 * @returns {Promise<Object>} - JSON odgovor
 */
async function apiPoziv(endpoint, opcije = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOpcije = {
        credentials: 'include', // Uključuje cookies za autentikaciju
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': dohvatiCookie('csrftoken'),
        },
    };
    
    const spojeneOpcije = { ...defaultOpcije, ...opcije };
    
    // Spaja headere posebno da ne prepiše
    if (opcije.headers) {
        spojeneOpcije.headers = { ...defaultOpcije.headers, ...opcije.headers };
    }
    
    try {
        const odgovor = await fetch(url, spojeneOpcije);
        const podaci = await odgovor.json();
        
        if (!odgovor.ok) {
            throw new Error(podaci.error || podaci.message || 'API poziv neuspješan');
        }
        
        return podaci;
    } catch (greska) {
        console.error('API Greška:', greska);
        throw greska;
    }
}

/**
 * API za autentikaciju
 */
export const autentikacijaAPI = {
    /**
     * Registrira novog korisnika
     */
    registracija: async (korisnicko_ime, email, lozinka) => {
        return apiPoziv(API_ENDPOINTI.REGISTRACIJA, {
            method: 'POST',
            body: JSON.stringify({ 
                username: korisnicko_ime, 
                email, 
                password: lozinka 
            }),
        });
    },
    
    /**
     * Prijava korisnika
     */
    prijava: async (korisnicko_ime, lozinka) => {
        return apiPoziv(API_ENDPOINTI.PRIJAVA, {
            method: 'POST',
            body: JSON.stringify({ 
                username: korisnicko_ime, 
                password: lozinka 
            }),
        });
    },
    
    /**
     * Odjava korisnika
     */
    odjava: async () => {
        return apiPoziv(API_ENDPOINTI.ODJAVA, {
            method: 'POST',
        });
    },
    
    /**
     * Dohvaća info o trenutnom korisniku
     */
    mojeInfo: async () => {
        return apiPoziv(API_ENDPOINTI.MOJE_INFO);
    },
};

/**
 * API za turnire
 */
export const turnirAPI = {
    /**
     * Dohvaća sve turnire (javni)
     */
    dohvatiSve: async () => {
        return apiPoziv(API_ENDPOINTI.SVI_TURNIRI);
    },
    
    /**
     * Dohvaća moje turnire
     */
    dohvatiMoje: async () => {
        return apiPoziv(API_ENDPOINTI.MOJI_TURNIRI);
    },
    
    /**
     * Dohvaća turnir po ID-u
     */
    dohvatiPoId: async (id) => {
        return apiPoziv(API_ENDPOINTI.DETALJI_TURNIRA(id));
    },
    
    /**
     * Kreira novi turnir
     */
    stvori: async (podaciTurnira) => {
        return apiPoziv(API_ENDPOINTI.STVORI_TURNIR, {
            method: 'POST',
            body: JSON.stringify(podaciTurnira),
        });
    },
    
    /**
     * Pridružuje se turniru s kodom
     */
    pridruziSe: async (kod) => {
        return apiPoziv(API_ENDPOINTI.PRIDRUZI_TURNIR, {
            method: 'POST',
            body: JSON.stringify({ code: kod }),
        });
    },
    
    /**
     * Pokreće turnir (samo admin/kreator)
     */
    pokreni: async (id) => {
        return apiPoziv(API_ENDPOINTI.POKRENI_TURNIR(id), {
            method: 'POST',
        });
    },
    
    /**
     * Ažurira rezultat meča
     */
    azurirajMec: async (mecId, pobjednikId) => {
        return apiPoziv(API_ENDPOINTI.REZULTAT_MECA(mecId), {
            method: 'POST',
            body: JSON.stringify({ winner_id: pobjednikId }),
        });
    },
    
    /**
     * Dohvaća sudionike turnira
     */
    dohvatiSudionike: async (turnirId) => {
        return apiPoziv(API_ENDPOINTI.SUDIONICI(turnirId));
    },
    
    /**
     * Dohvaća mečeve turnira
     */
    dohvatiMeceve: async (turnirId) => {
        return apiPoziv(API_ENDPOINTI.MECEVI(turnirId));
    },
};

/**
 * API za igrače i profile
 */
export const igracAPI = {
    /**
     * Dohvaća profil igrača
     */
    dohvatiProfil: async (igracId) => {
        return apiPoziv(API_ENDPOINTI.PROFIL_IGRACA(igracId));
    },
    
    /**
     * Ažurira profil
     */
    azurirajProfil: async (podaci) => {
        return apiPoziv(API_ENDPOINTI.AZURIRAJ_PROFIL, {
            method: 'POST',
            body: JSON.stringify(podaci),
        });
    },
    
    /**
     * Dohvaća povijest igrača
     */
    dohvatiPovijest: async () => {
        return apiPoziv(API_ENDPOINTI.POVIJEST);
    },
    
    /**
     * Dohvaća statistiku igrača
     */
    dohvatiStatistiku: async () => {
        return apiPoziv(API_ENDPOINTI.STATISTIKA);
    },
};

// Izvozi sve API-je
export default {
    autentikacija: autentikacijaAPI,
    turniri: turnirAPI,
    igraci: igracAPI,
};
