<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/settings.php';

$host = $dbConfig['host'];
$db   = $dbConfig['name'];
$user = $dbConfig['user'];
$pass = $dbConfig['pass'];
$port = $dbConfig['port'];

try {
    if (!extension_loaded('pdo_mysql')) {
        throw new RuntimeException('The PHP pdo_mysql extension is not enabled.');
    }

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]
    );
} catch (Throwable $e) {
    error_log('[Lanka Library Network] Database connection failed: ' . $e->getMessage());

    $message = 'Database connection failed. Open database-check.php for local setup guidance.';
    $details = strtolower($e->getMessage());

    if (!extension_loaded('pdo_mysql')) {
        $message = 'PHP MySQL support (pdo_mysql) is not enabled. Enable it in your XAMPP PHP configuration and restart Apache.';
    } elseif (strpos($details, 'unknown database') !== false || (string)$e->getCode() === '1049') {
        $message = "Database '{$db}' was not found. Open phpMyAdmin and import database/schema.sql.";
    } elseif (strpos($details, 'connection refused') !== false || strpos($details, 'actively refused') !== false || strpos($details, '2002') !== false) {
        $message = 'Cannot reach MySQL. Start MySQL in XAMPP Control Panel and try again.';
    } elseif (strpos($details, 'access denied') !== false || (string)$e->getCode() === '1045') {
        $message = 'MySQL rejected the configured username or password. Check backend/config/settings.php or your DB_HOST, DB_NAME, DB_USER and DB_PASS environment variables.';
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
