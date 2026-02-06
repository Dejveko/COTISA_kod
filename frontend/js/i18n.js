/**
 * COTISA - Internationalization (i18n) System
 * Sustav za višejezičnost
 */

const translations = {
    hr: {
        // Navigation
        'nav.home': 'Početna',
        'nav.players': 'Igrači',
        'nav.profile': 'Profil',
        'nav.admin': 'Admin',
        'nav.settings': 'Postavke',
        'nav.help': 'Pomoć',
        'nav.logout': 'Odjava',
        
        // Common
        'common.save': 'Spremi',
        'common.cancel': 'Odustani',
        'common.delete': 'Obriši',
        'common.edit': 'Uredi',
        'common.create': 'Stvori',
        'common.back': 'Natrag',
        'common.next': 'Dalje',
        'common.loading': 'Učitavanje...',
        'common.search': 'Pretraži',
        'common.close': 'Zatvori',
        'common.confirm': 'Potvrdi',
        'common.yes': 'Da',
        'common.no': 'Ne',
        'common.or': 'ili',
        'common.showAll': 'Prikaži sve',
        'common.error': 'Greška',
        
        // Auth
        'auth.login': 'Prijava',
        'auth.register': 'Registracija',
        'auth.username': 'Korisničko ime',
        'auth.password': 'Lozinka',
        'auth.email': 'Email',
        'auth.loginBtn': 'Prijavi se',
        'auth.registerBtn': 'Registriraj se',
        'auth.noAccount': 'Nemate račun?',
        'auth.hasAccount': 'Već imate račun?',
        'auth.loginWithGoogle': 'Prijava s Google računom',
        'auth.forgotPassword': 'Zaboravili ste lozinku?',
        'auth.loginSubtitle': 'Prijavite se na svoj račun',
        'auth.registerSubtitle': 'Kreirajte novi račun',
        'auth.usernamePlaceholder': 'Unesite korisničko ime',
        'auth.passwordPlaceholder': 'Unesite lozinku',
        'auth.emailPlaceholder': 'Unesite email adresu',
        'auth.confirmPassword': 'Potvrdite lozinku',
        'auth.confirmPasswordPlaceholder': 'Ponovo unesite lozinku',
        'auth.passwordMinHint': 'Unesite lozinku (min. 6 znakova)',
        'auth.experienceLevel': 'Vaše iskustvo u šahu',
        'auth.experienceSelect': '-- Odaberite nivo --',
        'auth.experienceBeginner': '🌱 Novi sam (400 ELO)',
        'auth.experienceIntermediate': '♟️ Poznajem igru (700 ELO)',
        'auth.experienceAdvanced': '👑 Iskusan sam (1000 ELO)',
        'auth.experienceHint': 'Ovo određuje vaš početni ELO rating. Ne brinite, rating će se automatski prilagođavati nakon prvih nekoliko partija.',
        'auth.usernameMinError': 'Korisničko ime mora imati najmanje 3 znaka',
        'auth.invalidEmailError': 'Unesite valjanu email adresu',
        'auth.passwordMinError': 'Lozinka mora imati najmanje 6 znakova',
        'auth.passwordMismatchError': 'Lozinke se ne podudaraju',
        'auth.formErrors': 'Molimo ispravite greške u formi',
        'auth.forgotPasswordInfo': 'Za resetiranje lozinke kontaktirajte administratora na support@cotisa.hr',
        'auth.enterCredentials': 'Unesite korisničko ime i lozinku',
        'auth.welcomeUser': 'Dobrodošli',
        'auth.loggingIn': 'Prijava u tijeku...',
        'auth.googleLoginError': 'Greška pri prijavi s Google računom',
        'auth.serverError': 'Greška pri povezivanju s poslužiteljem',
        
        // Dashboard
        'dashboard.welcome': 'Dobrodošli',
        'dashboard.subtitle': 'Upravljajte svojim turnirima i pratite natjecanja',
        'dashboard.createTournament': 'Stvori novi turnir',
        'dashboard.joinTournament': 'Pridruži se s kodom',
        'dashboard.refresh': 'Osvježi',
        'dashboard.activeTournaments': 'Svi aktivni turniri',
        'dashboard.loadingTournaments': 'Učitavam turnire...',
        'dashboard.noTournaments': 'Nema turnira',
        'dashboard.noTournamentsDesc': 'Trenutno nema aktivnih turnira',
        'dashboard.errorLoading': 'Greška pri učitavanju',
        'dashboard.joinSuccess': 'Uspješno ste se pridružili turniru!',
        'dashboard.joinError': 'Greška pri pridruživanju',
        'dashboard.noCode': 'Turnir nema kod',
        
        // Tournament
        'tournament.name': 'Naziv turnira',
        'tournament.type': 'Tip turnira',
        'tournament.elimination': 'Eliminacija',
        'tournament.roundRobin': 'Svi protiv svih',
        'tournament.players': 'Igrači',
        'tournament.created': 'Kreiran',
        'tournament.creator': 'Kreator',
        'tournament.createdBy': 'Kreirao',
        'tournament.status': 'Status',
        'tournament.active': 'Aktivan',
        'tournament.rating': 'Rating',
        'tournament.completed': 'Završen',
        'tournament.pending': 'Na čekanju',
        'tournament.details': 'Detalji',
        'tournament.join': 'Pridruži se',
        'tournament.joinTitle': 'Pridruži se turniru',
        'tournament.start': 'Pokreni turnir',
        'tournament.code': 'Turnirski kod',
        'tournament.codeForJoin': 'Turnirski kod za pridruživanje',
        'tournament.copyCode': 'Kopiraj kod',
        'tournament.enterCode': 'Unesite 6-znamenkasti kod turnira',
        'tournament.delete': 'Obriši turnir',
        'tournament.participants': 'Sudionici',
        'tournament.noParticipants': 'Nema sudionika',
        'tournament.noParticipantsDesc': 'Još nitko se nije pridružio turniru',
        'tournament.matches': 'Mečevi',
        'tournament.back': 'Natrag',
        'tournament.create': 'Stvori turnir',
        'tournament.createTitle': 'Stvori novi turnir',
        'tournament.createSubtitle': 'Popunite podatke za kreiranje novog turnira',
        'tournament.tournamentName': 'Naziv turnira',
        'tournament.maxPlayers': 'Maksimalan broj igrača',
        'tournament.timePerPlayer': 'Vrijeme po igraču (minute)',
        'tournament.increment': 'Inkrement po potezu (sekunde)',
        'tournament.advancedSettings': 'Napredne postavke',
        'tournament.tournamentType': 'Tip turnira',
        'tournament.typeElimination': 'Eliminacija (Bracket)',
        'tournament.typeRoundRobin': 'Svi protiv svih',
        'tournament.pairingSystem': 'Sistem uparivanja',
        'tournament.pairingRandom': 'Nasumično',
        'tournament.pairingRating': 'Po ratingu',
        'tournament.pairingSwiss': 'Švicarski sistem',
        'tournament.pairingManual': 'Ručno',
        'tournament.pairingHint': 'Način kako će igrači biti upareni u mečeve',
        'tournament.startDate': 'Datum početka',
        'tournament.startDateHint': 'Turnir traje dok svi igrači ne završe svoje partije',
        'tournament.description': 'Opis turnira (opcionalno)',
        'tournament.descriptionPlaceholder': 'Dodajte opis, pravila ili napomene za igrače...',
        'tournament.isPublic': 'Javan turnir',
        'tournament.isPublicHint': 'Ako je označeno, turnir će biti vidljiv na listi "Svi turniri".',
        'tournament.creatorPlays': 'Igram kao sudionik',
        'tournament.creatorPlaysHint': 'Ako nije označeno, bit ćete samo organizator i možete promatrati igre.',
        'tournament.namePlaceholder': 'npr. Proljetni kup 2025',
        'tournament.maxPlayersPlaceholder': 'npr. 8, 16, 32',
        'tournament.maxPlayersHint': 'Za eliminaciju preporučeni brojevi: 4, 8, 16, 32. Za svi-protiv-svih bilo koji broj.',
        'tournament.timePlaceholder': 'npr. 5, 10, 15',
        'tournament.timeHint': 'Vrijeme u minutama po igraču. Bullet: ≤3 min | Blitz: 3-10 min | Rapid: 10-60 min | Classical: >60 min',
        'tournament.incrementPlaceholder': 'npr. 0, 2, 5',
        'tournament.incrementHint': 'Dodatne sekunde koje se dodaju nakon svakog poteza (0 za bez incrementa)',
        'tournament.howToGetCode': 'Kako dobiti kod?',
        'tournament.codeExplanation': 'Kod turnira dobivate od organizatora turnira. To je jedinstveni 6-znamenkasti broj koji omogućuje pristup turniru.',
        'tournament.yourCode': 'Vaš turnirski kod',
        'tournament.startConfirm': 'Želite li pokrenuti turnir? Nakon pokretanja više se neće moći pridružiti novi igrači.',
        'tournament.startSuccess': 'Turnir uspješno pokrenut!',
        'tournament.delete': 'Obriši turnir',
        'tournament.codeCopied': 'Kod kopiran!',
        'tournament.elo': 'ELO',
        'tournament.seed': 'Seed',
        'tournament.provisional': 'Provizorno',
        'tournament.eliminated': 'Eliminiran',
        'tournament.loading': 'Učitavam turnir...',
        'tournament.noMatches': 'Nema mečeva',
        'tournament.match': 'Meč',
        'tournament.finished': 'Završeno',
        'tournament.inProgress': 'U tijeku',
        'tournament.round': 'Runda',
        'tournament.winner': 'Pobjednik',
        'tournament.joinMatch': 'Pridruži se meču',
        'tournament.play': 'Igraj',
        'tournament.wins': 'pobjeđuje',
        'tournament.errorLoading': 'Greška pri učitavanju turnira',
        'tournament.backToDashboard': 'Povratak na Dashboard',
        'tournament.playersCount': 'igrača',
        'tournament.tournamentCount': 'turnira',
        'tournament.tournamentCountSingular': 'turnir',
        'tournament.place': 'mjesto',
        'tournament.waiting': 'Čeka',
        'tournament.spectatingTitle': 'Igre u tijeku - Promatraj',
        'tournament.spectatingDesc': 'Dok čekaš svoj meč, možeš promatrati druge partije!',
        'tournament.turnLabel': 'Potez',
        'tournament.whitePlayer': 'Bijeli',
        'tournament.blackPlayer': 'Crni',
        'tournament.movesCount': 'poteza',
        'tournament.spectate': 'Promatraj',
        'tournament.started': 'Turnir pokrenut!',
        'tournament.deleteConfirm': 'Jeste li sigurni da želite obrisati ovaj turnir? Ova radnja se ne može poništiti!',
        'tournament.deleted': 'Turnir je obrisan!',
        'tournament.deleteError': 'Greška pri brisanju turnira',
        'tournament.gameCreateError': 'Greška pri kreiranju igre',
        'tournament.confirmWinner': 'Potvrdite pobjednika?',
        'tournament.resultUpdated': 'Rezultat ažuriran!',
        
        // Players
        'players.title': 'Igrači',
        'players.subtitle': 'Pregledajte sve igrače i posjetite njihove profile',
        'players.ranking': 'Rang lista',
        'players.searchPlayers': 'Pretraži igrače...',
        'players.player': 'Igrač',
        'players.elo': 'ELO',
        'players.wins': 'Pobjede',
        'players.losses': 'Porazi',
        'players.draws': 'Neriješeno',
        'players.status': 'Status',
        'players.action': 'Akcija',
        'players.provisional': 'Provizorno',
        'players.confirmed': 'Potvrđeno',
        'players.viewProfile': 'Profil',
        'players.noPlayers': 'Nema igrača',
        'players.noMatch': 'Nema igrača koji odgovaraju pretrazi',
        'players.loadError': 'Greška pri učitavanju igrača',
        'players.loading': 'Učitavam igrače...',
        
        // Profile
        'profile.myProfile': 'Moj Profil',
        'profile.generalElo': 'Opći ELO',
        'profile.eloByCategory': 'ELO po kategorijama',
        'profile.data': 'Podaci',
        'profile.actions': 'Akcije',
        'profile.username': 'Korisničko ime',
        'profile.email': 'Email',
        'profile.changePhoto': 'Promijeni sliku',
        'profile.role': 'Uloga',
        'profile.player': 'Igrač',
        'profile.admin': 'Administrator',
        'profile.totalMatches': 'Ukupno mečeva',
        'profile.winRate': 'Win Rate',
        'profile.titles': 'Moje titule',
        'profile.tournaments': 'Moji turniri',
        'profile.friends': 'Moji prijatelji',
        'profile.friendRequests': 'Zahtjevi za prijateljstvo',
        'profile.history': 'Povijest turnira',
        'profile.noTitle': 'Bez titule',
        'profile.logout': 'Odjava',
        'profile.provisional': 'Provizorni',
        'profile.matchesPlayed': 'mečeva',
        'profile.tournamentsPlayed': 'Odigrani turniri',
        'profile.wins': 'Pobjede',
        'profile.tournamentsCreated': 'Kreirani turniri',
        'profile.matchesLabel': 'Mečevi',
        'profile.winPercentage': 'Postotak pobjeda',
        'profile.noStats': 'Nema statistika',
        'profile.noStatsDesc': 'Počnite igrati turnire kako biste vidjeli statistike',
        'profile.statsUnavailable': 'Statistike trenutno nisu dostupne',
        'profile.statsUnavailableDesc': 'Turniri koje odigrate bit će prikazani ovdje',
        'profile.noHistory': 'Još nema povijesti turnira',
        'profile.historyUnavailable': 'Povijest trenutno nije dostupna',
        'profile.imageTooLarge': 'Slika je prevelika (max 5MB)',
        'profile.pleaseSelectImage': 'Molimo odaberite sliku',
        'profile.pictureUploaded': 'Profilna slika uspješno učitana!',
        'profile.pictureUploadError': 'Greška pri učitavanju slike',
        'profile.active': 'Aktivno',
        'profile.noTitles': 'Još nemate titula. Osvojite ih kroz turnire!',
        'profile.titlesError': 'Greška pri učitavanju titula',
        'profile.titleSet': 'Aktivna titula postavljena!',
        'profile.titleSetError': 'Greška pri postavljanju titule',
        'profile.titleRemoved': 'Titula uklonjena',
        'profile.noFriends': 'Nemate još prijatelja',
        'profile.addFriendsHint': 'Dodaj prijatelje iz baze igrača!',
        'profile.friendsError': 'Greška pri učitavanju prijatelja',
        'profile.accept': 'Prihvati',
        'profile.decline': 'Odbij',
        'profile.pendingRequests': 'zahtjeva na čekanju',
        'profile.friendAccepted': 'Prijateljstvo prihvaćeno!',
        'profile.acceptError': 'Greška pri prihvaćanju zahtjeva',
        'profile.requestDeclined': 'Zahtjev odbijen',
        'profile.declineError': 'Greška pri odbijanju zahtjeva',
        'profile.noTournaments': 'Niste u nijednom turniru',
        'profile.createTournament': 'Stvori turnir',
        'profile.tournamentsError': 'Greška pri učitavanju turnira',
        
        // Player Profile (viewing others)
        'playerProfile.notFound': 'Igrač nije pronađen',
        'playerProfile.info': 'Informacije',
        'playerProfile.actions': 'Akcije',
        'playerProfile.challenge': 'Izazovi na meč',
        'playerProfile.addFriend': 'Dodaj prijatelja',
        'playerProfile.experienceLevel': 'Nivo iskustva',
        'playerProfile.levelBeginner': 'Novi',
        'playerProfile.levelIntermediate': 'Poznajem igru',
        'playerProfile.levelAdvanced': 'Iskusan',
        'playerProfile.rankedMatches': 'Rangiranih mečeva',
        'playerProfile.memberSince': 'Član od',
        'playerProfile.errorLoading': 'Greška pri učitavanju profila',
        'playerProfile.requestSent': 'Zahtjev poslan!',
        'playerProfile.requestError': 'Greška pri slanju zahtjeva',
        'playerProfile.friends': 'Prijatelji',
        'playerProfile.requestPending': 'Zahtjev poslan',
        'playerProfile.acceptRequest': 'Prihvati zahtjev',
        'playerProfile.removeFriendConfirm': 'Jeste li sigurni da želite ukloniti ovog prijatelja?',
        'playerProfile.friendRemoved': 'Prijatelj uklonjen',
        
        // Challenge Modal
        'challenge.title': 'Izazovi igrača',
        'challenge.quickTime': 'Brzi odabir vremena',
        'challenge.customTime': 'Prilagođeno vrijeme',
        'challenge.minutesPerPlayer': 'Minuta po igraču',
        'challenge.increment': 'Inkrement (sekunde)',
        'challenge.chooseColor': 'Odaberi boju',
        'challenge.random': 'Nasumično',
        'challenge.white': 'Bijeli',
        'challenge.black': 'Crni',
        'challenge.cancel': 'Odustani',
        'challenge.send': 'Pošalji izazov',
        'challenge.sent': 'Izazov poslan!',
        'challenge.sendError': 'Greška pri slanju izazova',
        'challenge.sending': 'Šaljem...',
        'challenge.sentNotification': 'Izazov poslan! Drugi igrač će biti obaviješten.',
        'common.success': 'Uspješno!',
        
        // Settings
        'settings.title': 'Postavke',
        'settings.subtitle': 'Prilagodite aplikaciju prema svojim potrebama',
        'settings.language': 'Jezik Aplikacije',
        'settings.selectLanguage': 'Odaberite jezik sučelja',
        'settings.theme': 'Tema Aplikacije',
        'settings.selectTheme': 'Odaberite temu koja vam najbolje odgovara',
        'settings.pieceDesign': 'Dizajn Figura',
        'settings.selectPieceDesign': 'Odaberite stil šahovskih figura',
        'settings.boardDesign': 'Dizajn Šahovske Ploče',
        'settings.selectBoardDesign': 'Odaberite boje šahovske ploče',
        'settings.interface': 'Izgled Sučelja',
        'settings.notifications': 'Obavijesti',
        'settings.privacy': 'Privatnost',
        'settings.gameplay': 'Postavke Igre',
        'settings.saved': 'Spremljeno ✓',
        'settings.emailNotifications': 'Notifikacije na email',
        'settings.emailNotifications.desc': 'Primaj obavijesti o novim turnirima na email',
        'settings.pushNotifications': 'Push obavijesti',
        'settings.pushNotifications.desc': 'Prikazuj obavijesti u pregledniku',
        'settings.soundNotifications': 'Zvučne notifikacije',
        'settings.soundNotifications.desc': 'Reproduciraj zvuk pri novim partijama',
        'settings.changePassword': 'Promjena lozinke',
        'settings.changePassword.desc': 'Promijenite lozinku svog računa',
        'settings.changePassword.btn': 'Promijeni lozinku',
        'settings.changePassword.current': 'Trenutna lozinka',
        'settings.changePassword.currentPlaceholder': 'Unesite trenutnu lozinku',
        'settings.changePassword.new': 'Nova lozinka',
        'settings.changePassword.newPlaceholder': 'Unesite novu lozinku (min. 6 znakova)',
        'settings.changePassword.confirm': 'Potvrdite novu lozinku',
        'settings.changePassword.confirmPlaceholder': 'Ponovite novu lozinku',
        'settings.changePassword.submit': 'Promijeni',
        'settings.dangerZone': 'Zona opasnosti',
        'settings.dangerZone.desc': 'Jednom kada izbrišete svoj račun, nema povratka. Svi vaši podaci će biti trajno izbrisani.',
        'settings.deleteAccount': 'Izbriši moj račun',
        'settings.deleteAccount.title': 'Potvrda brisanja računa',
        'settings.deleteAccount.confirm': 'Jeste li sigurni da želite trajno izbrisati svoj račun? Ova radnja se ne može poništiti.',
        'settings.deleteAccount.passwordLabel': 'Unesite lozinku za potvrdu:',
        'settings.deleteAccount.passwordPlaceholder': 'Vaša lozinka',
        'settings.deleteAccount.submit': 'Izbriši račun',
        'settings.cancel': 'Odustani',
        'settings.publicProfile': 'Javni profil',
        'settings.publicProfile.desc': 'Drugi igrači mogu vidjeti tvoj profil',
        'settings.showOnline': 'Prikaži online status',
        'settings.showOnline.desc': 'Drugi mogu vidjeti kada si online',
        'settings.showRating': 'Prikaži rating',
        'settings.showRating.desc': 'Tvoj ELO rating je vidljiv drugima',
        'settings.confirmMove': 'Potvrda poteza',
        'settings.confirmMove.desc': 'Zatraži potvrdu prije slanja poteza',
        'settings.animatePieces': 'Animacije figura',
        'settings.animatePieces.desc': 'Animiraj kretanje figura',
        'settings.compactMode': 'Kompaktni prikaz',
        'settings.compactMode.desc': 'Smanji razmake između elemenata',
        'settings.autoQueen': 'Auto-promjena kraljice',
        'settings.showLegalMoves': 'Prikaži legalne poteze',
        'settings.tabsPosition': 'Pozicija navigacijskih tabova',
        'settings.tabsPosition.hint': 'Odaberite gdje želite da se prikazuju navigacijski tabovi',
        'settings.tabsPosition.top': 'Gore (horizontalno)',
        'settings.tabsPosition.left': 'Lijevo (vertikalno)',
        
        // Help page
        'help.title': 'Pomoć i Podrška',
        'help.subtitle': 'Pronađite odgovore na najčešća pitanja',
        'help.videoTutorials': 'Video Tutorijali',
        'help.video.createTournament': 'Kako kreirati turnir',
        'help.video.joinTournament': 'Pridruživanje turniru',
        'help.video.playGame': 'Igranje partije',
        'help.video.duration': 'Trajanje',
        'help.faq': 'Često Postavljana Pitanja (FAQ)',
        'help.faq.createTournament': 'Kako da kreiram novi turnir?',
        'help.faq.createTournamentAnswer': 'Na početnoj stranici kliknite na gumb "Stvori turnir", popunite potrebne podatke i potvrdite.',
        'help.faq.eloRating': 'Kako funkcionira ELO rating sustav?',
        'help.faq.eloRatingAnswer': 'ELO sustav izračunava rating na temelju pobjeđivanja i poraza.',
        'help.faq.changeTheme': 'Kako da promijenim temu aplikacije?',
        'help.faq.changeThemeAnswer': 'Kliknite na odabir teme u gornjem desnom kutu i odaberite željenu temu.',
        'help.faq.joinTournament': 'Kako da se pridružim turniru?',
        'help.faq.joinTournamentAnswer': 'Možete se pridružiti pomoću turnirskog koda ili odabiranjem turnira s liste.',
        'help.faq.forgotPassword': 'Što ako zaboravim lozinku?',
        'help.faq.forgotPasswordAnswer': 'Kliknite "Zaboravili ste lozinku?" na login stranici i slijedite upute za reset.',
        'help.faq.changeBoardDesign': 'Kako da promijenim dizajn šahovske ploče?',
        'help.faq.changeBoardDesignAnswer': 'Idite na Postavke i odaberite željeni dizajn u odjeljku "Dizajn Šahovske Ploče".',
        'help.faq.watchGames': 'Mogu li gledati tuđe partije?',
        'help.faq.watchGamesAnswer': 'Da! Idite na turnir i kliknite na aktivnu partiju da gledate uživo.',
        'help.faq.notifications': 'Kako funkcioniraju obavijesti?',
        'help.faq.notificationsAnswer': 'Primate obavijesti za nove turnire, kada je vaš red za igranje i rezultate partija.',
        'help.contact': 'Nije bilo korisno?',
        'help.contactSubtitle': 'Kontaktirajte nas za dodatnu pomoć',
        'help.emailSupport': 'Email Podrška',
        'help.liveChat': 'Razgovor uživo',
        
        // Themes
        'theme.light': 'Svijetla',
        'theme.light.desc': 'Klasična tema',
        'theme.dark': 'Tamna',
        'theme.dark.desc': 'Tamni način rada',
        'theme.blue': 'Plavi Ocean',
        'theme.blue.desc': 'Mirna plava',
        'theme.purple': 'Ljubičasti San',
        'theme.purple.desc': 'Elegantna',
        'theme.green': 'Zelena Šuma',
        'theme.green.desc': 'Prirodna',
        'theme.sunset': 'Zalazak Sunca',
        'theme.sunset.desc': 'Topla',
        
        // Piece styles
        'piece.classic': 'Klasične',
        'piece.classic.desc': 'Standardne Unicode',
        'piece.modern': 'Moderne',
        'piece.modern.desc': 'Savremene figure',
        'piece.bold': 'Bold',
        'piece.bold.desc': 'Debele figure',
        
        // Board styles
        'board.classic': 'Klasična',
        'board.classic.desc': 'Smeđa & bež',
        'board.wood': 'Drvo',
        'board.wood.desc': 'Tamno drvo',
        'board.green': 'Zelena',
        'board.green.desc': 'Turnirska',
        'board.blue': 'Plava',
        'board.blue.desc': 'Moderna',
        
        // Select options
        'option.always': 'Uvijek',
        'option.ask': 'Pitaj',
        'option.never': 'Nikad',
        'option.hover': 'Pri hoveru',
        
        // Help
        'help.title': 'Pomoć i Podrška',
        'help.subtitle': 'Pronađite odgovore na najčešća pitanja',
        'help.videoTutorials': 'Video Tutorijali',
        'help.faq': 'Često Postavljana Pitanja',
        'help.contact': 'Kontaktirajte nas za dodatnu pomoć',
        'help.emailSupport': 'Email Podrška',
        'help.liveChat': 'Razgovor uživo',
        
        // Notifications
        'notifications.title': 'Obavijesti',
        'notifications.markAll': 'Označi sve',
        'notifications.empty': 'Nema novih obavijesti',
        'notifications.acceptChallenge': 'Prihvati izazov',
        'notifications.joinMatch': 'Pridruži se meču',
        
        // Errors
        'error.generic': 'Došlo je do greške',
        'error.network': 'Greška pri povezivanju',
        'error.unauthorized': 'Nemate pristup',
        'error.notFound': 'Nije pronađeno',
        
        // Success
        'success.saved': 'Uspješno spremljeno',
        'success.deleted': 'Uspješno obrisano',
        'success.joined': 'Uspješno pridruženi',
    },
    
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.players': 'Players',
        'nav.profile': 'Profile',
        'nav.admin': 'Admin',
        'nav.settings': 'Settings',
        'nav.help': 'Help',
        'nav.logout': 'Logout',
        
        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.loading': 'Loading...',
        'common.search': 'Search',
        'common.close': 'Close',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.or': 'or',
        'common.showAll': 'Show all',
        'common.error': 'Error',
        
        // Auth
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.username': 'Username',
        'auth.password': 'Password',
        'auth.email': 'Email',
        'auth.loginBtn': 'Sign In',
        'auth.registerBtn': 'Sign Up',
        'auth.noAccount': "Don't have an account?",
        'auth.hasAccount': 'Already have an account?',
        'auth.loginWithGoogle': 'Sign in with Google',
        'auth.forgotPassword': 'Forgot your password?',
        'auth.loginSubtitle': 'Sign in to your account',
        'auth.registerSubtitle': 'Create a new account',
        'auth.usernamePlaceholder': 'Enter username',
        'auth.passwordPlaceholder': 'Enter password',
        'auth.emailPlaceholder': 'Enter email address',
        'auth.confirmPassword': 'Confirm password',
        'auth.confirmPasswordPlaceholder': 'Re-enter password',
        'auth.passwordMinHint': 'Enter password (min. 6 characters)',
        'auth.experienceLevel': 'Your chess experience',
        'auth.experienceSelect': '-- Select level --',
        'auth.experienceBeginner': '🌱 Beginner (400 ELO)',
        'auth.experienceIntermediate': '♟️ Know the game (700 ELO)',
        'auth.experienceAdvanced': '👑 Experienced (1000 ELO)',
        'auth.experienceHint': 'This determines your starting ELO rating. Don\'t worry, your rating will adjust automatically after your first few games.',
        'auth.usernameMinError': 'Username must be at least 3 characters',
        'auth.invalidEmailError': 'Please enter a valid email address',
        'auth.passwordMinError': 'Password must be at least 6 characters',
        'auth.passwordMismatchError': 'Passwords do not match',
        'auth.formErrors': 'Please fix the errors in the form',
        'auth.forgotPasswordInfo': 'To reset your password, contact the administrator at support@cotisa.hr',
        'auth.enterCredentials': 'Please enter username and password',
        'auth.welcomeUser': 'Welcome',
        'auth.loggingIn': 'Logging in...',
        'auth.googleLoginError': 'Error signing in with Google',
        'auth.serverError': 'Error connecting to server',
        'auth.loginWithGoogle': 'Sign in with Google',
        'auth.forgotPassword': 'Forgot your password?',
        
        // Dashboard
        'dashboard.welcome': 'Welcome',
        'dashboard.subtitle': 'Manage your tournaments and track competitions',
        'dashboard.createTournament': 'Create New Tournament',
        'dashboard.joinTournament': 'Join with Code',
        'dashboard.refresh': 'Refresh',
        'dashboard.activeTournaments': 'All Active Tournaments',
        'dashboard.loadingTournaments': 'Loading tournaments...',
        'dashboard.noTournaments': 'No tournaments',
        'dashboard.noTournamentsDesc': 'No active tournaments at the moment',
        'dashboard.errorLoading': 'Error loading',
        'dashboard.joinSuccess': 'Successfully joined the tournament!',
        'dashboard.joinError': 'Error joining tournament',
        'dashboard.noCode': 'Tournament has no code',
        
        // Tournament
        'tournament.name': 'Tournament Name',
        'tournament.type': 'Tournament Type',
        'tournament.elimination': 'Elimination',
        'tournament.roundRobin': 'Round Robin',
        'tournament.players': 'Players',
        'tournament.created': 'Created',
        'tournament.creator': 'Creator',
        'tournament.createdBy': 'Created by',
        'tournament.status': 'Status',
        'tournament.active': 'Active',
        'tournament.rating': 'Rating',
        'tournament.completed': 'Completed',
        'tournament.pending': 'Pending',
        'tournament.details': 'Details',
        'tournament.join': 'Join',
        'tournament.joinTitle': 'Join Tournament',
        'tournament.start': 'Start Tournament',
        'tournament.code': 'Tournament Code',
        'tournament.codeForJoin': 'Tournament code to join',
        'tournament.copyCode': 'Copy Code',
        'tournament.enterCode': 'Enter 6-digit tournament code',
        'tournament.delete': 'Delete Tournament',
        'tournament.participants': 'Participants',
        'tournament.noParticipants': 'No participants',
        'tournament.noParticipantsDesc': 'No one has joined the tournament yet',
        'tournament.matches': 'Matches',
        'tournament.back': 'Back',
        'tournament.create': 'Create Tournament',
        'tournament.createTitle': 'Create New Tournament',
        'tournament.createSubtitle': 'Fill in the details to create a new tournament',
        'tournament.tournamentName': 'Tournament Name',
        'tournament.maxPlayers': 'Maximum number of players',
        'tournament.timePerPlayer': 'Time per player (minutes)',
        'tournament.increment': 'Increment per move (seconds)',
        'tournament.advancedSettings': 'Advanced Settings',
        'tournament.tournamentType': 'Tournament Type',
        'tournament.typeElimination': 'Elimination (Bracket)',
        'tournament.typeRoundRobin': 'Round Robin',
        'tournament.pairingSystem': 'Pairing System',
        'tournament.pairingRandom': 'Random',
        'tournament.pairingRating': 'By Rating',
        'tournament.pairingSwiss': 'Swiss System',
        'tournament.pairingManual': 'Manual',
        'tournament.pairingHint': 'How players will be paired into matches',
        'tournament.startDate': 'Start Date',
        'tournament.startDateHint': 'Tournament lasts until all players finish their games',
        'tournament.description': 'Description (optional)',
        'tournament.descriptionPlaceholder': 'Add description, rules or notes for players...',
        'tournament.isPublic': 'Public Tournament',
        'tournament.isPublicHint': 'If checked, tournament will be visible in "All Tournaments" list.',
        'tournament.creatorPlays': 'I play as participant',
        'tournament.creatorPlaysHint': 'If unchecked, you will only be the organizer and can watch games.',
        'tournament.namePlaceholder': 'e.g. Spring Cup 2025',
        'tournament.maxPlayersPlaceholder': 'e.g. 8, 16, 32',
        'tournament.maxPlayersHint': 'Recommended for elimination: 4, 8, 16, 32. For round-robin any number.',
        'tournament.timePlaceholder': 'e.g. 5, 10, 15',
        'tournament.timeHint': 'Time in minutes per player. Bullet: ≤3 min | Blitz: 3-10 min | Rapid: 10-60 min | Classical: >60 min',
        'tournament.incrementPlaceholder': 'e.g. 0, 2, 5',
        'tournament.incrementHint': 'Additional seconds added after each move (0 for no increment)',
        'tournament.howToGetCode': 'How to get the code?',
        'tournament.codeExplanation': 'You get the tournament code from the organizer. It is a unique 6-digit number that allows access to the tournament.',
        'tournament.yourCode': 'Your tournament code',
        'tournament.startConfirm': 'Do you want to start the tournament? After starting, no new players can join.',
        'tournament.startSuccess': 'Tournament started successfully!',
        'tournament.delete': 'Delete Tournament',
        'tournament.codeCopied': 'Code copied!',
        'tournament.elo': 'ELO',
        'tournament.seed': 'Seed',
        'tournament.provisional': 'Provisional',
        'tournament.eliminated': 'Eliminated',
        'tournament.loading': 'Loading tournament...',
        'tournament.noMatches': 'No matches',
        'tournament.match': 'Match',
        'tournament.finished': 'Finished',
        'tournament.inProgress': 'In progress',
        'tournament.round': 'Round',
        'tournament.winner': 'Winner',
        'tournament.joinMatch': 'Join Match',
        'tournament.play': 'Play',
        'tournament.wins': 'wins',
        'tournament.errorLoading': 'Error loading tournament',
        'tournament.backToDashboard': 'Back to Dashboard',
        'tournament.playersCount': 'players',
        'tournament.tournamentCount': 'tournaments',
        'tournament.tournamentCountSingular': 'tournament',
        'tournament.place': 'place',
        'tournament.waiting': 'Waiting',
        'tournament.spectatingTitle': 'Ongoing Games - Spectate',
        'tournament.spectatingDesc': 'While waiting for your match, you can watch other games!',
        'tournament.turnLabel': 'Turn',
        'tournament.whitePlayer': 'White',
        'tournament.blackPlayer': 'Black',
        'tournament.movesCount': 'moves',
        'tournament.spectate': 'Spectate',
        'tournament.started': 'Tournament started!',
        'tournament.deleteConfirm': 'Are you sure you want to DELETE this tournament? This action cannot be undone!',
        'tournament.deleted': 'Tournament deleted!',
        'tournament.deleteError': 'Error deleting tournament',
        'tournament.gameCreateError': 'Error creating game',
        'tournament.confirmWinner': 'Confirm winner?',
        'tournament.resultUpdated': 'Result updated!',
        
        // Players
        'players.title': 'Players',
        'players.subtitle': 'View all players and visit their profiles',
        'players.ranking': 'Rankings',
        'players.searchPlayers': 'Search players...',
        'players.player': 'Player',
        'players.elo': 'ELO',
        'players.wins': 'Wins',
        'players.losses': 'Losses',
        'players.draws': 'Draws',
        'players.status': 'Status',
        'players.action': 'Action',
        'players.provisional': 'Provisional',
        'players.confirmed': 'Confirmed',
        'players.viewProfile': 'Profile',
        'players.noPlayers': 'No players',
        'players.noMatch': 'No players match your search',
        'players.loadError': 'Error loading players',
        'players.loading': 'Loading players...',
        
        // Profile
        'profile.myProfile': 'My Profile',
        'profile.generalElo': 'General ELO',
        'profile.eloByCategory': 'ELO by category',
        'profile.data': 'Data',
        'profile.actions': 'Actions',
        'profile.username': 'Username',
        'profile.email': 'Email',
        'profile.changePhoto': 'Change Photo',
        'profile.role': 'Role',
        'profile.player': 'Player',
        'profile.admin': 'Administrator',
        'profile.totalMatches': 'Total Matches',
        'profile.winRate': 'Win Rate',
        'profile.titles': 'My Titles',
        'profile.tournaments': 'My Tournaments',
        'profile.friends': 'My Friends',
        'profile.friendRequests': 'Friend Requests',
        'profile.history': 'Tournament History',
        'profile.noTitle': 'No title',
        'profile.logout': 'Logout',
        'profile.provisional': 'Provisional',
        'profile.matchesPlayed': 'matches',
        'profile.tournamentsPlayed': 'Tournaments Played',
        'profile.wins': 'Wins',
        'profile.tournamentsCreated': 'Tournaments Created',
        'profile.matchesLabel': 'Matches',
        'profile.winPercentage': 'Win Percentage',
        'profile.noStats': 'No statistics',
        'profile.noStatsDesc': 'Start playing tournaments to see your statistics',
        'profile.statsUnavailable': 'Statistics currently unavailable',
        'profile.statsUnavailableDesc': 'Tournaments you play will be shown here',
        'profile.noHistory': 'No tournament history yet',
        'profile.historyUnavailable': 'History currently unavailable',
        'profile.imageTooLarge': 'Image is too large (max 5MB)',
        'profile.pleaseSelectImage': 'Please select an image',
        'profile.pictureUploaded': 'Profile picture uploaded successfully!',
        'profile.pictureUploadError': 'Error uploading image',
        'profile.active': 'Active',
        'profile.noTitles': 'No titles yet. Win them through tournaments!',
        'profile.titlesError': 'Error loading titles',
        'profile.titleSet': 'Active title set!',
        'profile.titleSetError': 'Error setting title',
        'profile.titleRemoved': 'Title removed',
        'profile.noFriends': 'No friends yet',
        'profile.addFriendsHint': 'Add friends from the players list!',
        'profile.friendsError': 'Error loading friends',
        'profile.accept': 'Accept',
        'profile.decline': 'Decline',
        'profile.pendingRequests': 'requests pending',
        'profile.friendAccepted': 'Friendship accepted!',
        'profile.acceptError': 'Error accepting request',
        'profile.requestDeclined': 'Request declined',
        'profile.declineError': 'Error declining request',
        'profile.noTournaments': 'You are not in any tournament',
        'profile.createTournament': 'Create Tournament',
        'profile.tournamentsError': 'Error loading tournaments',
        
        // Player Profile (viewing others)
        'playerProfile.notFound': 'Player not found',
        'playerProfile.info': 'Information',
        'playerProfile.actions': 'Actions',
        'playerProfile.challenge': 'Challenge to match',
        'playerProfile.addFriend': 'Add friend',
        'playerProfile.experienceLevel': 'Experience level',
        'playerProfile.levelBeginner': 'Beginner',
        'playerProfile.levelIntermediate': 'Intermediate',
        'playerProfile.levelAdvanced': 'Advanced',
        'playerProfile.rankedMatches': 'Ranked matches',
        'playerProfile.memberSince': 'Member since',
        'playerProfile.errorLoading': 'Error loading profile',
        'playerProfile.requestSent': 'Request sent!',
        'playerProfile.requestError': 'Error sending request',
        'playerProfile.friends': 'Friends',
        'playerProfile.requestPending': 'Request sent',
        'playerProfile.acceptRequest': 'Accept request',
        'playerProfile.removeFriendConfirm': 'Are you sure you want to remove this friend?',
        'playerProfile.friendRemoved': 'Friend removed',
        
        // Challenge Modal
        'challenge.title': 'Challenge Player',
        'challenge.quickTime': 'Quick time selection',
        'challenge.customTime': 'Custom time',
        'challenge.minutesPerPlayer': 'Minutes per player',
        'challenge.increment': 'Increment (seconds)',
        'challenge.chooseColor': 'Choose color',
        'challenge.random': 'Random',
        'challenge.white': 'White',
        'challenge.black': 'Black',
        'challenge.cancel': 'Cancel',
        'challenge.send': 'Send challenge',
        'challenge.sent': 'Challenge sent!',
        'challenge.sendError': 'Error sending challenge',
        'challenge.sending': 'Sending...',
        'challenge.sentNotification': 'Challenge sent! The other player will be notified.',
        'common.success': 'Success!',
        
        // Settings
        'settings.title': 'Settings',
        'settings.subtitle': 'Customize the application to your needs',
        'settings.language': 'Application Language',
        'settings.selectLanguage': 'Select interface language',
        'settings.theme': 'Application Theme',
        'settings.selectTheme': 'Choose the theme that suits you best',
        'settings.pieceDesign': 'Piece Design',
        'settings.selectPieceDesign': 'Choose chess piece style',
        'settings.boardDesign': 'Chess Board Design',
        'settings.selectBoardDesign': 'Choose chess board colors',
        'settings.interface': 'Interface Appearance',
        'settings.notifications': 'Notifications',
        'settings.privacy': 'Privacy',
        'settings.gameplay': 'Game Settings',
        'settings.saved': 'Saved ✓',
        'settings.emailNotifications': 'Email notifications',
        'settings.emailNotifications.desc': 'Receive notifications about new tournaments via email',
        'settings.pushNotifications': 'Push notifications',
        'settings.pushNotifications.desc': 'Show notifications in browser',
        'settings.soundNotifications': 'Sound notifications',
        'settings.soundNotifications.desc': 'Play sound for new games',
        'settings.changePassword': 'Change password',
        'settings.changePassword.desc': 'Change your account password',
        'settings.changePassword.btn': 'Change password',
        'settings.changePassword.current': 'Current password',
        'settings.changePassword.currentPlaceholder': 'Enter current password',
        'settings.changePassword.new': 'New password',
        'settings.changePassword.newPlaceholder': 'Enter new password (min. 6 characters)',
        'settings.changePassword.confirm': 'Confirm new password',
        'settings.changePassword.confirmPlaceholder': 'Repeat new password',
        'settings.changePassword.submit': 'Change',
        'settings.dangerZone': 'Danger zone',
        'settings.dangerZone.desc': 'Once you delete your account, there is no going back. All your data will be permanently deleted.',
        'settings.deleteAccount': 'Delete my account',
        'settings.deleteAccount.title': 'Confirm account deletion',
        'settings.deleteAccount.confirm': 'Are you sure you want to permanently delete your account? This action cannot be undone.',
        'settings.deleteAccount.passwordLabel': 'Enter password to confirm:',
        'settings.deleteAccount.passwordPlaceholder': 'Your password',
        'settings.deleteAccount.submit': 'Delete account',
        'settings.cancel': 'Cancel',
        'settings.publicProfile': 'Public profile',
        'settings.publicProfile.desc': 'Other players can see your profile',
        'settings.showOnline': 'Show online status',
        'settings.showOnline.desc': 'Others can see when you are online',
        'settings.showRating': 'Show rating',
        'settings.showRating.desc': 'Your ELO rating is visible to others',
        'settings.confirmMove': 'Confirm move',
        'settings.confirmMove.desc': 'Ask for confirmation before sending move',
        'settings.animatePieces': 'Piece animations',
        'settings.animatePieces.desc': 'Animate piece movement',
        'settings.compactMode': 'Compact view',
        'settings.compactMode.desc': 'Reduce spacing between elements',
        'settings.autoQueen': 'Auto queen promotion',
        'settings.showLegalMoves': 'Show legal moves',
        'settings.tabsPosition': 'Navigation tabs position',
        'settings.tabsPosition.hint': 'Choose where you want navigation tabs to appear',
        'settings.tabsPosition.top': 'Top (horizontal)',
        'settings.tabsPosition.left': 'Left (vertical)',
        
        // Help page
        'help.title': 'Help & Support',
        'help.subtitle': 'Find answers to frequently asked questions',
        'help.videoTutorials': 'Video Tutorials',
        'help.video.createTournament': 'How to create a tournament',
        'help.video.joinTournament': 'Joining a tournament',
        'help.video.playGame': 'Playing a game',
        'help.video.duration': 'Duration',
        'help.faq': 'Frequently Asked Questions (FAQ)',
        'help.faq.createTournament': 'How do I create a new tournament?',
        'help.faq.createTournamentAnswer': 'On the home page, click the "Create Tournament" button, fill in the required details, and confirm.',
        'help.faq.eloRating': 'How does the ELO rating system work?',
        'help.faq.eloRatingAnswer': 'The ELO system calculates rating based on wins and losses.',
        'help.faq.changeTheme': 'How do I change the app theme?',
        'help.faq.changeThemeAnswer': 'Click on the theme selector in the top right corner and choose your preferred theme.',
        'help.faq.joinTournament': 'How do I join a tournament?',
        'help.faq.joinTournamentAnswer': 'You can join using a tournament code or by selecting a tournament from the list.',
        'help.faq.forgotPassword': 'What if I forget my password?',
        'help.faq.forgotPasswordAnswer': 'Click "Forgot your password?" on the login page and follow the reset instructions.',
        'help.faq.changeBoardDesign': 'How do I change the chess board design?',
        'help.faq.changeBoardDesignAnswer': 'Go to Settings and select your preferred design in the "Chess Board Design" section.',
        'help.faq.watchGames': 'Can I watch other people\'s games?',
        'help.faq.watchGamesAnswer': 'Yes! Go to a tournament and click on an active game to watch live.',
        'help.faq.notifications': 'How do notifications work?',
        'help.faq.notificationsAnswer': 'You receive notifications for new tournaments, when it is your turn to play, and game results.',
        'help.contact': 'Not helpful?',
        'help.contactSubtitle': 'Contact us for additional help',
        'help.emailSupport': 'Email Support',
        'help.liveChat': 'Live Chat',
        
        // Themes
        'theme.light': 'Light',
        'theme.light.desc': 'Classic theme',
        'theme.dark': 'Dark',
        'theme.dark.desc': 'Dark mode',
        'theme.blue': 'Blue Ocean',
        'theme.blue.desc': 'Calm blue',
        'theme.purple': 'Purple Dream',
        'theme.purple.desc': 'Elegant',
        'theme.green': 'Green Forest',
        'theme.green.desc': 'Natural',
        'theme.sunset': 'Sunset',
        'theme.sunset.desc': 'Warm',
        
        // Piece styles
        'piece.classic': 'Classic',
        'piece.classic.desc': 'Standard Unicode',
        'piece.modern': 'Modern',
        'piece.modern.desc': 'Contemporary pieces',
        'piece.bold': 'Bold',
        'piece.bold.desc': 'Bold pieces',
        
        // Board styles
        'board.classic': 'Classic',
        'board.classic.desc': 'Brown & beige',
        'board.wood': 'Wood',
        'board.wood.desc': 'Dark wood',
        'board.green': 'Green',
        'board.green.desc': 'Tournament',
        'board.blue': 'Blue',
        'board.blue.desc': 'Modern',
        
        // Select options
        'option.always': 'Always',
        'option.ask': 'Ask',
        'option.never': 'Never',
        'option.hover': 'On hover',
        
        // Help
        'help.title': 'Help & Support',
        'help.subtitle': 'Find answers to common questions',
        'help.videoTutorials': 'Video Tutorials',
        'help.faq': 'Frequently Asked Questions',
        'help.contact': 'Contact us for additional help',
        'help.emailSupport': 'Email Support',
        'help.liveChat': 'Live Chat',
        
        // Notifications
        'notifications.title': 'Notifications',
        'notifications.markAll': 'Mark all',
        'notifications.empty': 'No new notifications',
        'notifications.acceptChallenge': 'Accept challenge',
        'notifications.joinMatch': 'Join match',
        
        // Errors
        'error.generic': 'An error occurred',
        'error.network': 'Connection error',
        'error.unauthorized': 'Access denied',
        'error.notFound': 'Not found',
        
        // Success
        'success.saved': 'Successfully saved',
        'success.deleted': 'Successfully deleted',
        'success.joined': 'Successfully joined',
    },
    
    de: {
        // Navigation
        'nav.home': 'Startseite',
        'nav.players': 'Spieler',
        'nav.profile': 'Profil',
        'nav.admin': 'Admin',
        'nav.settings': 'Einstellungen',
        'nav.help': 'Hilfe',
        'nav.logout': 'Abmelden',
        
        // Common
        'common.save': 'Speichern',
        'common.cancel': 'Abbrechen',
        'common.delete': 'Löschen',
        'common.edit': 'Bearbeiten',
        'common.create': 'Erstellen',
        'common.back': 'Zurück',
        'common.next': 'Weiter',
        'common.loading': 'Laden...',
        'common.search': 'Suchen',
        'common.close': 'Schließen',
        'common.confirm': 'Bestätigen',
        'common.yes': 'Ja',
        'common.no': 'Nein',
        'common.or': 'oder',
        'common.showAll': 'Alle anzeigen',
        'common.error': 'Fehler',
        
        // Auth
        'auth.login': 'Anmelden',
        'auth.register': 'Registrieren',
        'auth.username': 'Benutzername',
        'auth.password': 'Passwort',
        'auth.email': 'E-Mail',
        'auth.loginBtn': 'Anmelden',
        'auth.registerBtn': 'Registrieren',
        'auth.noAccount': 'Kein Konto?',
        'auth.hasAccount': 'Bereits ein Konto?',
        'auth.loginWithGoogle': 'Mit Google anmelden',
        'auth.forgotPassword': 'Passwort vergessen?',
        'auth.loginSubtitle': 'Melden Sie sich bei Ihrem Konto an',
        'auth.registerSubtitle': 'Neues Konto erstellen',
        'auth.usernamePlaceholder': 'Benutzername eingeben',
        'auth.passwordPlaceholder': 'Passwort eingeben',
        'auth.emailPlaceholder': 'E-Mail-Adresse eingeben',
        'auth.confirmPassword': 'Passwort bestätigen',
        'auth.confirmPasswordPlaceholder': 'Passwort erneut eingeben',
        'auth.passwordMinHint': 'Passwort eingeben (min. 6 Zeichen)',
        'auth.experienceLevel': 'Ihre Schacherfahrung',
        'auth.experienceSelect': '-- Stufe wählen --',
        'auth.experienceBeginner': '🌱 Anfänger (400 ELO)',
        'auth.experienceIntermediate': '♟️ Kenne das Spiel (700 ELO)',
        'auth.experienceAdvanced': '👑 Erfahren (1000 ELO)',
        'auth.experienceHint': 'Dies bestimmt Ihre Anfangs-ELO-Bewertung. Keine Sorge, die Bewertung wird sich nach Ihren ersten Spielen automatisch anpassen.',
        'auth.usernameMinError': 'Benutzername muss mindestens 3 Zeichen haben',
        'auth.invalidEmailError': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        'auth.passwordMinError': 'Passwort muss mindestens 6 Zeichen haben',
        'auth.passwordMismatchError': 'Passwörter stimmen nicht überein',
        'auth.formErrors': 'Bitte korrigieren Sie die Fehler im Formular',
        'auth.forgotPasswordInfo': 'Um Ihr Passwort zurückzusetzen, kontaktieren Sie den Administrator unter support@cotisa.hr',
        'auth.enterCredentials': 'Bitte Benutzername und Passwort eingeben',
        'auth.welcomeUser': 'Willkommen',
        'auth.loggingIn': 'Anmeldung läuft...',
        'auth.googleLoginError': 'Fehler bei der Anmeldung mit Google',
        'auth.serverError': 'Fehler bei der Verbindung zum Server',
        'auth.loginWithGoogle': 'Mit Google anmelden',
        'auth.forgotPassword': 'Passwort vergessen?',
        
        // Dashboard
        'dashboard.welcome': 'Willkommen',
        'dashboard.subtitle': 'Verwalten Sie Ihre Turniere und verfolgen Sie Wettbewerbe',
        'dashboard.createTournament': 'Neues Turnier erstellen',
        'dashboard.joinTournament': 'Mit Code beitreten',
        'dashboard.refresh': 'Aktualisieren',
        'dashboard.activeTournaments': 'Alle aktiven Turniere',
        'dashboard.loadingTournaments': 'Turniere laden...',
        'dashboard.noTournaments': 'Keine Turniere',
        'dashboard.noTournamentsDesc': 'Derzeit keine aktiven Turniere',
        'dashboard.errorLoading': 'Fehler beim Laden',
        'dashboard.joinSuccess': 'Erfolgreich dem Turnier beigetreten!',
        'dashboard.joinError': 'Fehler beim Beitreten',
        'dashboard.noCode': 'Turnier hat keinen Code',
        
        // Tournament
        'tournament.name': 'Turniername',
        'tournament.type': 'Turniertyp',
        'tournament.elimination': 'Elimination',
        'tournament.roundRobin': 'Jeder gegen jeden',
        'tournament.players': 'Spieler',
        'tournament.created': 'Erstellt',
        'tournament.creator': 'Ersteller',
        'tournament.createdBy': 'Erstellt von',
        'tournament.status': 'Status',
        'tournament.active': 'Aktiv',
        'tournament.rating': 'Wertung',
        'tournament.completed': 'Abgeschlossen',
        'tournament.pending': 'Ausstehend',
        'tournament.details': 'Details',
        'tournament.join': 'Beitreten',
        'tournament.joinTitle': 'Turnier beitreten',
        'tournament.start': 'Turnier starten',
        'tournament.code': 'Turniercode',
        'tournament.codeForJoin': 'Turniercode zum Beitreten',
        'tournament.copyCode': 'Code kopieren',
        'tournament.enterCode': '6-stelligen Turniercode eingeben',
        'tournament.delete': 'Turnier löschen',
        'tournament.participants': 'Teilnehmer',
        'tournament.noParticipants': 'Keine Teilnehmer',
        'tournament.noParticipantsDesc': 'Noch niemand ist dem Turnier beigetreten',
        'tournament.matches': 'Spiele',
        'tournament.back': 'Zurück',
        'tournament.create': 'Turnier erstellen',
        'tournament.createTitle': 'Neues Turnier erstellen',
        'tournament.createSubtitle': 'Daten für neues Turnier eingeben',
        'tournament.tournamentName': 'Turniername',
        'tournament.maxPlayers': 'Maximale Spieleranzahl',
        'tournament.timePerPlayer': 'Zeit pro Spieler (Minuten)',
        'tournament.increment': 'Inkrement pro Zug (Sekunden)',
        'tournament.advancedSettings': 'Erweiterte Einstellungen',
        'tournament.tournamentType': 'Turniertyp',
        'tournament.typeElimination': 'Ausscheidung (Bracket)',
        'tournament.typeRoundRobin': 'Jeder gegen jeden',
        'tournament.pairingSystem': 'Paarungssystem',
        'tournament.pairingRandom': 'Zufällig',
        'tournament.pairingRating': 'Nach Rating',
        'tournament.pairingSwiss': 'Schweizer System',
        'tournament.pairingManual': 'Manuell',
        'tournament.pairingHint': 'Wie Spieler in Partien gepaart werden',
        'tournament.startDate': 'Startdatum',
        'tournament.startDateHint': 'Das Turnier dauert, bis alle Spieler ihre Partien beendet haben',
        'tournament.description': 'Beschreibung (optional)',
        'tournament.descriptionPlaceholder': 'Beschreibung, Regeln oder Hinweise für Spieler hinzufügen...',
        'tournament.isPublic': 'Öffentliches Turnier',
        'tournament.isPublicHint': 'Wenn aktiviert, wird das Turnier in der Liste "Alle Turniere" sichtbar.',
        'tournament.creatorPlays': 'Ich spiele als Teilnehmer',
        'tournament.creatorPlaysHint': 'Wenn nicht aktiviert, sind Sie nur Organisator und können Spiele beobachten.',
        'tournament.namePlaceholder': 'z.B. Frühlingspokal 2025',
        'tournament.maxPlayersPlaceholder': 'z.B. 8, 16, 32',
        'tournament.maxPlayersHint': 'Empfohlen für Ausscheidung: 4, 8, 16, 32. Für Jeder-gegen-Jeden beliebige Zahl.',
        'tournament.timePlaceholder': 'z.B. 5, 10, 15',
        'tournament.timeHint': 'Zeit in Minuten pro Spieler. Bullet: ≤3 min | Blitz: 3-10 min | Rapid: 10-60 min | Classical: >60 min',
        'tournament.incrementPlaceholder': 'z.B. 0, 2, 5',
        'tournament.incrementHint': 'Zusätzliche Sekunden nach jedem Zug (0 für kein Inkrement)',
        'tournament.howToGetCode': 'Wie bekomme ich den Code?',
        'tournament.codeExplanation': 'Den Turniercode erhalten Sie vom Veranstalter. Es ist eine eindeutige 6-stellige Nummer.',
        'tournament.yourCode': 'Ihr Turniercode',
        'tournament.startConfirm': 'Möchten Sie das Turnier starten? Nach dem Start können keine neuen Spieler mehr beitreten.',
        'tournament.startSuccess': 'Turnier erfolgreich gestartet!',
        'tournament.delete': 'Turnier löschen',
        'tournament.codeCopied': 'Code kopiert!',
        'tournament.elo': 'ELO',
        'tournament.seed': 'Setzplatz',
        'tournament.provisional': 'Vorläufig',
        'tournament.eliminated': 'Ausgeschieden',
        'tournament.loading': 'Turnier wird geladen...',
        'tournament.noMatches': 'Keine Partien',
        'tournament.match': 'Partie',
        'tournament.finished': 'Beendet',
        'tournament.inProgress': 'Läuft',
        'tournament.round': 'Runde',
        'tournament.winner': 'Gewinner',
        'tournament.joinMatch': 'Partie beitreten',
        'tournament.play': 'Spielen',
        'tournament.wins': 'gewinnt',
        'tournament.errorLoading': 'Fehler beim Laden des Turniers',
        'tournament.backToDashboard': 'Zurück zum Dashboard',
        'tournament.playersCount': 'Spieler',
        'tournament.tournamentCount': 'Turniere',
        'tournament.tournamentCountSingular': 'Turnier',
        'tournament.place': 'Platz',
        'tournament.waiting': 'Wartend',
        'tournament.spectatingTitle': 'Laufende Spiele - Zuschauen',
        'tournament.spectatingDesc': 'Während du auf dein Spiel wartest, kannst du andere Partien beobachten!',
        'tournament.turnLabel': 'Zug',
        'tournament.whitePlayer': 'Weiß',
        'tournament.blackPlayer': 'Schwarz',
        'tournament.movesCount': 'Züge',
        'tournament.spectate': 'Zuschauen',
        'tournament.started': 'Turnier gestartet!',
        'tournament.deleteConfirm': 'Sind Sie sicher, dass Sie dieses Turnier LÖSCHEN möchten? Diese Aktion kann nicht rückgängig gemacht werden!',
        'tournament.deleted': 'Turnier gelöscht!',
        'tournament.deleteError': 'Fehler beim Löschen des Turniers',
        'tournament.gameCreateError': 'Fehler beim Erstellen des Spiels',
        'tournament.confirmWinner': 'Gewinner bestätigen?',
        'tournament.resultUpdated': 'Ergebnis aktualisiert!',
        
        // Players
        'players.title': 'Spieler',
        'players.subtitle': 'Alle Spieler ansehen und ihre Profile besuchen',
        'players.ranking': 'Rangliste',
        'players.searchPlayers': 'Spieler suchen...',
        'players.player': 'Spieler',
        'players.elo': 'ELO',
        'players.wins': 'Siege',
        'players.losses': 'Niederlagen',
        'players.draws': 'Unentschieden',
        'players.status': 'Status',
        'players.action': 'Aktion',
        'players.provisional': 'Vorläufig',
        'players.confirmed': 'Bestätigt',
        'players.viewProfile': 'Profil',
        'players.noPlayers': 'Keine Spieler',
        'players.noMatch': 'Keine Spieler entsprechen der Suche',
        'players.loadError': 'Fehler beim Laden der Spieler',
        'players.loading': 'Spieler werden geladen...',
        
        // Profile
        'profile.myProfile': 'Mein Profil',
        'profile.generalElo': 'Allgemeine ELO',
        'profile.eloByCategory': 'ELO nach Kategorie',
        'profile.data': 'Daten',
        'profile.actions': 'Aktionen',
        'profile.username': 'Benutzername',
        'profile.email': 'E-Mail',
        'profile.changePhoto': 'Foto ändern',
        'profile.role': 'Rolle',
        'profile.player': 'Spieler',
        'profile.admin': 'Administrator',
        'profile.totalMatches': 'Gesamte Spiele',
        'profile.winRate': 'Gewinnrate',
        'profile.titles': 'Meine Titel',
        'profile.tournaments': 'Meine Turniere',
        'profile.friends': 'Meine Freunde',
        'profile.friendRequests': 'Freundschaftsanfragen',
        'profile.history': 'Turniergeschichte',
        'profile.noTitle': 'Kein Titel',
        'profile.logout': 'Abmelden',
        'profile.provisional': 'Vorläufig',
        'profile.matchesPlayed': 'Spiele',
        'profile.tournamentsPlayed': 'Gespielte Turniere',
        'profile.wins': 'Siege',
        'profile.tournamentsCreated': 'Erstellte Turniere',
        'profile.matchesLabel': 'Spiele',
        'profile.winPercentage': 'Gewinnquote',
        'profile.noStats': 'Keine Statistiken',
        'profile.noStatsDesc': 'Spielen Sie Turniere, um Ihre Statistiken zu sehen',
        'profile.statsUnavailable': 'Statistiken derzeit nicht verfügbar',
        'profile.statsUnavailableDesc': 'Gespielte Turniere werden hier angezeigt',
        'profile.noHistory': 'Noch keine Turniergeschichte',
        'profile.historyUnavailable': 'Geschichte derzeit nicht verfügbar',
        'profile.imageTooLarge': 'Bild ist zu groß (max 5MB)',
        'profile.pleaseSelectImage': 'Bitte wählen Sie ein Bild',
        'profile.pictureUploaded': 'Profilbild erfolgreich hochgeladen!',
        'profile.pictureUploadError': 'Fehler beim Hochladen des Bildes',
        'profile.active': 'Aktiv',
        'profile.noTitles': 'Noch keine Titel. Gewinnen Sie sie in Turnieren!',
        'profile.titlesError': 'Fehler beim Laden der Titel',
        'profile.titleSet': 'Aktiver Titel gesetzt!',
        'profile.titleSetError': 'Fehler beim Setzen des Titels',
        'profile.titleRemoved': 'Titel entfernt',
        'profile.noFriends': 'Noch keine Freunde',
        'profile.addFriendsHint': 'Fügen Sie Freunde aus der Spielerliste hinzu!',
        'profile.friendsError': 'Fehler beim Laden der Freunde',
        'profile.accept': 'Akzeptieren',
        'profile.decline': 'Ablehnen',
        'profile.pendingRequests': 'ausstehende Anfragen',
        'profile.friendAccepted': 'Freundschaft akzeptiert!',
        'profile.acceptError': 'Fehler beim Akzeptieren der Anfrage',
        'profile.requestDeclined': 'Anfrage abgelehnt',
        'profile.declineError': 'Fehler beim Ablehnen der Anfrage',
        'profile.noTournaments': 'Sie sind in keinem Turnier',
        'profile.createTournament': 'Turnier erstellen',
        'profile.tournamentsError': 'Fehler beim Laden der Turniere',
        
        // Player Profile (viewing others)
        'playerProfile.notFound': 'Spieler nicht gefunden',
        'playerProfile.info': 'Informationen',
        'playerProfile.actions': 'Aktionen',
        'playerProfile.challenge': 'Zum Spiel herausfordern',
        'playerProfile.addFriend': 'Freund hinzufügen',
        'playerProfile.experienceLevel': 'Erfahrungsstufe',
        'playerProfile.levelBeginner': 'Anfänger',
        'playerProfile.levelIntermediate': 'Fortgeschritten',
        'playerProfile.levelAdvanced': 'Erfahren',
        'playerProfile.rankedMatches': 'Gewertete Spiele',
        'playerProfile.memberSince': 'Mitglied seit',
        'playerProfile.errorLoading': 'Fehler beim Laden des Profils',
        'playerProfile.requestSent': 'Anfrage gesendet!',
        'playerProfile.requestError': 'Fehler beim Senden der Anfrage',
        'playerProfile.friends': 'Freunde',
        'playerProfile.requestPending': 'Anfrage gesendet',
        'playerProfile.acceptRequest': 'Anfrage akzeptieren',
        'playerProfile.removeFriendConfirm': 'Sind Sie sicher, dass Sie diesen Freund entfernen möchten?',
        'playerProfile.friendRemoved': 'Freund entfernt',
        
        // Challenge Modal
        'challenge.title': 'Spieler herausfordern',
        'challenge.quickTime': 'Schnelle Zeitwahl',
        'challenge.customTime': 'Benutzerdefinierte Zeit',
        'challenge.minutesPerPlayer': 'Minuten pro Spieler',
        'challenge.increment': 'Inkrement (Sekunden)',
        'challenge.chooseColor': 'Farbe wählen',
        'challenge.random': 'Zufällig',
        'challenge.white': 'Weiß',
        'challenge.black': 'Schwarz',
        'challenge.cancel': 'Abbrechen',
        'challenge.send': 'Herausforderung senden',
        'challenge.sent': 'Herausforderung gesendet!',
        'challenge.sendError': 'Fehler beim Senden der Herausforderung',
        'challenge.sending': 'Sende...',
        'challenge.sentNotification': 'Herausforderung gesendet! Der andere Spieler wird benachrichtigt.',
        'common.success': 'Erfolgreich!',
        
        // Settings
        'settings.title': 'Einstellungen',
        'settings.subtitle': 'Passen Sie die Anwendung an Ihre Bedürfnisse an',
        'settings.language': 'Anwendungssprache',
        'settings.selectLanguage': 'Sprache auswählen',
        'settings.theme': 'Anwendungsthema',
        'settings.selectTheme': 'Wählen Sie das beste Thema für Sie',
        'settings.pieceDesign': 'Figurendesign',
        'settings.selectPieceDesign': 'Schachfigurstil wählen',
        'settings.boardDesign': 'Schachbrettdesign',
        'settings.selectBoardDesign': 'Schachbrettfarben wählen',
        'settings.interface': 'Oberfläche',
        'settings.notifications': 'Benachrichtigungen',
        'settings.privacy': 'Privatsphäre',
        'settings.gameplay': 'Spieleinstellungen',
        'settings.saved': 'Gespeichert ✓',
        'settings.emailNotifications': 'E-Mail-Benachrichtigungen',
        'settings.emailNotifications.desc': 'E-Mail-Benachrichtigungen über neue Turniere erhalten',
        'settings.pushNotifications': 'Push-Benachrichtigungen',
        'settings.pushNotifications.desc': 'Benachrichtigungen im Browser anzeigen',
        'settings.soundNotifications': 'Tonbenachrichtigungen',
        'settings.soundNotifications.desc': 'Ton bei neuen Spielen abspielen',
        'settings.changePassword': 'Passwort ändern',
        'settings.changePassword.desc': 'Ändern Sie Ihr Kontopasswort',
        'settings.changePassword.btn': 'Passwort ändern',
        'settings.changePassword.current': 'Aktuelles Passwort',
        'settings.changePassword.currentPlaceholder': 'Aktuelles Passwort eingeben',
        'settings.changePassword.new': 'Neues Passwort',
        'settings.changePassword.newPlaceholder': 'Neues Passwort eingeben (mind. 6 Zeichen)',
        'settings.changePassword.confirm': 'Neues Passwort bestätigen',
        'settings.changePassword.confirmPlaceholder': 'Neues Passwort wiederholen',
        'settings.changePassword.submit': 'Ändern',
        'settings.dangerZone': 'Gefahrenzone',
        'settings.dangerZone.desc': 'Sobald Sie Ihr Konto löschen, gibt es kein Zurück. Alle Ihre Daten werden dauerhaft gelöscht.',
        'settings.deleteAccount': 'Mein Konto löschen',
        'settings.deleteAccount.title': 'Kontolöschung bestätigen',
        'settings.deleteAccount.confirm': 'Sind Sie sicher, dass Sie Ihr Konto dauerhaft löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        'settings.deleteAccount.passwordLabel': 'Passwort zur Bestätigung eingeben:',
        'settings.deleteAccount.passwordPlaceholder': 'Ihr Passwort',
        'settings.deleteAccount.submit': 'Konto löschen',
        'settings.cancel': 'Abbrechen',
        'settings.publicProfile': 'Öffentliches Profil',
        'settings.publicProfile.desc': 'Andere Spieler können dein Profil sehen',
        'settings.showOnline': 'Online-Status anzeigen',
        'settings.showOnline.desc': 'Andere können sehen, wann du online bist',
        'settings.showRating': 'Bewertung anzeigen',
        'settings.showRating.desc': 'Deine ELO-Bewertung ist für andere sichtbar',
        'settings.confirmMove': 'Zug bestätigen',
        'settings.confirmMove.desc': 'Bestätigung vor dem Senden des Zugs anfordern',
        'settings.animatePieces': 'Figuranimationen',
        'settings.animatePieces.desc': 'Figurenbewegung animieren',
        'settings.compactMode': 'Kompaktansicht',
        'settings.compactMode.desc': 'Abstände zwischen Elementen reduzieren',
        'settings.autoQueen': 'Automatische Damenumwandlung',
        'settings.showLegalMoves': 'Legale Züge anzeigen',
        'settings.tabsPosition': 'Position der Navigationsregisterkarten',
        'settings.tabsPosition.hint': 'Wählen Sie, wo die Navigationsregisterkarten angezeigt werden sollen',
        'settings.tabsPosition.top': 'Oben (horizontal)',
        'settings.tabsPosition.left': 'Links (vertikal)',
        
        // Help page
        'help.title': 'Hilfe & Support',
        'help.subtitle': 'Finden Sie Antworten auf häufig gestellte Fragen',
        'help.videoTutorials': 'Video-Tutorials',
        'help.video.createTournament': 'So erstellen Sie ein Turnier',
        'help.video.joinTournament': 'Einem Turnier beitreten',
        'help.video.playGame': 'Ein Spiel spielen',
        'help.video.duration': 'Dauer',
        'help.faq': 'Häufig gestellte Fragen (FAQ)',
        'help.faq.createTournament': 'Wie erstelle ich ein neues Turnier?',
        'help.faq.createTournamentAnswer': 'Klicken Sie auf der Startseite auf "Turnier erstellen", füllen Sie die Details aus und bestätigen Sie.',
        'help.faq.eloRating': 'Wie funktioniert das ELO-Bewertungssystem?',
        'help.faq.eloRatingAnswer': 'Das ELO-System berechnet die Bewertung basierend auf Siegen und Niederlagen.',
        'help.faq.changeTheme': 'Wie ändere ich das App-Thema?',
        'help.faq.changeThemeAnswer': 'Klicken Sie auf den Themen-Wähler oben rechts und wählen Sie Ihr bevorzugtes Thema.',
        'help.faq.joinTournament': 'Wie trete ich einem Turnier bei?',
        'help.faq.joinTournamentAnswer': 'Sie können mit einem Turniercode oder durch Auswahl aus der Liste beitreten.',
        'help.faq.forgotPassword': 'Was ist, wenn ich mein Passwort vergesse?',
        'help.faq.forgotPasswordAnswer': 'Klicken Sie auf der Anmeldeseite auf "Passwort vergessen?" und folgen Sie den Anweisungen.',
        'help.faq.changeBoardDesign': 'Wie ändere ich das Schachbrett-Design?',
        'help.faq.changeBoardDesignAnswer': 'Gehen Sie zu Einstellungen und wählen Sie Ihr Design im Abschnitt "Schachbrett-Design".',
        'help.faq.watchGames': 'Kann ich Spiele anderer Spieler ansehen?',
        'help.faq.watchGamesAnswer': 'Ja! Gehen Sie zu einem Turnier und klicken Sie auf ein aktives Spiel, um live zuzuschauen.',
        'help.faq.notifications': 'Wie funktionieren Benachrichtigungen?',
        'help.faq.notificationsAnswer': 'Sie erhalten Benachrichtigungen für neue Turniere, wenn Sie an der Reihe sind, und Spielergebnisse.',
        'help.contact': 'War das nicht hilfreich?',
        'help.contactSubtitle': 'Kontaktieren Sie uns für weitere Hilfe',
        'help.emailSupport': 'E-Mail-Support',
        'help.liveChat': 'Live-Chat',
        
        // Themes
        'theme.light': 'Hell',
        'theme.light.desc': 'Klassisches Thema',
        'theme.dark': 'Dunkel',
        'theme.dark.desc': 'Dunkler Modus',
        'theme.blue': 'Blauer Ozean',
        'theme.blue.desc': 'Ruhiges Blau',
        'theme.purple': 'Lila Traum',
        'theme.purple.desc': 'Elegant',
        'theme.green': 'Grüner Wald',
        'theme.green.desc': 'Natürlich',
        'theme.sunset': 'Sonnenuntergang',
        'theme.sunset.desc': 'Warm',
        
        // Piece styles
        'piece.classic': 'Klassisch',
        'piece.classic.desc': 'Standard Unicode',
        'piece.modern': 'Modern',
        'piece.modern.desc': 'Zeitgenössische Figuren',
        'piece.bold': 'Fett',
        'piece.bold.desc': 'Fette Figuren',
        
        // Board styles
        'board.classic': 'Klassisch',
        'board.classic.desc': 'Braun & Beige',
        'board.wood': 'Holz',
        'board.wood.desc': 'Dunkles Holz',
        'board.green': 'Grün',
        'board.green.desc': 'Turnier',
        'board.blue': 'Blau',
        'board.blue.desc': 'Modern',
        
        // Select options
        'option.always': 'Immer',
        'option.ask': 'Fragen',
        'option.never': 'Nie',
        'option.hover': 'Beim Schweben',
        
        // Help
        'help.title': 'Hilfe & Support',
        'help.subtitle': 'Finden Sie Antworten auf häufige Fragen',
        'help.videoTutorials': 'Video-Tutorials',
        'help.faq': 'Häufig gestellte Fragen',
        'help.contact': 'Kontaktieren Sie uns für weitere Hilfe',
        'help.emailSupport': 'E-Mail-Support',
        'help.liveChat': 'Live-Chat',
        
        // Notifications
        'notifications.title': 'Benachrichtigungen',
        'notifications.markAll': 'Alle markieren',
        'notifications.empty': 'Keine neuen Benachrichtigungen',
        'notifications.acceptChallenge': 'Herausforderung annehmen',
        'notifications.joinMatch': 'Spiel beitreten',
        
        // Errors
        'error.generic': 'Ein Fehler ist aufgetreten',
        'error.network': 'Verbindungsfehler',
        'error.unauthorized': 'Zugriff verweigert',
        'error.notFound': 'Nicht gefunden',
        
        // Success
        'success.saved': 'Erfolgreich gespeichert',
        'success.deleted': 'Erfolgreich gelöscht',
        'success.joined': 'Erfolgreich beigetreten',
    },
    
    es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.players': 'Jugadores',
        'nav.profile': 'Perfil',
        'nav.admin': 'Admin',
        'nav.settings': 'Configuración',
        'nav.help': 'Ayuda',
        'nav.logout': 'Cerrar sesión',
        
        // Common
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.create': 'Crear',
        'common.back': 'Atrás',
        'common.next': 'Siguiente',
        'common.loading': 'Cargando...',
        'common.search': 'Buscar',
        'common.close': 'Cerrar',
        'common.confirm': 'Confirmar',
        'common.yes': 'Sí',
        'common.no': 'No',
        'common.or': 'o',
        'common.showAll': 'Mostrar todo',
        'common.error': 'Error',
        
        // Auth
        'auth.login': 'Iniciar sesión',
        'auth.register': 'Registrarse',
        'auth.username': 'Nombre de usuario',
        'auth.password': 'Contraseña',
        'auth.email': 'Correo electrónico',
        'auth.loginBtn': 'Entrar',
        'auth.registerBtn': 'Registrarse',
        'auth.noAccount': '¿No tienes cuenta?',
        'auth.hasAccount': '¿Ya tienes cuenta?',
        'auth.loginWithGoogle': 'Iniciar sesión con Google',
        'auth.forgotPassword': '¿Olvidaste tu contraseña?',
        'auth.loginSubtitle': 'Inicia sesión en tu cuenta',
        'auth.registerSubtitle': 'Crea una cuenta nueva',
        'auth.usernamePlaceholder': 'Ingresa nombre de usuario',
        'auth.passwordPlaceholder': 'Ingresa contraseña',
        'auth.emailPlaceholder': 'Ingresa correo electrónico',
        'auth.confirmPassword': 'Confirmar contraseña',
        'auth.confirmPasswordPlaceholder': 'Vuelve a ingresar la contraseña',
        'auth.passwordMinHint': 'Ingresa contraseña (mín. 6 caracteres)',
        'auth.experienceLevel': 'Tu experiencia en ajedrez',
        'auth.experienceSelect': '-- Selecciona nivel --',
        'auth.experienceBeginner': '🌱 Principiante (400 ELO)',
        'auth.experienceIntermediate': '♟️ Conozco el juego (700 ELO)',
        'auth.experienceAdvanced': '👑 Experimentado (1000 ELO)',
        'auth.experienceHint': 'Esto determina tu calificación ELO inicial. No te preocupes, la calificación se ajustará automáticamente después de tus primeras partidas.',
        'auth.usernameMinError': 'El nombre de usuario debe tener al menos 3 caracteres',
        'auth.invalidEmailError': 'Por favor ingresa un correo válido',
        'auth.passwordMinError': 'La contraseña debe tener al menos 6 caracteres',
        'auth.passwordMismatchError': 'Las contraseñas no coinciden',
        'auth.formErrors': 'Por favor corrige los errores en el formulario',
        'auth.forgotPasswordInfo': 'Para restablecer tu contraseña, contacta al administrador en support@cotisa.hr',
        'auth.enterCredentials': 'Por favor ingresa usuario y contraseña',
        'auth.welcomeUser': 'Bienvenido',
        'auth.loggingIn': 'Iniciando sesión...',
        'auth.googleLoginError': 'Error al iniciar sesión con Google',
        'auth.serverError': 'Error al conectar con el servidor',
        'auth.loginWithGoogle': 'Iniciar sesión con Google',
        'auth.forgotPassword': '¿Olvidaste tu contraseña?',
        
        // Dashboard
        'dashboard.welcome': 'Bienvenido',
        'dashboard.subtitle': 'Administra tus torneos y sigue las competiciones',
        'dashboard.createTournament': 'Crear nuevo torneo',
        'dashboard.joinTournament': 'Unirse con código',
        'dashboard.refresh': 'Actualizar',
        'dashboard.activeTournaments': 'Todos los torneos activos',
        'dashboard.loadingTournaments': 'Cargando torneos...',
        'dashboard.noTournaments': 'Sin torneos',
        'dashboard.noTournamentsDesc': 'No hay torneos activos en este momento',
        'dashboard.errorLoading': 'Error al cargar',
        'dashboard.joinSuccess': '¡Te has unido al torneo exitosamente!',
        'dashboard.joinError': 'Error al unirse',
        'dashboard.noCode': 'El torneo no tiene código',
        
        // Tournament
        'tournament.name': 'Nombre del torneo',
        'tournament.type': 'Tipo de torneo',
        'tournament.elimination': 'Eliminación',
        'tournament.roundRobin': 'Todos contra todos',
        'tournament.players': 'Jugadores',
        'tournament.created': 'Creado',
        'tournament.creator': 'Creador',
        'tournament.createdBy': 'Creado por',
        'tournament.status': 'Estado',
        'tournament.active': 'Activo',
        'tournament.rating': 'Puntuación',
        'tournament.completed': 'Completado',
        'tournament.pending': 'Pendiente',
        'tournament.details': 'Detalles',
        'tournament.join': 'Unirse',
        'tournament.joinTitle': 'Unirse al torneo',
        'tournament.start': 'Iniciar torneo',
        'tournament.code': 'Código del torneo',
        'tournament.codeForJoin': 'Código del torneo para unirse',
        'tournament.copyCode': 'Copiar código',
        'tournament.enterCode': 'Ingresa el código de 6 dígitos',
        'tournament.delete': 'Eliminar torneo',
        'tournament.participants': 'Participantes',
        'tournament.noParticipants': 'Sin participantes',
        'tournament.noParticipantsDesc': 'Nadie se ha unido al torneo todavía',
        'tournament.matches': 'Partidas',
        'tournament.back': 'Volver',
        'tournament.create': 'Crear torneo',
        'tournament.createTitle': 'Crear nuevo torneo',
        'tournament.createSubtitle': 'Completa los datos para crear un nuevo torneo',
        'tournament.tournamentName': 'Nombre del torneo',
        'tournament.maxPlayers': 'Número máximo de jugadores',
        'tournament.timePerPlayer': 'Tiempo por jugador (minutos)',
        'tournament.increment': 'Incremento por movimiento (segundos)',
        'tournament.advancedSettings': 'Configuración avanzada',
        'tournament.tournamentType': 'Tipo de torneo',
        'tournament.typeElimination': 'Eliminación (Bracket)',
        'tournament.typeRoundRobin': 'Todos contra todos',
        'tournament.pairingSystem': 'Sistema de emparejamiento',
        'tournament.pairingRandom': 'Aleatorio',
        'tournament.pairingRating': 'Por rating',
        'tournament.pairingSwiss': 'Sistema suizo',
        'tournament.pairingManual': 'Manual',
        'tournament.pairingHint': 'Cómo se emparejarán los jugadores en las partidas',
        'tournament.startDate': 'Fecha de inicio',
        'tournament.startDateHint': 'El torneo dura hasta que todos los jugadores terminen sus partidas',
        'tournament.description': 'Descripción (opcional)',
        'tournament.descriptionPlaceholder': 'Añade descripción, reglas o notas para jugadores...',
        'tournament.isPublic': 'Torneo público',
        'tournament.isPublicHint': 'Si está marcado, el torneo será visible en la lista "Todos los torneos".',
        'tournament.creatorPlays': 'Juego como participante',
        'tournament.creatorPlaysHint': 'Si no está marcado, solo será organizador y podrá ver los juegos.',
        'tournament.namePlaceholder': 'ej. Copa de Primavera 2025',
        'tournament.maxPlayersPlaceholder': 'ej. 8, 16, 32',
        'tournament.maxPlayersHint': 'Recomendado para eliminación: 4, 8, 16, 32. Para todos-contra-todos cualquier número.',
        'tournament.timePlaceholder': 'ej. 5, 10, 15',
        'tournament.timeHint': 'Tiempo en minutos por jugador. Bullet: ≤3 min | Blitz: 3-10 min | Rapid: 10-60 min | Classical: >60 min',
        'tournament.incrementPlaceholder': 'ej. 0, 2, 5',
        'tournament.incrementHint': 'Segundos adicionales después de cada movimiento (0 para sin incremento)',
        'tournament.howToGetCode': '¿Cómo obtener el código?',
        'tournament.codeExplanation': 'El código del torneo lo obtiene del organizador. Es un número único de 6 dígitos.',
        'tournament.yourCode': 'Tu código de torneo',
        'tournament.startConfirm': '¿Desea iniciar el torneo? Después de iniciar, no podrán unirse nuevos jugadores.',
        'tournament.startSuccess': '¡Torneo iniciado exitosamente!',
        'tournament.delete': 'Eliminar torneo',
        'tournament.codeCopied': '¡Código copiado!',
        'tournament.elo': 'ELO',
        'tournament.seed': 'Posición',
        'tournament.provisional': 'Provisional',
        'tournament.eliminated': 'Eliminado',
        'tournament.loading': 'Cargando torneo...',
        'tournament.noMatches': 'Sin partidas',
        'tournament.match': 'Partida',
        'tournament.finished': 'Terminado',
        'tournament.inProgress': 'En curso',
        'tournament.round': 'Ronda',
        'tournament.winner': 'Ganador',
        'tournament.joinMatch': 'Unirse a la partida',
        'tournament.play': 'Jugar',
        'tournament.wins': 'gana',
        'tournament.errorLoading': 'Error al cargar el torneo',
        'tournament.backToDashboard': 'Volver al Dashboard',
        'tournament.playersCount': 'jugadores',
        'tournament.tournamentCount': 'torneos',
        'tournament.tournamentCountSingular': 'torneo',
        'tournament.place': 'lugar',
        'tournament.waiting': 'Esperando',
        'tournament.spectatingTitle': 'Partidas en curso - Observar',
        'tournament.spectatingDesc': 'Mientras esperas tu partida, ¡puedes observar otras partidas!',
        'tournament.turnLabel': 'Turno',
        'tournament.whitePlayer': 'Blancas',
        'tournament.blackPlayer': 'Negras',
        'tournament.movesCount': 'movimientos',
        'tournament.spectate': 'Observar',
        'tournament.started': '¡Torneo iniciado!',
        'tournament.deleteConfirm': '¿Estás seguro de que quieres ELIMINAR este torneo? ¡Esta acción no se puede deshacer!',
        'tournament.deleted': '¡Torneo eliminado!',
        'tournament.deleteError': 'Error al eliminar el torneo',
        'tournament.gameCreateError': 'Error al crear la partida',
        'tournament.confirmWinner': '¿Confirmar ganador?',
        'tournament.resultUpdated': '¡Resultado actualizado!',
        
        // Players
        'players.title': 'Jugadores',
        'players.subtitle': 'Ver todos los jugadores y visitar sus perfiles',
        'players.ranking': 'Clasificación',
        'players.searchPlayers': 'Buscar jugadores...',
        'players.player': 'Jugador',
        'players.elo': 'ELO',
        'players.wins': 'Victorias',
        'players.losses': 'Derrotas',
        'players.draws': 'Empates',
        'players.status': 'Estado',
        'players.action': 'Acción',
        'players.provisional': 'Provisional',
        'players.confirmed': 'Confirmado',
        'players.viewProfile': 'Perfil',
        'players.noPlayers': 'Sin jugadores',
        'players.noMatch': 'Ningún jugador coincide con la búsqueda',
        'players.loadError': 'Error al cargar jugadores',
        'players.loading': 'Cargando jugadores...',
        
        // Profile
        'profile.myProfile': 'Mi Perfil',
        'profile.generalElo': 'ELO General',
        'profile.eloByCategory': 'ELO por categoría',
        'profile.data': 'Datos',
        'profile.actions': 'Acciones',
        'profile.username': 'Nombre de usuario',
        'profile.email': 'Correo electrónico',
        'profile.changePhoto': 'Cambiar foto',
        'profile.role': 'Rol',
        'profile.player': 'Jugador',
        'profile.admin': 'Administrador',
        'profile.totalMatches': 'Partidas totales',
        'profile.winRate': 'Porcentaje de victorias',
        'profile.titles': 'Mis títulos',
        'profile.tournaments': 'Mis torneos',
        'profile.friends': 'Mis amigos',
        'profile.friendRequests': 'Solicitudes de amistad',
        'profile.history': 'Historial de torneos',
        'profile.noTitle': 'Sin título',
        'profile.logout': 'Cerrar sesión',
        'profile.provisional': 'Provisional',
        'profile.matchesPlayed': 'partidas',
        'profile.tournamentsPlayed': 'Torneos jugados',
        'profile.wins': 'Victorias',
        'profile.tournamentsCreated': 'Torneos creados',
        'profile.matchesLabel': 'Partidas',
        'profile.winPercentage': 'Porcentaje de victorias',
        'profile.noStats': 'Sin estadísticas',
        'profile.noStatsDesc': 'Empieza a jugar torneos para ver tus estadísticas',
        'profile.statsUnavailable': 'Estadísticas no disponibles',
        'profile.statsUnavailableDesc': 'Los torneos que juegues se mostrarán aquí',
        'profile.noHistory': 'Aún no hay historial de torneos',
        'profile.historyUnavailable': 'Historial no disponible actualmente',
        'profile.imageTooLarge': 'La imagen es demasiado grande (máx 5MB)',
        'profile.pleaseSelectImage': 'Por favor seleccione una imagen',
        'profile.pictureUploaded': '¡Foto de perfil subida correctamente!',
        'profile.pictureUploadError': 'Error al subir la imagen',
        'profile.active': 'Activo',
        'profile.noTitles': 'Aún no tienes títulos. ¡Gánalos en torneos!',
        'profile.titlesError': 'Error al cargar los títulos',
        'profile.titleSet': '¡Título activo establecido!',
        'profile.titleSetError': 'Error al establecer el título',
        'profile.titleRemoved': 'Título eliminado',
        'profile.noFriends': 'Aún no tienes amigos',
        'profile.addFriendsHint': '¡Añade amigos desde la lista de jugadores!',
        'profile.friendsError': 'Error al cargar amigos',
        'profile.accept': 'Aceptar',
        'profile.decline': 'Rechazar',
        'profile.pendingRequests': 'solicitudes pendientes',
        'profile.friendAccepted': '¡Amistad aceptada!',
        'profile.acceptError': 'Error al aceptar la solicitud',
        'profile.requestDeclined': 'Solicitud rechazada',
        'profile.declineError': 'Error al rechazar la solicitud',
        'profile.noTournaments': 'No estás en ningún torneo',
        'profile.createTournament': 'Crear torneo',
        'profile.tournamentsError': 'Error al cargar torneos',
        
        // Player Profile (viewing others)
        'playerProfile.notFound': 'Jugador no encontrado',
        'playerProfile.info': 'Información',
        'playerProfile.actions': 'Acciones',
        'playerProfile.challenge': 'Desafiar a partida',
        'playerProfile.addFriend': 'Añadir amigo',
        'playerProfile.experienceLevel': 'Nivel de experiencia',
        'playerProfile.levelBeginner': 'Principiante',
        'playerProfile.levelIntermediate': 'Intermedio',
        'playerProfile.levelAdvanced': 'Avanzado',
        'playerProfile.rankedMatches': 'Partidas clasificadas',
        'playerProfile.memberSince': 'Miembro desde',
        'playerProfile.errorLoading': 'Error al cargar el perfil',
        'playerProfile.requestSent': '¡Solicitud enviada!',
        'playerProfile.requestError': 'Error al enviar la solicitud',
        'playerProfile.friends': 'Amigos',
        'playerProfile.requestPending': 'Solicitud enviada',
        'playerProfile.acceptRequest': 'Aceptar solicitud',
        'playerProfile.removeFriendConfirm': '¿Estás seguro de que quieres eliminar a este amigo?',
        'playerProfile.friendRemoved': 'Amigo eliminado',
        
        // Challenge Modal
        'challenge.title': 'Desafiar jugador',
        'challenge.quickTime': 'Selección rápida de tiempo',
        'challenge.customTime': 'Tiempo personalizado',
        'challenge.minutesPerPlayer': 'Minutos por jugador',
        'challenge.increment': 'Incremento (segundos)',
        'challenge.chooseColor': 'Elegir color',
        'challenge.random': 'Aleatorio',
        'challenge.white': 'Blancas',
        'challenge.black': 'Negras',
        'challenge.cancel': 'Cancelar',
        'challenge.send': 'Enviar desafío',
        'challenge.sent': '¡Desafío enviado!',
        'challenge.sendError': 'Error al enviar el desafío',
        'challenge.sending': 'Enviando...',
        'challenge.sentNotification': '¡Desafío enviado! El otro jugador será notificado.',
        'common.success': '¡Éxito!',
        
        // Settings
        'settings.title': 'Configuración',
        'settings.subtitle': 'Personaliza la aplicación según tus necesidades',
        'settings.language': 'Idioma de la aplicación',
        'settings.selectLanguage': 'Selecciona el idioma de la interfaz',
        'settings.theme': 'Tema de la aplicación',
        'settings.selectTheme': 'Elige el tema que más te guste',
        'settings.pieceDesign': 'Diseño de piezas',
        'settings.selectPieceDesign': 'Elige el estilo de las piezas',
        'settings.boardDesign': 'Diseño del tablero',
        'settings.selectBoardDesign': 'Elige los colores del tablero',
        'settings.interface': 'Apariencia de la interfaz',
        'settings.notifications': 'Notificaciones',
        'settings.privacy': 'Privacidad',
        'settings.gameplay': 'Configuración del juego',
        'settings.saved': 'Guardado ✓',
        'settings.emailNotifications': 'Notificaciones por email',
        'settings.emailNotifications.desc': 'Recibir notificaciones sobre nuevos torneos por email',
        'settings.pushNotifications': 'Notificaciones push',
        'settings.pushNotifications.desc': 'Mostrar notificaciones en el navegador',
        'settings.soundNotifications': 'Notificaciones de sonido',
        'settings.soundNotifications.desc': 'Reproducir sonido en nuevas partidas',
        'settings.changePassword': 'Cambiar contraseña',
        'settings.changePassword.desc': 'Cambia la contraseña de tu cuenta',
        'settings.changePassword.btn': 'Cambiar contraseña',
        'settings.changePassword.current': 'Contraseña actual',
        'settings.changePassword.currentPlaceholder': 'Ingresa la contraseña actual',
        'settings.changePassword.new': 'Nueva contraseña',
        'settings.changePassword.newPlaceholder': 'Ingresa la nueva contraseña (mín. 6 caracteres)',
        'settings.changePassword.confirm': 'Confirmar nueva contraseña',
        'settings.changePassword.confirmPlaceholder': 'Repite la nueva contraseña',
        'settings.changePassword.submit': 'Cambiar',
        'settings.dangerZone': 'Zona de peligro',
        'settings.dangerZone.desc': 'Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos serán eliminados permanentemente.',
        'settings.deleteAccount': 'Eliminar mi cuenta',
        'settings.deleteAccount.title': 'Confirmar eliminación de cuenta',
        'settings.deleteAccount.confirm': '¿Estás seguro de que deseas eliminar permanentemente tu cuenta? Esta acción no se puede deshacer.',
        'settings.deleteAccount.passwordLabel': 'Ingresa la contraseña para confirmar:',
        'settings.deleteAccount.passwordPlaceholder': 'Tu contraseña',
        'settings.deleteAccount.submit': 'Eliminar cuenta',
        'settings.cancel': 'Cancelar',
        'settings.publicProfile': 'Perfil público',
        'settings.publicProfile.desc': 'Otros jugadores pueden ver tu perfil',
        'settings.showOnline': 'Mostrar estado en línea',
        'settings.showOnline.desc': 'Otros pueden ver cuando estás conectado',
        'settings.showRating': 'Mostrar puntuación',
        'settings.showRating.desc': 'Tu rating ELO es visible para otros',
        'settings.confirmMove': 'Confirmar movimiento',
        'settings.confirmMove.desc': 'Pedir confirmación antes de enviar movimiento',
        'settings.animatePieces': 'Animaciones de piezas',
        'settings.animatePieces.desc': 'Animar movimiento de piezas',
        'settings.compactMode': 'Vista compacta',
        'settings.compactMode.desc': 'Reducir espaciado entre elementos',
        'settings.autoQueen': 'Promoción automática de dama',
        'settings.showLegalMoves': 'Mostrar movimientos legales',
        'settings.tabsPosition': 'Posición de las pestañas de navegación',
        'settings.tabsPosition.hint': 'Elige dónde quieres que aparezcan las pestañas de navegación',
        'settings.tabsPosition.top': 'Arriba (horizontal)',
        'settings.tabsPosition.left': 'Izquierda (vertical)',
        
        // Help page
        'help.title': 'Ayuda y Soporte',
        'help.subtitle': 'Encuentra respuestas a preguntas frecuentes',
        'help.videoTutorials': 'Tutoriales en Video',
        'help.video.createTournament': 'Cómo crear un torneo',
        'help.video.joinTournament': 'Unirse a un torneo',
        'help.video.playGame': 'Jugar una partida',
        'help.video.duration': 'Duración',
        'help.faq': 'Preguntas Frecuentes (FAQ)',
        'help.faq.createTournament': '¿Cómo creo un nuevo torneo?',
        'help.faq.createTournamentAnswer': 'En la página principal, haz clic en "Crear torneo", completa los detalles y confirma.',
        'help.faq.eloRating': '¿Cómo funciona el sistema de rating ELO?',
        'help.faq.eloRatingAnswer': 'El sistema ELO calcula el rating basado en victorias y derrotas.',
        'help.faq.changeTheme': '¿Cómo cambio el tema de la aplicación?',
        'help.faq.changeThemeAnswer': 'Haz clic en el selector de temas en la esquina superior derecha y elige tu tema preferido.',
        'help.faq.joinTournament': '¿Cómo me uno a un torneo?',
        'help.faq.joinTournamentAnswer': 'Puedes unirte usando un código de torneo o seleccionando uno de la lista.',
        'help.faq.forgotPassword': '¿Qué pasa si olvido mi contraseña?',
        'help.faq.forgotPasswordAnswer': 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y sigue las instrucciones.',
        'help.faq.changeBoardDesign': '¿Cómo cambio el diseño del tablero de ajedrez?',
        'help.faq.changeBoardDesignAnswer': 'Ve a Configuración y selecciona tu diseño preferido en la sección "Diseño del Tablero".',
        'help.faq.watchGames': '¿Puedo ver partidas de otros jugadores?',
        'help.faq.watchGamesAnswer': '¡Sí! Ve a un torneo y haz clic en una partida activa para ver en vivo.',
        'help.faq.notifications': '¿Cómo funcionan las notificaciones?',
        'help.faq.notificationsAnswer': 'Recibes notificaciones de nuevos torneos, cuando es tu turno y resultados de partidas.',
        'help.contact': '¿No fue útil?',
        'help.contactSubtitle': 'Contáctanos para ayuda adicional',
        'help.emailSupport': 'Soporte por Email',
        'help.liveChat': 'Chat en Vivo',
        
        // Themes
        'theme.light': 'Claro',
        'theme.light.desc': 'Tema clásico',
        'theme.dark': 'Oscuro',
        'theme.dark.desc': 'Modo oscuro',
        'theme.blue': 'Océano Azul',
        'theme.blue.desc': 'Azul tranquilo',
        'theme.purple': 'Sueño Púrpura',
        'theme.purple.desc': 'Elegante',
        'theme.green': 'Bosque Verde',
        'theme.green.desc': 'Natural',
        'theme.sunset': 'Atardecer',
        'theme.sunset.desc': 'Cálido',
        
        // Piece styles
        'piece.classic': 'Clásicas',
        'piece.classic.desc': 'Unicode estándar',
        'piece.modern': 'Modernas',
        'piece.modern.desc': 'Piezas contemporáneas',
        'piece.bold': 'Negrita',
        'piece.bold.desc': 'Piezas en negrita',
        
        // Board styles
        'board.classic': 'Clásico',
        'board.classic.desc': 'Marrón y beige',
        'board.wood': 'Madera',
        'board.wood.desc': 'Madera oscura',
        'board.green': 'Verde',
        'board.green.desc': 'Torneo',
        'board.blue': 'Azul',
        'board.blue.desc': 'Moderno',
        
        // Select options
        'option.always': 'Siempre',
        'option.ask': 'Preguntar',
        'option.never': 'Nunca',
        'option.hover': 'Al pasar',
        
        // Help
        'help.title': 'Ayuda y Soporte',
        'help.subtitle': 'Encuentra respuestas a preguntas frecuentes',
        'help.videoTutorials': 'Video Tutoriales',
        'help.faq': 'Preguntas Frecuentes',
        'help.contact': 'Contáctanos para ayuda adicional',
        'help.emailSupport': 'Soporte por Email',
        'help.liveChat': 'Chat en vivo',
        
        // Notifications
        'notifications.title': 'Notificaciones',
        'notifications.markAll': 'Marcar todas',
        'notifications.empty': 'No hay nuevas notificaciones',
        'notifications.acceptChallenge': 'Aceptar desafío',
        'notifications.joinMatch': 'Unirse a la partida',
        
        // Errors
        'error.generic': 'Ocurrió un error',
        'error.network': 'Error de conexión',
        'error.unauthorized': 'Acceso denegado',
        'error.notFound': 'No encontrado',
        
        // Success
        'success.saved': 'Guardado exitosamente',
        'success.deleted': 'Eliminado exitosamente',
        'success.joined': 'Unido exitosamente',
    }
};

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('cotisa-language') || 'hr';
        this.translations = translations;
    }
    
    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {object} params - Optional parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const lang = this.translations[this.currentLang];
        let text = lang ? lang[key] : null;
        
        // Fallback to Croatian if key not found
        if (!text) {
            text = this.translations['hr'][key] || key;
        }
        
        // Interpolate parameters
        if (params && typeof text === 'string') {
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
        }
        
        return text;
    }
    
    /**
     * Set current language
     * @param {string} lang - Language code (hr, en, de, es)
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('cotisa-language', lang);
            document.documentElement.setAttribute('lang', lang);
            
            // Dispatch event for reactive updates
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
            
            // Update page if updatePageTranslations exists
            if (typeof this.updatePageTranslations === 'function') {
                this.updatePageTranslations();
            }
        }
    }
    
    /**
     * Get current language
     * @returns {string} Current language code
     */
    getLanguage() {
        return this.currentLang;
    }
    
    /**
     * Get all available languages
     * @returns {array} Array of language objects
     */
    getAvailableLanguages() {
        return [
            { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'es', name: 'Español', flag: '🇪🇸' }
        ];
    }
    
    /**
     * Update translations on current page
     */
    updatePageTranslations() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Update elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // Update navigation
        this.updateNavigation();
    }
    
    /**
     * Update navigation bar translations
     */
    updateNavigation() {
        const navItems = {
            'nav-dashboard': '🏠 ' + this.t('nav.home'),
            'nav-players': '👥 ' + this.t('nav.players'),
            'nav-profile': '👤 ' + this.t('nav.profile'),
            'nav-admin': '⚙️ ' + this.t('nav.admin')
        };
        
        Object.entries(navItems).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        });
        
        // Update logout button
        const logoutBtn = document.querySelector('.logout-item span:last-child');
        if (logoutBtn) {
            logoutBtn.textContent = this.t('nav.logout');
        }
        
        // Update notification title
        const notifTitle = document.querySelector('.notifications-header h3');
        if (notifTitle) {
            notifTitle.textContent = this.t('notifications.title');
        }
        
        // Update mark all button
        const markAllBtn = document.querySelector('#mark-all-read');
        if (markAllBtn) {
            markAllBtn.textContent = this.t('notifications.markAll');
        }
        
        // Update empty notifications message
        const notifEmpty = document.querySelector('.notification-empty p');
        if (notifEmpty) {
            notifEmpty.textContent = this.t('notifications.empty');
        }
        
        // Update user dropdown items
        const dropdownItems = document.querySelectorAll('.user-dropdown-item span:last-child');
        dropdownItems.forEach(item => {
            const parent = item.closest('.user-dropdown-item');
            if (parent) {
                const href = parent.getAttribute('href') || '';
                if (href.includes('profile')) {
                    item.textContent = this.t('profile.myProfile');
                } else if (href.includes('settings')) {
                    item.textContent = this.t('nav.settings');
                } else if (href.includes('help')) {
                    item.textContent = this.t('nav.help');
                } else if (href.includes('admin')) {
                    item.textContent = this.t('nav.admin') + ' Upravljanje';
                }
            }
        });
        
        // Update page title
        const pageTitle = document.title;
        if (pageTitle.includes('Postavke')) {
            document.title = this.t('settings.title') + ' - COTISA';
        } else if (pageTitle.includes('Pomoć')) {
            document.title = this.t('help.title') + ' - COTISA';
        }
    }
    
    /**
     * Translate all static elements on settings and help pages
     */
    translateStaticPage() {
        const lang = this.currentLang;
        
        // Settings page translations
        const settingsHeader = document.querySelector('.card-header h2');
        if (settingsHeader) {
            settingsHeader.innerHTML = '⚙️ ' + this.t('settings.title');
        }
        
        const settingsSubtitle = document.querySelector('.card-header p');
        if (settingsSubtitle) {
            settingsSubtitle.textContent = this.t('settings.subtitle');
        }
        
        // Section headers - by index
        const sectionHeaders = document.querySelectorAll('.settings-section h3');
        const sectionData = [
            { icon: '🌐', key: 'settings.language' },
            { icon: '🎨', key: 'settings.theme' },
            { icon: '♟️', key: 'settings.pieceDesign' },
            { icon: '🎲', key: 'settings.boardDesign' },
            { icon: '🖥️', key: 'settings.interface' },
            { icon: '🔔', key: 'settings.notifications' },
            { icon: '🔒', key: 'settings.privacy' },
            { icon: '♟️', key: 'settings.gameplay' }
        ];
        sectionHeaders.forEach((h3, index) => {
            if (sectionData[index]) {
                h3.innerHTML = sectionData[index].icon + ' ' + this.t(sectionData[index].key);
            }
        });
        
        // Section descriptions
        const sectionDescs = document.querySelectorAll('.settings-section > p');
        const descKeys = ['settings.selectLanguage', 'settings.selectTheme', 'settings.selectPieceDesign', 'settings.selectBoardDesign'];
        sectionDescs.forEach((p, index) => {
            if (descKeys[index]) {
                p.textContent = this.t(descKeys[index]);
            }
        });
        
        // Theme names - update by data-theme attribute
        const themeData = {
            'light': { name: 'theme.light', desc: 'theme.light.desc' },
            'dark': { name: 'theme.dark', desc: 'theme.dark.desc' },
            'blue': { name: 'theme.blue', desc: 'theme.blue.desc' },
            'purple': { name: 'theme.purple', desc: 'theme.purple.desc' },
            'green': { name: 'theme.green', desc: 'theme.green.desc' },
            'sunset': { name: 'theme.sunset', desc: 'theme.sunset.desc' }
        };
        
        document.querySelectorAll('.theme-preview[data-theme]').forEach(preview => {
            const theme = preview.dataset.theme;
            if (themeData[theme]) {
                const nameEl = preview.querySelector('div[style*="font-weight: 600"]');
                const descEl = preview.querySelector('div[style*="font-size: 0.875rem"]');
                if (nameEl) {
                    nameEl.textContent = this.t(themeData[theme].name);
                }
                if (descEl) {
                    descEl.textContent = this.t(themeData[theme].desc);
                }
            }
        });
        
        // Piece style names - update by data-piece-style attribute
        const pieceData = {
            'classic': { name: 'piece.classic', desc: 'piece.classic.desc' },
            'modern': { name: 'piece.modern', desc: 'piece.modern.desc' },
            'bold': { name: 'piece.bold', desc: 'piece.bold.desc' }
        };
        
        document.querySelectorAll('.chess-style-preview[data-piece-style]').forEach(preview => {
            const style = preview.dataset.pieceStyle;
            if (pieceData[style]) {
                const nameEl = preview.querySelector('div[style*="font-weight: 600"]');
                const descEl = preview.querySelector('div[style*="font-size: 0.875rem"]');
                if (nameEl) {
                    nameEl.textContent = this.t(pieceData[style].name);
                }
                if (descEl) {
                    descEl.textContent = this.t(pieceData[style].desc);
                }
            }
        });
        
        // Board style names - update by data-board-style attribute
        const boardData = {
            'classic': { name: 'board.classic', desc: 'board.classic.desc' },
            'wood': { name: 'board.wood', desc: 'board.wood.desc' },
            'green': { name: 'board.green', desc: 'board.green.desc' },
            'blue': { name: 'board.blue', desc: 'board.blue.desc' }
        };
        
        document.querySelectorAll('.chess-style-preview[data-board-style]').forEach(preview => {
            const style = preview.dataset.boardStyle;
            if (boardData[style]) {
                const nameEl = preview.querySelector('div[style*="font-weight: 600"]');
                const descEl = preview.querySelector('div[style*="font-size: 0.875rem"]');
                if (nameEl) {
                    nameEl.textContent = this.t(boardData[style].name);
                }
                if (descEl) {
                    descEl.textContent = this.t(boardData[style].desc);
                }
            }
        });
        
        // Translate setting items labels and descriptions
        const settingItems = [
            { id: 'email-notifications', label: 'settings.emailNotifications', desc: 'settings.emailNotifications.desc' },
            { id: 'push-notifications', label: 'settings.pushNotifications', desc: 'settings.pushNotifications.desc' },
            { id: 'sound-notifications', label: 'settings.soundNotifications', desc: 'settings.soundNotifications.desc' },
            { id: 'public-profile', label: 'settings.publicProfile', desc: 'settings.publicProfile.desc' },
            { id: 'show-online', label: 'settings.showOnline', desc: 'settings.showOnline.desc' },
            { id: 'show-rating', label: 'settings.showRating', desc: 'settings.showRating.desc' },
            { id: 'confirm-move', label: 'settings.confirmMove', desc: 'settings.confirmMove.desc' },
            { id: 'animate-pieces', label: 'settings.animatePieces', desc: 'settings.animatePieces.desc' },
            { id: 'compact-mode', label: 'settings.compactMode', desc: 'settings.compactMode.desc' }
        ];
        
        settingItems.forEach(item => {
            const input = document.getElementById(item.id);
            if (input) {
                const settingItem = input.closest('.setting-item');
                if (settingItem) {
                    const labelEl = settingItem.querySelector('.setting-label div:first-child');
                    const descEl = settingItem.querySelector('.setting-description');
                    if (labelEl) labelEl.textContent = this.t(item.label);
                    if (descEl) descEl.textContent = this.t(item.desc);
                }
            }
        });
        
        // Translate form labels
        document.querySelectorAll('.form-group label').forEach(label => {
            const text = label.textContent.trim();
            if (text === 'Auto-promjena kraljice') {
                label.textContent = this.t('settings.autoQueen');
            } else if (text === 'Prikaži legalne poteze') {
                label.textContent = this.t('settings.showLegalMoves');
            } else if (text === 'Pozicija navigacijskih tabova') {
                label.textContent = this.t('settings.tabsPosition');
            }
        });
        
        // Translate select options
        const optionMap = {
            'always': 'option.always',
            'ask': 'option.ask',
            'never': 'option.never',
            'hover': 'option.hover'
        };
        
        document.querySelectorAll('.form-group select option').forEach(option => {
            const value = option.value;
            if (optionMap[value]) {
                option.textContent = this.t(optionMap[value]);
            }
        });
        
        // Update page title
        document.title = this.t('settings.title') + ' - COTISA';
        
        console.log('✅ translateStaticPage completed for language:', lang);
    }
}

// Create global instance
const i18n = new I18n();

// Export for module usage
export default i18n;

// Make available globally
window.i18n = i18n;
window.t = (key, params) => i18n.t(key, params);

// Auto-update navigation when language changes
document.addEventListener('languageChanged', () => {
    i18n.updateNavigation();
    // Also translate static page if on settings/help
    if (window.location.pathname.includes('settings') || window.location.href.includes('settings')) {
        setTimeout(() => i18n.translateStaticPage(), 50);
    }
});

// Update on page load after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        i18n.updateNavigation();
        // Auto-translate on load if not Croatian
        if (i18n.getLanguage() !== 'hr') {
            if (window.location.pathname.includes('settings') || window.location.href.includes('settings')) {
                i18n.translateStaticPage();
            }
        }
    }, 100);
});
