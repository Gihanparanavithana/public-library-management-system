<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Please login first.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

if (($_SESSION['role'] ?? '') !== 'admin') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Admin access required.'
    ]);

    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$memberId = (int) ($data['id'] ?? 0);

$fullName = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$branch = trim($data['branch'] ?? '');
$nic = trim($data['nic'] ?? '');
$phone = trim($data['phone'] ?? '');

/*
|--------------------------------------------------------------------------
| Validate
|--------------------------------------------------------------------------
*/

if ($memberId <= 0) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid member ID.'
    ]);

    exit;
}

if ($fullName === '') {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Full name is required.'
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'A valid email address is required.'
    ]);

    exit;
}

if ($branch === '') {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Branch is required.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Get member
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT user_id
     FROM members
     WHERE id = ?
     LIMIT 1"
);

$stmt->execute([
    $memberId
]);

$member = $stmt->fetch();

if (!$member) {

    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'Member not found.'
    ]);

    exit;
}

$userId = (int) $member['user_id'];

/*
|--------------------------------------------------------------------------
| Check duplicate email
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT id
     FROM users
     WHERE email = ?
       AND id != ?
     LIMIT 1"
);

$stmt->execute([
    $email,
    $userId
]);

if ($stmt->fetch()) {

    http_response_code(409);

    echo json_encode([
        'success' => false,
        'message' => 'This email is already used by another account.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Update user
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE users
         SET full_name = ?,
             email = ?
         WHERE id = ?"
    );

    $stmt->execute([
        $fullName,
        $email,
        $userId
    ]);

    /*
    |--------------------------------------------------------------------------
    | Update member
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE members
         SET branch = ?,
             nic = ?,
             phone = ?
         WHERE id = ?"
    );

    $stmt->execute([
        $branch,
        $nic,
        $phone,
        $memberId
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Member updated successfully.'
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Member could not be updated.'
    ]);
}