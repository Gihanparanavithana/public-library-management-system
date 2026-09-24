<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

/*
|--------------------------------------------------------------------------
| Validate input
|--------------------------------------------------------------------------
*/

if ($email === '' || $password === '') {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required.'
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Find user
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    'SELECT id, full_name, email, password, role, status
     FROM users
     WHERE email = ?
     LIMIT 1'
);

$stmt->execute([$email]);

$user = $stmt->fetch();

/*
|--------------------------------------------------------------------------
| Check email/password
|--------------------------------------------------------------------------
*/

if (!$user || !password_verify($password, $user['password'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Check account status
|--------------------------------------------------------------------------
*/

if ($user['status'] !== 'active') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'This account is suspended.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Create secure session
|--------------------------------------------------------------------------
*/

session_regenerate_id(true);

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['email'] = $user['email'];
$_SESSION['role'] = $user['role'];

/*
|--------------------------------------------------------------------------
| Never send password back to frontend
|--------------------------------------------------------------------------
*/

unset($user['password']);

/*
|--------------------------------------------------------------------------
| Successful login response
|--------------------------------------------------------------------------
*/

echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'user' => $user
]);
