FROM php:8.4-apache

# Install system dependencies and required PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libxml2-dev \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd zip bcmath soap sockets exif \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache URL rewrite module
RUN a2enmod rewrite

# Change Apache document root to Laravel's /public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install Composer from official multi-stage image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set active working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Adjust permissions for storage and bootstrap cache
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies (ignoring dev requirements for optimal sizing)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Ensure entrypoint script is executable and has correct line endings
RUN chmod +x /var/www/html/docker-entrypoint.sh \
    && sed -i 's/\r$//' /var/www/html/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]
