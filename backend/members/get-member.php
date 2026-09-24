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

$memberId = (int) ($_GET['id'] ?? 0);

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
| Get member
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "
    SELECT
        m.id,
        m.member_id,
        m.branch,
        m.nic,
        m.phone,
        m.joined_date,
        m.status,
        m.borrowed_count,

        u.id AS user_id,
        u.full_name,
        u.email,
        u.role,
        u.status AS user_status

    FROM members m

    INNER JOIN users u
        ON m.user_id = u.id

    WHERE m.id = ?

    LIMIT 1
    "
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

echo json_encode([
    'success' => true,
    'member' => $member
]);
