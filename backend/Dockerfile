FROM php:8.3-fpm-alpine

# Installer les dépendances de build ET runtime
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    mysql-client \
    nginx \
    supervisor \
    bash \
    netcat-openbsd

# Installer les extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip

# Nettoyer les headers de développement (APRÈS l'installation des extensions)
RUN apk del --purge *-dev

# Réinstaller les bibliothèques runtime nécessaires
RUN apk add --no-cache \
    libpng \
    libjpeg-turbo \
    freetype \
    oniguruma \
    libxml2 \
    libzip

# ====== AJOUTEZ CES LIGNES ICI ======
# Créer les dossiers de logs pour supervisor et nginx
RUN mkdir -p /var/log/supervisor \
    && mkdir -p /var/log/nginx \
    && touch /var/log/supervisor/supervisord.log \
    && chmod -R 755 /var/log/supervisor
# ====================================

WORKDIR /var/www

# Copier TOUT le code
COPY . .

# Créer les répertoires et permissions
RUN mkdir -p storage/framework/cache \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage \
    && chmod -R 775 bootstrap/cache

# Copier les configurations
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
