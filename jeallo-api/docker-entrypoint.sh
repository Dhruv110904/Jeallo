#!/bin/sh
set -e

# Run standard PHP snippet to wait for the database server to be fully online
php -r '
$host = getenv("DB_HOST") ?: "db";
$port = getenv("DB_PORT") ?: "3306";
$user = getenv("DB_USERNAME") ?: "root";
$pwd = getenv("DB_PASSWORD") ?: "";

echo "Waiting for MySQL database at $host:$port...\n";
for ($i = 0; $i < 60; $i++) {
    try {
        $pdo = new PDO("mysql:host=$host;port=$port", $user, $pwd);
        echo "MySQL connection established successfully!\n";
        exit(0);
    } catch (PDOException $e) {
        echo "Database is not ready yet. Retrying in 1 second...\n";
        sleep(1);
    }
}
echo "Error: Database failed to respond within 60 seconds.\n";
exit(1);
'

# Run migrations
echo "Running Laravel database migrations..."
php artisan migrate --force

# Execute the main container process (Apache)
echo "Starting Apache HTTP Server..."
exec apache2-foreground
