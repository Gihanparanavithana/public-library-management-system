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

$fullName = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$branch = trim($data['branch'] ?? '');
$nic = trim($data['nic'] ?? '');
$phone = trim($data['phone'] ?? '');

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

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

if (strlen($password) < 8) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Password must contain at least 8 characters.'
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
| Check duplicate email
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT id
     FROM users
     WHERE email = ?
     LIMIT 1"
);

$stmt->execute([
    $email
]);

if ($stmt->fetch()) {

    http_response_code(409);

    echo json_encode([
        'success' => false,
        'message' => 'An account with this email already exists.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Create user + member
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Create user
    |--------------------------------------------------------------------------
    */

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $stmt = $pdo->prepare(
        "INSERT INTO users
        (
            full_name,
            email,
            password,
            role,
            status
        )
        VALUES (?, ?, ?, 'member', 'active')"
    );

    $stmt->execute([
        $fullName,
        $email,
        $passwordHash
    ]);

    $userId = (int) $pdo->lastInsertId();

    /*
    |--------------------------------------------------------------------------
    | Generate member code
    |--------------------------------------------------------------------------
    */

    $memberCode =
        'LKL-MBR-' .
        str_pad(
            (string) $userId,
            5,
            '0',
            STR_PAD_LEFT
        );

    /*
    |--------------------------------------------------------------------------
    | Create member
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "INSERT INTO members
        (
            user_id,
            member_id,
            branch,
            nic,
            phone,
            joined_date,
            status,
            borrowed_count
        )
        VALUES (?, ?, ?, ?, ?, CURDATE(), 'active', 0)"
    );

    $stmt->execute([
        $userId,
        $memberCode,
        $branch,
        $nic,
        $phone
    ]);

    $newMemberId = (int) $pdo->lastInsertId();

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Member created successfully.',
        'member' => [
            'id' => $newMemberId,
            'member_id' => $memberCode,
            'full_name' => $fullName,
            'email' => $email,
            'branch' => $branch,
            'status' => 'active'
        ]
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Member could not be created.'
    ]);
}
