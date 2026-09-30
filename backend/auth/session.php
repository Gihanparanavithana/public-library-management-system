```php
<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| Check session
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'User is not logged in.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Get current user from database
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    'SELECT id, full_name, email, role, status
     FROM users
     WHERE id = ?
     LIMIT 1'
);

$stmt->execute([
    $_SESSION['user_id']
]);

$user = $stmt->fetch();

/*
|--------------------------------------------------------------------------
| User no longer exists
|--------------------------------------------------------------------------
*/

if (!$user) {

    $_SESSION = [];
    session_destroy();

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'User account was not found.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Check account status
|--------------------------------------------------------------------------
*/

if ($user['status'] !== 'active') {

    $_SESSION = [];
    session_destroy();

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'This account is suspended.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Update session information
|--------------------------------------------------------------------------
*/

$_SESSION['full_name'] = $user['full_name'];
$_SESSION['email'] = $user['email'];
$_SESSION['role'] = $user['role'];

/*
|--------------------------------------------------------------------------
| Return authenticated user
|--------------------------------------------------------------------------
*/

echo json_encode([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'status' => $user['status']
    ]
]);