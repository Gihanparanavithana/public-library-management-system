<?php
/**
 * Local development database settings.
 * For hosting, set DB_HOST, DB_NAME, DB_USER, DB_PASS and DB_PORT.
 * Never commit production credentials to GitHub.
 */
$dbConfig = [
    'host' => getenv('DB_HOST') !== false ? getenv('DB_HOST') : '127.0.0.1',
    'name' => getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'library_system',
    'user' => getenv('DB_USER') !== false ? getenv('DB_USER') : 'root',
    'pass' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : '',
    'port' => getenv('DB_PORT') !== false ? (int) getenv('DB_PORT') : 3307,
];
