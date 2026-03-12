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
        .success-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .success-icon { font-size: 48px; color: #16a34a; margin-bottom: 10px; }
        .info-box { background: #f9fafb; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-box strong { color: #16a34a; }
        .btn { display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .btn:hover { background: #15803d; }
        .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .next-steps h3 { color: #3b82f6; margin-top: 0; font-size: 16px; }
        .next-steps ul { margin: 10px 0; padding-left: 20px; }
        .next-steps li { margin: 8px 0; color: #555; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f9fafb; }
        .highlight { color: #16a34a; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 SGEE</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Système de Gestion d'Enrôlement des Étudiants</p>
        </div>
        <div class="content">
            <h2>Félicitations {{ $enrollement->etudiant->user->prenom }} {{ $enrollement->etudiant->user->nom }} !</h2>
            
            <div class="success-box">
                <div class="success-icon">✅</div>
                <h3 style="color: #16a34a; margin: 10px 0;">Votre enrôlement a été validé avec succès !</h3>
                <p style="color: #666; margin: 5px 0;">Vous êtes maintenant officiellement inscrit(e) au concours</p>
            </div>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>Concours :</strong> {{ $enrollement->etudiant->concours->nom ?? 'N/A' }}</p>
                <p style="margin: 5px 0 0 0;"><strong>Numéro d'inscription :</strong> <span class="highlight">{{ str_pad($enrollement->id, 6, '0', STR_PAD_LEFT) }}</span></p>
                <p style="margin: 5px 0 0 0;"><strong>Date de validation :</strong> {{ now()->format('d/m/Y à H:i') }}</p>
            </div>
            
            <p>Nous sommes heureux de vous informer que votre dossier d'enrôlement a été examiné et validé par notre administration.</p>
            
            <div class="next-steps">
                <h3>📋 Prochaines étapes :</h3>
                <ul>
                    <li><strong>Téléchargez votre fiche d'enrôlement</strong> en cliquant sur le bouton ci-dessous</li>
                    <li><strong>Imprimez votre fiche</strong> et conservez-la précieusement</li>
                    <li><strong>Présentez-vous le jour du concours</strong> avec votre fiche et une pièce d'identité</li>
                    <li><strong>Consultez régulièrement votre espace</strong> pour les mises à jour importantes</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $pdfUrl }}" class="btn">📥 Télécharger ma fiche d'enrôlement</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important :</strong><br>
                • Votre fiche d'enrôlement est <span class="highlight">obligatoire</span> le jour du concours<br>
                • Vérifiez que toutes les informations sont correctes<br>
                • En cas d'erreur, contactez-nous immédiatement<br>
                • Conservez une copie numérique et une copie papier
            </div>
            
            <p style="margin-top: 30px;">Nous vous souhaitons plein succès pour votre concours !</p>
            
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
