import smtplib
from email.message import EmailMessage
import ssl
import time

def envoyer_email_gmail(destinataire, sujet, contenu):
    """Version avec gestion robuste des erreurs et timeout"""
    # Configuration du message
    email = EmailMessage()
    email.set_content(contenu)
    email['Subject'] = sujet
    email['From'] = "mamadousanogo352@gmail.com"
    email['To'] = destinataire

    # Paramètres de connexion
    context = ssl.create_default_context()
    smtp_servers = [
        {'host': 'smtp.gmail.com', 'port': 587, 'ssl': False},  # STARTTLS
        {'host': 'smtp.gmail.com', 'port': 465, 'ssl': True}    # SSL
    ]

    for server in smtp_servers:
        try:
            if server['ssl']:
                with smtplib.SMTP_SSL(
                    server['host'], 
                    server['port'], 
                    context=context,
                    timeout=15
                ) as smtp:
                    smtp.login("mamadousanogo352@gmail.com", "doyj vrud jtiy exic")
                    smtp.send_message(email)
                    print(f"Email envoyé via {server['host']}:{server['port']} (SSL)")
                    return True
            else:
                with smtplib.SMTP(
                    server['host'], 
                    server['port'], 
                    timeout=15
                ) as smtp:
                    smtp.ehlo()
                    smtp.starttls(context=context)
                    smtp.login("mamadousanogo352@gmail.com", "doyj vrud jtiy exic")
                    smtp.send_message(email)
                    print(f"Email envoyé via {server['host']}:{server['port']} (STARTTLS)")
                    return True

        except Exception as e:
            print(f"Échec sur {server['host']}:{server['port']} - {type(e).__name__}: {str(e)}")
            time.sleep(2)  # Pause entre les tentatives

    print("Toutes les méthodes de connexion ont échoué")
    return False