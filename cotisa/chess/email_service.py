"""
Email Service for COTISA
========================
Handles sending transactional emails like welcome messages,
password resets, tournament notifications, etc.
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_welcome_email(player):
    """
    Send welcome email to newly registered player.
    Bilingual: Croatian and English content.
    
    Args:
        player: Player model instance
    """
    try:
        subject = '🎉 Dobrodošli u COTISA! / Welcome to COTISA!'
        
        # HTML email content - Bilingual with new design
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                body {{
                    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
                    line-height: 1.6;
                    color: #2d3748;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }}
                .header {{
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    padding: 50px 40px;
                    text-align: center;
                    position: relative;
                }}
                .header::before {{
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="80" opacity="0.03">♔♕♖♗♘♙</text></svg>');
                    opacity: 0.1;
                }}
                .logo {{
                    width: 120px;
                    height: 120px;
                    margin-bottom: 20px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }}
                .header h1 {{
                    color: #ffffff;
                    font-size: 36px;
                    font-weight: 800;
                    letter-spacing: 3px;
                    margin-bottom: 8px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }}
                .header-subtitle {{
                    color: rgba(255,255,255,0.8);
                    font-size: 14px;
                    letter-spacing: 1px;
                }}
                .welcome-banner {{
                    background: linear-gradient(135deg, #00b4db 0%, #0083b0 100%);
                    color: white;
                    padding: 25px 40px;
                    text-align: center;
                }}
                .welcome-banner h2 {{
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }}
                .welcome-banner p {{
                    opacity: 0.9;
                    font-size: 16px;
                }}
                .content {{
                    padding: 40px;
                }}
                .language-section {{
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-radius: 16px;
                    padding: 30px;
                    margin-bottom: 25px;
                    border: 1px solid #e2e8f0;
                }}
                .language-section.english {{
                    background: linear-gradient(135deg, #fef7f0 0%, #fef3e6 100%);
                    border-color: #fed7aa;
                }}
                .language-header {{
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid rgba(0,0,0,0.1);
                }}
                .flag {{
                    font-size: 28px;
                }}
                .language-label {{
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #64748b;
                    font-weight: 600;
                }}
                .greeting {{
                    font-size: 22px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 15px;
                }}
                .message-text {{
                    color: #475569;
                    font-size: 15px;
                    line-height: 1.8;
                }}
                .elo-badge {{
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 18px;
                    margin: 20px 0;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                }}
                .features-title {{
                    font-size: 16px;
                    font-weight: 600;
                    color: #334155;
                    margin: 25px 0 15px 0;
                }}
                .feature-grid {{
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }}
                .feature-item {{
                    background: white;
                    padding: 16px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    transition: transform 0.2s;
                }}
                .feature-icon {{
                    font-size: 32px;
                    margin-bottom: 8px;
                }}
                .feature-title {{
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 13px;
                }}
                .user-card {{
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    border-radius: 16px;
                    padding: 25px;
                    margin: 30px 0;
                    color: white;
                }}
                .user-card-title {{
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    opacity: 0.7;
                    margin-bottom: 15px;
                }}
                .user-info-row {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }}
                .user-info-row:last-child {{
                    border-bottom: none;
                }}
                .user-info-label {{
                    opacity: 0.8;
                    font-size: 14px;
                }}
                .user-info-value {{
                    font-weight: 600;
                    font-size: 15px;
                }}
                .cta-section {{
                    text-align: center;
                    padding: 20px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                    padding: 18px 50px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 16px;
                    letter-spacing: 1px;
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                    transition: transform 0.2s;
                }}
                .footer {{
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: rgba(255,255,255,0.7);
                    padding: 30px 40px;
                    text-align: center;
                }}
                .footer-logo {{
                    font-size: 24px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                }}
                .footer-text {{
                    font-size: 13px;
                    line-height: 1.8;
                }}
                .footer-link {{
                    color: #60a5fa !important;
                    text-decoration: none;
                }}
                .team-names {{
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    font-size: 12px;
                    opacity: 0.8;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <!-- Header with Logo -->
                <div class="header">
                    <img src="https://cotisa.de/images/logo_cotisa.png" alt="COTISA Logo" class="logo">
                    <h1>COTISA</h1>
                    <p class="header-subtitle">Chess Organization Tournament Integrated System Application</p>
                </div>
                
                <!-- Welcome Banner -->
                <div class="welcome-banner">
                    <h2>🎉 Dobrodošli! / Welcome!</h2>
                    <p>Vaš račun je uspješno kreiran / Your account has been created</p>
                </div>
                
                <div class="content">
                    <!-- Croatian Section -->
                    <div class="language-section">
                        <div class="language-header">
                            <span class="flag">🇭🇷</span>
                            <span class="language-label">Hrvatski</span>
                        </div>
                        
                        <h3 class="greeting">Pozdrav, {player.username}! 👋</h3>
                        
                        <p class="message-text">
                            Hvala Vam što ste se registrirali na COTISA platformu za šahovske turnire! 
                            Vaš račun je uspješno kreiran i spremni ste za igranje.
                        </p>
                        
                        <div style="text-align: center;">
                            <span class="elo-badge">⭐ Vaš ELO: {player.elo_rating}</span>
                        </div>
                        
                        <p class="features-title">🎯 Što možete raditi:</p>
                        
                        <div class="feature-grid">
                            <div class="feature-item">
                                <div class="feature-icon">🏆</div>
                                <div class="feature-title">Turniri</div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">♟️</div>
                                <div class="feature-title">Igrajte šah</div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">📊</div>
                                <div class="feature-title">ELO Ranking</div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🏅</div>
                                <div class="feature-title">Postignuća</div>
                            </div>
                        </div>
                        
                        <p class="message-text" style="margin-top: 20px;">Sretno i zabavite se! ♔</p>
                    </div>
                    
                    <!-- English Section -->
                    <div class="language-section english">
                        <div class="language-header">
                            <span class="flag">🇬🇧</span>
                            <span class="language-label">English</span>
                        </div>
                        
                        <h3 class="greeting">Hello, {player.username}! 👋</h3>
                        
                        <p class="message-text">
                            Thank you for registering on the COTISA chess tournament platform! 
                            Your account has been successfully created and you're ready to play.
                        </p>
                        
                        <div style="text-align: center;">
                            <span class="elo-badge">⭐ Your ELO: {player.elo_rating}</span>
                        </div>
                        
                        <p class="features-title">🎯 What you can do:</p>
                        
                        <div class="feature-grid">
                            <div class="feature-item">
                                <div class="feature-icon">🏆</div>
                                <div class="feature-title">Tournaments</div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">♟️</div>
                                <div class="feature-title">Play Chess</div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">📊</div>
                                <div class="feature-title">ELO Ranking</div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">🏅</div>
                                <div class="feature-title">Achievements</div>
                            </div>
                        </div>
                        
                        <p class="message-text" style="margin-top: 20px;">Good luck and have fun! ♔</p>
                    </div>
                    
                    <!-- User Info Card -->
                    <div class="user-card">
                        <p class="user-card-title">📋 Vaši podaci / Your Details</p>
                        <div class="user-info-row">
                            <span class="user-info-label">👤 Username</span>
                            <span class="user-info-value">{player.username}</span>
                        </div>
                        <div class="user-info-row">
                            <span class="user-info-label">📧 Email</span>
                            <span class="user-info-value">{player.email}</span>
                        </div>
                        <div class="user-info-row">
                            <span class="user-info-label">⭐ ELO Rating</span>
                            <span class="user-info-value">{player.elo_rating}</span>
                        </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div class="cta-section">
                        <a href="https://cotisa.de" class="cta-button">
                            🎮 Započni igrati / Start Playing
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p class="footer-logo">♔ COTISA</p>
                    <p class="footer-text">
                        Chess Organization Tournament Integrated System Application<br>
                        <a href="https://cotisa.de" class="footer-link">cotisa.de</a>
                    </p>
                    <p class="team-names">
                        © 2026 COTISA | Created by: David Ivšak, Lovro Preksavec, Matej Bratanović
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version - Bilingual
        text_content = f"""
========================================
🇭🇷 HRVATSKI
========================================

Dobrodošli u COTISA, {player.username}!

Hvala Vam što ste se registrirali na COTISA platformu za šahovske turnire!
Vaš račun je uspješno kreiran i spremni ste za igranje.

Vaš početni ELO Rating: {player.elo_rating}

Što možete raditi na COTISA platformi:
🏆 Turniri - Pridružite se turnirima ili kreirajte vlastite
♟️ Igrajte šah - Partije uživo protiv drugih igrača
📊 ELO Ranking - Pratite svoj napredak
🏅 Postignuća - Otključajte titule i achievemente

Sretno i zabavite se! ♔

========================================
🇬🇧 ENGLISH
========================================

Welcome to COTISA, {player.username}!

Thank you for registering on the COTISA chess tournament platform!
Your account has been successfully created and you're ready to play.

Your starting ELO Rating: {player.elo_rating}

What you can do on COTISA:
🏆 Tournaments - Join tournaments or create your own
♟️ Play Chess - Live games against other players
📊 ELO Ranking - Track your progress
🏅 Achievements - Unlock titles and achievements

Good luck and have fun! ♔

========================================

Your login details / Vaši podaci za prijavu:
- Username / Korisničko ime: {player.username}
- Email: {player.email}

Visit / Posjetite: https://cotisa.de

— COTISA Team
(David Ivšak, Lovro Preksavec, Matej Bratanović)
        """
        
        # Send email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[player.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        logger.info(f"Welcome email sent to {player.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {player.email}: {str(e)}")
        return False


def send_tournament_notification(player, tournament, notification_type='joined'):
    """
    Send tournament-related notification email.
    
    Args:
        player: Player model instance
        tournament: Tournament model instance
        notification_type: 'joined', 'started', 'round', 'finished'
    """
    try:
        subjects = {
            'joined': f'🎯 Uspješno ste se pridružili turniru: {tournament.tournament_name}',
            'started': f'🚀 Turnir je započeo: {tournament.tournament_name}',
            'round': f'⏰ Nova runda: {tournament.tournament_name}',
            'finished': f'🏆 Turnir je završen: {tournament.tournament_name}',
        }
        
        subject = subjects.get(notification_type, f'Obavijest o turniru: {tournament.tournament_name}')
        
        message = f"""
Pozdrav {player.username},

{get_tournament_message(tournament, notification_type)}

Turnir: {tournament.tournament_name}
Format: {tournament.tournament_type}
Vrijeme kontrole: {tournament.time_control_minutes} min + {tournament.increment_seconds} sec

Posjetite: https://cotisa.de/#/tournament/{tournament.tournament_id}

Sretno!
— COTISA Tim
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[player.email],
            fail_silently=False
        )
        
        logger.info(f"Tournament notification ({notification_type}) sent to {player.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send tournament notification to {player.email}: {str(e)}")
        return False


def get_tournament_message(tournament, notification_type):
    """Get appropriate message based on notification type"""
    messages = {
        'joined': 'Uspješno ste se pridružili turniru! Pratite stranicu turnira za novosti.',
        'started': 'Turnir je upravo započeo! Provjerite svoj raspored mečeva.',
        'round': 'Nova runda turnira je započela. Provjerite svog protivnika.',
        'finished': 'Turnir je završen! Pogledajte konačne rezultate i ljestvicu.',
    }
    return messages.get(notification_type, 'Imate novu obavijest o turniru.')


def send_match_notification(player, match, notification_type='scheduled'):
    """
    Send match-related notification email.
    
    Args:
        player: Player model instance
        match: Match model instance
        notification_type: 'scheduled', 'reminder', 'result'
    """
    try:
        opponent = match.black_player if match.white_player == player else match.white_player
        
        subjects = {
            'scheduled': f'♟️ Novi meč zakazan protiv {opponent.username}',
            'reminder': f'⏰ Podsjetnik: Meč protiv {opponent.username} uskoro počinje',
            'result': f'📊 Rezultat meča protiv {opponent.username}',
        }
        
        subject = subjects.get(notification_type, f'Obavijest o meču')
        
        message = f"""
Pozdrav {player.username},

{get_match_message(match, player, opponent, notification_type)}

Protivnik: {opponent.username} (ELO: {opponent.elo_rating})
Turnir: {match.tournament.tournament_name if match.tournament else 'Prijateljski meč'}
Runda: {match.round_number}

Posjetite: https://cotisa.de

Sretno!
— COTISA Tim
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[player.email],
            fail_silently=False
        )
        
        logger.info(f"Match notification ({notification_type}) sent to {player.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send match notification to {player.email}: {str(e)}")
        return False


def get_match_message(match, player, opponent, notification_type):
    """Get appropriate match message based on notification type"""
    if notification_type == 'scheduled':
        color = 'bijelima' if match.white_player == player else 'crnima'
        return f'Zakazan vam je novi meč! Igrate {color} protiv {opponent.username}.'
    elif notification_type == 'reminder':
        return f'Vaš meč protiv {opponent.username} počinje uskoro. Budite spremni!'
    elif notification_type == 'result':
        if match.winner == player:
            return f'Čestitamo! Pobijedili ste u meču protiv {opponent.username}.'
        elif match.winner == opponent:
            return f'Nažalost, izgubili ste meč protiv {opponent.username}. Sretno sljedeći put!'
        else:
            return f'Meč protiv {opponent.username} je završio neriješeno.'
    return 'Imate novu obavijest o meču.'


def send_password_reset_email(player, reset_token):
    """
    Send password reset email with a secure link.
    
    Args:
        player: Player model instance
        reset_token: The password reset token string
    """
    try:
        subject = '🔑 Resetiranje lozinke / Password Reset - COTISA'
        
        reset_url = f"https://cotisa.de/#/reset-password/{reset_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 650px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f5f5f5;
                }}
                .email-container {{
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .chess-icon {{
                    font-size: 56px;
                    margin-bottom: 15px;
                    display: block;
                }}
                .content {{
                    padding: 30px;
                }}
                .language-section {{
                    padding: 25px;
                    margin: 15px 0;
                    border-radius: 10px;
                    background: #f8f9fa;
                    border-left: 4px solid #e74c3c;
                }}
                .language-section.english {{
                    border-left-color: #3498db;
                    background: #f0f7ff;
                }}
                .language-title {{
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #666;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }}
                .reset-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    color: white !important;
                    padding: 16px 40px;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
                }}
                .warning-box {{
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    font-size: 14px;
                }}
                .divider {{
                    height: 2px;
                    background: linear-gradient(to right, transparent, #ddd, transparent);
                    margin: 30px 0;
                }}
                .footer {{
                    text-align: center;
                    padding: 25px;
                    background: #2c3e50;
                    color: rgba(255,255,255,0.8);
                    font-size: 13px;
                }}
                .footer a {{
                    color: #3498db;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <span class="chess-icon">🔑</span>
                    <h1>Resetiranje lozinke</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
                </div>
                
                <div class="content">
                    <!-- CROATIAN VERSION -->
                    <div class="language-section">
                        <div class="language-title"><span class="flag">🇭🇷</span> HRVATSKI</div>
                        
                        <h2 style="margin-top: 0;">Pozdrav, {player.username}! 👋</h2>
                        
                        <p>Primili smo zahtjev za resetiranje vaše lozinke na COTISA platformi.</p>
                        
                        <p>Kliknite na gumb ispod kako biste postavili novu lozinku:</p>
                        
                        <p style="text-align: center; margin: 25px 0;">
                            <a href="{reset_url}" class="reset-button">
                                🔑 Resetiraj lozinku
                            </a>
                        </p>
                        
                        <div class="warning-box">
                            ⚠️ <strong>Važno:</strong> Ovaj link vrijedi samo <strong>1 sat</strong>. 
                            Ako niste zatražili resetiranje lozinke, ignorirajte ovaj email.
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- ENGLISH VERSION -->
                    <div class="language-section english">
                        <div class="language-title"><span class="flag">🇬🇧</span> ENGLISH</div>
                        
                        <h2 style="margin-top: 0;">Hello, {player.username}! 👋</h2>
                        
                        <p>We received a request to reset your password on the COTISA platform.</p>
                        
                        <p>Click the button below to set a new password:</p>
                        
                        <p style="text-align: center; margin: 25px 0;">
                            <a href="{reset_url}" class="reset-button">
                                🔑 Reset Password
                            </a>
                        </p>
                        
                        <div class="warning-box">
                            ⚠️ <strong>Important:</strong> This link expires in <strong>1 hour</strong>. 
                            If you didn't request a password reset, please ignore this email.
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 0;">
                        © 2026 COTISA - Chess Tournament System<br>
                        Created by: David Ivšak, Lovro Preksavec, Matej Bratanović
                    </p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="https://cotisa.de">cotisa.de</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
Pozdrav {player.username},

Primili smo zahtjev za resetiranje vaše lozinke na COTISA platformi.

Kliknite na link ispod kako biste postavili novu lozinku:
{reset_url}

⚠️ Link vrijedi samo 1 sat. Ako niste zatražili resetiranje lozinke, ignorirajte ovaj email.

---

Hello {player.username},

We received a request to reset your password on the COTISA platform.

Click the link below to set a new password:
{reset_url}

⚠️ This link expires in 1 hour. If you didn't request a password reset, please ignore this email.

— COTISA Team
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[player.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        logger.info(f"Password reset email sent to {player.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {player.email}: {str(e)}")
        return False
