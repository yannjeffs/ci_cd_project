<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .content h2 { color: #dc2626; margin-top: 0; }
        .btn { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .btn:hover { background: #b91c1c; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f9fafb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SGEE</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Réinitialisation de mot de passe</p>
        </div>
        <div class="content">
            <h2>Demande de réinitialisation</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>SGEE</strong>.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center;">
                <a href="<?php echo e($resetUrl); ?>" class="btn">Réinitialiser mon mot de passe</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien expirera le <?php echo e($expiresAt->format('d/m/Y à H:i')); ?> (valide 60 minutes).
            </div>
            
            <p style="color: #666; font-size: 14px;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.<br>
                Votre mot de passe actuel restera inchangé.
            </p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>&copy; <?php echo e(date('Y')); ?> SGEE - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
<?php /**PATH /var/www/resources/views/emails/password-reset.blade.php ENDPATH**/ ?>