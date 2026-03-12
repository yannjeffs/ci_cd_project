#!/bin/sh
set -e

echo "🚀 Starting SGEE Backend..."

# Attendre que la base de données soit prête
echo "⏳ Waiting for database..."
until nc -z db 3306; do
  sleep 2
done
echo "✅ Database is ready!"

# Utiliser le fichier .env.docker
if [ -f /var/www/.env.docker ]; then
    echo "📝 Using .env.docker configuration..."
    cp /var/www/.env.docker /var/www/.env
fi

# Générer la clé si nécessaire
if ! grep -q "APP_KEY=base64:" /var/www/.env; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Exécuter les migrations
echo "🗄️  Running migrations..."
php artisan migrate --force

# Populer la base de données avec les utilisateurs et leurs rôles
echo "🗄️ Seeding datas..."
php artisan db:seed

# Créer le lien symbolique storage
echo "🔗 Creating storage link..."
php artisan storage:link || true

# Optimisations
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✨ Application ready!"

# Démarrer supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
