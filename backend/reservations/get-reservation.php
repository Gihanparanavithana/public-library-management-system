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

$reservationId = (int) ($_GET['id'] ?? 0);

if ($reservationId <= 0) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid reservation ID.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Get reservation
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "
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
        b.author AS book_author,
        b.isbn,
        b.category

    FROM reservations r

    INNER JOIN members m
        ON r.member_id = m.id

    INNER JOIN users u
        ON m.user_id = u.id

    INNER JOIN books b
        ON r.book_id = b.id

    WHERE r.id = ?

    LIMIT 1
    "
);

$stmt->execute([
    $reservationId
]);

$reservation = $stmt->fetch();

if (!$reservation) {

    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'Reservation not found.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Member can only see own reservation
|--------------------------------------------------------------------------
*/

if (
    ($_SESSION['role'] ?? 'member') !== 'admin'
) {

    $stmt = $pdo->prepare(
        "SELECT m.id
         FROM members m
         WHERE m.id = ?
           AND m.user_id = ?
         LIMIT 1"
    );

    $stmt->execute([
        $reservation['member_id'],
        $_SESSION['user_id']
    ]);

    if (!$stmt->fetch()) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'You are not allowed to view this reservation.'
        ]);

        exit;
    }
}

echo json_encode([
    'success' => true,
    'reservation' => $reservation
]);