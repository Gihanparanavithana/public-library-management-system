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
| Get query parameters
|--------------------------------------------------------------------------
*/

$status = trim($_GET['status'] ?? '');
$role = $_SESSION['role'] ?? 'member';

/*
|--------------------------------------------------------------------------
| Admin can view all reservations
|--------------------------------------------------------------------------
*/

if ($role === 'admin') {

    $sql = "
        SELECT
            r.id,
            r.reference_no,
            r.reservation_date,
            r.status,
            r.created_at,

            m.id AS member_id,
            m.member_id AS member_code,

            u.full_name AS member_name,
            u.email AS member_email,

            b.id AS book_id,
            b.title AS book_title,
            b.author AS book_author

        FROM reservations r

        INNER JOIN members m
            ON r.member_id = m.id

        INNER JOIN users u
            ON m.user_id = u.id

        INNER JOIN books b
            ON r.book_id = b.id
    ";

    $params = [];

    if (
        $status !== '' &&
        in_array($status, ['pending', 'approved', 'declined'], true)
    ) {
        $sql .= " WHERE r.status = ?";
        $params[] = $status;
    }

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

} else {

    /*
    |--------------------------------------------------------------------------
    | Normal member can see only own reservations
    |--------------------------------------------------------------------------
    */

    $sql = "
        SELECT
            r.id,
            r.reference_no,
            r.reservation_date,
            r.status,
            r.created_at,

            b.id AS book_id,
            b.title AS book_title,
            b.author AS book_author

        FROM reservations r

        INNER JOIN members m
            ON r.member_id = m.id

        INNER JOIN books b
            ON r.book_id = b.id

        WHERE m.user_id = ?
    ";

    $params = [
        $_SESSION['user_id']
    ];

    if (
        $status !== '' &&
        in_array($status, ['pending', 'approved', 'declined'], true)
    ) {
        $sql .= " AND r.status = ?";
        $params[] = $status;
    }

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
}

$reservations = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'reservations' => $reservations
]);