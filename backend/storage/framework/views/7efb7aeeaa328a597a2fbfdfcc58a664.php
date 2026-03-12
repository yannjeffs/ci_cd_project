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
        .code-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
        .code { font-size: 48px; font-weight: bold; color: #16a34a; letter-spacing: 10px; font-family: 'Courier New', monospace; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f9fafb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SGEE</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Système de Gestion d'Enrôlement des Étudiants</p>
        </div>
        <div class="content">
            <h2>Bonjour <?php echo e($user->prenom); ?> <?php echo e($user->nom); ?> !</h2>
            <p>Merci de vous être inscrit(e) sur <strong>SGEE</strong>.</p>
            <p>Pour finaliser votre inscription et activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
            
            <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Votre code de vérification</p>
                <div class="code"><?php echo e($verificationCode); ?></div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important :</strong> Ce code expirera dans 15 minutes.
            </div>
            
            <p style="color: #666; font-size: 14px;">
                Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.<br>
                Aucune action supplémentaire ne sera requise de votre part.
            </p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            <p>&copy; <?php echo e(date('Y')); ?> SGEE - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
<?php /**PATH /var/www/resources/views/emails/verification.blade.php ENDPATH**/ ?>