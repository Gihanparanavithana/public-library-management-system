<?php
session_start();
require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(422);
    echo json_encode(['success'=>false,'message'=>'Email and password are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, full_name, email, password, role, status FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success'=>false,'message'=>'Invalid email or password.']);
    exit;
}
if ($user['status'] !== 'active') {
    http_response_code(403);
    echo json_encode(['success'=>false,'message'=>'This account is suspended.']);
    exit;
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['email'] = $user['email'];
unset($user['password']);

echo json_encode(['success'=>true,'user'=>$user]);
