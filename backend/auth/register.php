<?php
session_start();
require_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$name = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$branch = trim($data['branch'] ?? '');
$nic = trim($data['nic'] ?? '');
$phone = trim($data['phone'] ?? '');

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || $branch === '') {
    http_response_code(422);
    echo json_encode(['success'=>false,'message'=>'Please provide valid registration details.']);
    exit;
}

$check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['success'=>false,'message'=>'An account with this email already exists.']);
    exit;
}

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare("INSERT INTO users (full_name,email,password,role,status) VALUES (?,?,?,?, 'active')");
    $stmt->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT),'member']);
    $userId = (int)$pdo->lastInsertId();

    $memberId = 'LKL-MBR-' . str_pad((string)$userId, 5, '0', STR_PAD_LEFT);
    $m = $pdo->prepare("INSERT INTO members (user_id,member_id,branch,nic,phone,joined_date,status) VALUES (?,?,?,?,?,CURDATE(),'active')");
    $m->execute([$userId,$memberId,$branch,$nic,$phone]);
    $pdo->commit();

    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['role'] = 'member';
    $_SESSION['full_name'] = $name;
    $_SESSION['email'] = $email;

    echo json_encode(['success'=>true,'user'=>['id'=>$userId,'full_name'=>$name,'email'=>$email,'role'=>'member','status'=>'active']]);
} catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Registration could not be completed.']);
}
