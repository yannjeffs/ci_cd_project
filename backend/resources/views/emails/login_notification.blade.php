<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .content h2 { color: #16a34a; margin-top: 0; }
        .info-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f9fafb; }
        .highlight { color: #16a34a; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SGEE</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Système de Gestion d'Enrôlement des Étudiants</p>
        </div>
        <div class="content">
            <h2>Bonjour {{ $user->prenom }} {{ $user->nom }} !</h2>
            
            <p>Nous vous remercions de votre confiance et vous souhaitons la bienvenue sur la plateforme <strong>SGEE</strong>.</p>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>✅ Connexion réussie</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                    Date et heure : {{ now()->format('d/m/Y à H:i') }}
                </p>
            </div>
            
            <p>Vous pouvez maintenant accéder à votre espace candidat pour :</p>
            <ul style="color: #555;">
                <li>Compléter votre profil d'inscription</li>
                <li>Soumettre vos documents requis</li>
                <li>Effectuer le paiement des frais d'enrôlement</li>
                <li>Suivre l'état de votre candidature</li>
                <li>Télécharger votre fiche d'enrôlement une fois validée</li>
            </ul>
            
            <div class="warning">
                <strong>🔒 Sécurité de votre compte :</strong><br>
                Si vous n'êtes pas à l'origine de cette connexion, veuillez <span class="highlight">changer immédiatement votre mot de passe</span> et nous contacter.
            </div>
            
            <p style="margin-top: 30px;">Nous vous souhaitons bonne chance pour votre candidature !</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe SGEE</strong>
            </p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>&copy; {{ date('Y') }} SGEE - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
