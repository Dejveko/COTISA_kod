/**
 * Konfiguracija aplikacije - sve konstante na jednom mjestu
 */

// API konfiguracija
export const API_CONFIG = {
    BASE_URL: `${window.location.origin}/api`,
    TIMEOUT: 30000, // 30 sekundi
};

// Rute aplikacije
export const RUTE = {
    PRIJAVA: '/prijava',
    REGISTRACIJA: '/registracija',
    POCETNA: '/pocetna',
    STVORI_TURNIR: '/turnir/stvori',
    PRIDRUZI_TURNIR: '/turnir/pridruzi',
    DETALJI_TURNIRA: '/turnir/detalji',
    PROFIL: '/profil',
};

// API endpointi
export const API_ENDPOINTI = {
    // Autentikacija
    REGISTRACIJA: '/register/',
    PRIJAVA: '/login/',
    ODJAVA: '/logout/',
    MOJE_INFO: '/me/',
    
    // Turniri
    SVI_TURNIRI: '/tournaments/',
    MOJI_TURNIRI: '/tournaments/my/',
    DETALJI_TURNIRA: (id) => `/tournaments/${id}/`,
    STVORI_TURNIR: '/tournaments/create/',
    PRIDRUZI_TURNIR: '/tournaments/join/',
    POKRENI_TURNIR: (id) => `/tournaments/${id}/start/`,
    SUDIONICI: (id) => `/tournaments/${id}/participants/`,
    MECEVI: (id) => `/tournaments/${id}/matches/`,
    
    // Mecevi
    REZULTAT_MECA: (id) => `/matches/${id}/result/`,
    
    // Profil
    PROFIL_IGRACA: (id) => `/players/${id}/`,
    AZURIRAJ_PROFIL: '/profile/update/',
    POVIJEST: '/profile/history/',
    STATISTIKA: '/profile/stats/',
};

// LocalStorage ključevi
export const STORAGE_KEYS = {
    KORISNIK: 'cotisa_korisnik',
    SESIJA: 'cotisa_sesija',
};

// Poruke aplikacije
export const PORUKE = {
    // Uspjeh
    USPJESNA_PRIJAVA: 'Uspješno ste prijavljeni!',
    USPJESNA_REGISTRACIJA: 'Račun uspješno kreiran!',
    USPJESNA_ODJAVA: 'Uspješno ste odjavljeni',
    TURNIR_KREIRAN: 'Turnir uspješno kreiran!',
    USPJESNO_PRIDRUZIVANJE: 'Uspješno ste se pridružili turniru!',
    KOD_KOPIRAN: 'Kod kopiran u međuspremnik!',
    REZULTAT_ZAPISAN: 'Rezultat uspješno zabilježen!',
    
    // Greške
    GRESKA_PRIJAVA: 'Greška pri prijavi',
    GRESKA_REGISTRACIJA: 'Greška pri registraciji',
    GRESKA_UCITAVANJE: 'Greška pri učitavanju podataka',
    GRESKA_KREIRANJE_TURNIRA: 'Greška pri kreiranju turnira',
    GRESKA_PRIDRUZIVANJE: 'Greška pri pridruživanju turniru',
    GRESKA_KOPIRANJE: 'Greška pri kopiranju',
    GRESKA_AZURIRANJE: 'Greška pri ažuriranju',
    
    // Validacija
    POPUNI_SVA_POLJA: 'Molimo popunite sva obavezna polja',
    NEISPRAVNA_EMAIL: 'Unesite ispravnu email adresu',
    LOZINKA_PREKRATKA: 'Lozinka mora imati najmanje 6 znakova',
    LOZINKE_SE_NE_PODUDARAJU: 'Lozinke se ne podudaraju',
    NEISPRAVAN_KOD: 'Kod mora imati točno 6 znamenki',
    KORISNICKO_IME_PREKRATKO: 'Korisničko ime mora imati najmanje 3 znaka',
    
    // Upozorenja
    NEMA_PRISTUPA: 'Nemate pristup ovoj stranici',
    SESIJA_ISTEKLA: 'Vaša sesija je istekla, prijavite se ponovno',
    POTVRDA_BRISANJA: 'Jeste li sigurni?',
};

// Tipovi turnira
export const TIPOVI_TURNIRA = {
    ELIMINACIJA: 'elimination',
    SVI_PROTIV_SVIH: 'round_robin',
};

// Nazivi tipova turnira (za prikaz)
export const NAZIVI_TURNIRA = {
    [TIPOVI_TURNIRA.ELIMINACIJA]: 'Eliminacija',
    [TIPOVI_TURNIRA.SVI_PROTIV_SVIH]: 'Svi protiv svih',
};

// Statusi turnira
export const STATUS_TURNIRA = {
    NA_CEKANJU: 'pending',
    AKTIVAN: 'active',
    ZAVRSEN: 'completed',
};

// Nazivi statusa (za prikaz)
export const NAZIVI_STATUSA = {
    [STATUS_TURNIRA.NA_CEKANJU]: 'Na čekanju',
    [STATUS_TURNIRA.AKTIVAN]: 'Aktivan',
    [STATUS_TURNIRA.ZAVRSEN]: 'Završen',
};

// Role korisnika
export const ROLE = {
    ADMIN: 'admin',
    IGRAC: 'player',
};

// Nazivi rola (za prikaz)
export const NAZIVI_ROLA = {
    [ROLE.ADMIN]: 'Administrator',
    [ROLE.IGRAC]: 'Igrač',
};

// UI konfiguracija
export const UI_CONFIG = {
    TRAJANJE_TOASTA: 5000, // 5 sekundi
    ANIMACIJA_TRAJANJE: 300, // 0.3 sekunde
    DEBOUNCE_DELAY: 300, // 0.3 sekunde
};

// Validacija
export const VALIDACIJA = {
    MIN_DULJINA_KORISNICKOG_IMENA: 3,
    MIN_DULJINA_LOZINKE: 6,
    DULJINA_KODA: 6,
    MIN_IGRACA: 2,
    MAX_IGRACA: 128,
};

// Regex obrasci
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SAMO_BROJEVI: /^\d+$/,
    KOD_6_ZNAMENKI: /^\d{6}$/,
};

export default {
    API_CONFIG,
    RUTE,
    API_ENDPOINTI,
    STORAGE_KEYS,
    PORUKE,
    TIPOVI_TURNIRA,
    NAZIVI_TURNIRA,
    STATUS_TURNIRA,
    NAZIVI_STATUSA,
    ROLE,
    NAZIVI_ROLA,
    UI_CONFIG,
    VALIDACIJA,
    REGEX,
};
