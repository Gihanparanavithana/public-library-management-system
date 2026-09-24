<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| Admin authentication
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

if (($_SESSION['role'] ?? '') !== 'admin') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Admin access required.'
    ]);

    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$reservationId = (int) ($data['reservation_id'] ?? 0);

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
    "SELECT
        id,
        status,
        member_id,
        book_id
     FROM reservations
     WHERE id = ?
     LIMIT 1"
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
| Only pending reservations can be approved
|--------------------------------------------------------------------------
*/

if ($reservation['status'] !== 'pending') {

    http_response_code(409);

    echo json_encode([
        'success' => false,
        'message' => 'Only pending reservations can be approved.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Check book
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT id, title, available_copies
     FROM books
     WHERE id = ?
     LIMIT 1"
);

$stmt->execute([
    $reservation['book_id']
]);

$book = $stmt->fetch();

if (!$book) {

    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'Book not found.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Approve reservation
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "UPDATE reservations
     SET status = 'approved'
     WHERE id = ?
       AND status = 'pending'"
);

$stmt->execute([
    $reservationId
]);

echo json_encode([
    'success' => true,
    'message' => 'Reservation approved successfully.'
]);