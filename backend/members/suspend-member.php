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

$memberId = (int) ($data['member_id'] ?? 0);

if ($memberId <= 0) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid member ID.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Find member
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT user_id, status
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

/*
|--------------------------------------------------------------------------
| Check active borrowings
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT COUNT(*) AS total
     FROM borrowings
     WHERE member_id = ?
       AND status IN ('borrowed', 'overdue')"
);

$stmt->execute([
    $memberId
]);

$activeBorrowings = (int) $stmt->fetch()['total'];

if ($activeBorrowings > 0) {

    http_response_code(409);

    echo json_encode([
        'success' => false,
        'message' =>
            'This member has active borrowed books. Return them before suspension.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Suspend
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Update member status
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE members
         SET status = 'suspended'
         WHERE id = ?"
    );

    $stmt->execute([
        $memberId
    ]);

    /*
    |--------------------------------------------------------------------------
    | Update user status
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE users
         SET status = 'suspended'
         WHERE id = ?"
    );

    $stmt->execute([
        $member['user_id']
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Member suspended successfully.'
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Member could not be suspended.'
    ]);
}
