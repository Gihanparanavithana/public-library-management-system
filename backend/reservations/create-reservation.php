<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

/*
|--------------------------------------------------------------------------
| User must be logged in
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Please login before making a reservation.'
    ]);

    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$bookId = (int) ($data['book_id'] ?? 0);
$reservationDate = trim($data['reservation_date'] ?? date('Y-m-d'));

/*
|--------------------------------------------------------------------------
| Validate book
|--------------------------------------------------------------------------
*/

if ($bookId <= 0) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'A valid book is required.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Validate date
|--------------------------------------------------------------------------
*/

$dateObject = DateTime::createFromFormat('Y-m-d', $reservationDate);

if (!$dateObject || $dateObject->format('Y-m-d') !== $reservationDate) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid reservation date.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Get member
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    'SELECT id, status
     FROM members
     WHERE user_id = ?
     LIMIT 1'
);

$stmt->execute([
    $_SESSION['user_id']
]);

$member = $stmt->fetch();

if (!$member) {

    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'Member account was not found.'
    ]);

    exit;
}

if ($member['status'] !== 'active') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Suspended members cannot make reservations.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Check book
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    'SELECT id, title, available_copies
     FROM books
     WHERE id = ?
     LIMIT 1'
);

$stmt->execute([$bookId]);

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
| Check existing reservation
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT id
     FROM reservations
     WHERE member_id = ?
       AND book_id = ?
       AND status IN ('pending', 'approved')
     LIMIT 1"
);

$stmt->execute([
    $member['id'],
    $bookId
]);

if ($stmt->fetch()) {

    http_response_code(409);

    echo json_encode([
        'success' => false,
        'message' => 'You already have an active reservation for this book.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Generate unique reference number
|--------------------------------------------------------------------------
*/

$referenceNo =
    'RES-' .
    date('YmdHis') .
    '-' .
    strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

/*
|--------------------------------------------------------------------------
| Create reservation
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "INSERT INTO reservations
    (
        reference_no,
        member_id,
        book_id,
        reservation_date,
        status
    )
    VALUES (?, ?, ?, ?, 'pending')"
);

$stmt->execute([
    $referenceNo,
    $member['id'],
    $bookId,
    $reservationDate
]);

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    'success' => true,
    'message' => 'Reservation created successfully.',
    'reservation' => [
        'id' => (int) $pdo->lastInsertId(),
        'reference_no' => $referenceNo,
        'book_id' => $bookId,
        'reservation_date' => $reservationDate,
        'status' => 'pending'
    ]
]);