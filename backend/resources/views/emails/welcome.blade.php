<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue sur SGEE</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{ $user->prenom }} {{ $user->nom }},</h2>
            <p>Votre compte a été créé avec succès sur le <strong>Système de Gestion d'Enrôlement des Étudiants</strong>.</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
                <li>Compléter votre profil étudiant</li>
                <li>Téléverser vos documents requis</li>
                <li>Effectuer votre paiement</li>
                <li>Finaliser votre enrôlement</li>
            </ul>
            <p>Connectez-vous à votre espace personnel pour commencer.</p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>&copy; {{ date('Y') }} SGEE - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
