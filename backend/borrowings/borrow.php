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

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$bookId = (int) ($data['book_id'] ?? 0);
$requestedMemberId = (int) ($data['member_id'] ?? 0);
$reservationId = (int) ($data['reservation_id'] ?? 0);

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
| Find member
|--------------------------------------------------------------------------
*/

if (($_SESSION['role'] ?? '') === 'admin' && $requestedMemberId > 0) {

    $stmt = $pdo->prepare(
        "SELECT id, status
         FROM members
         WHERE id = ?
         LIMIT 1"
    );

    $stmt->execute([
        $requestedMemberId
    ]);

} else {

    $stmt = $pdo->prepare(
        "SELECT id, status
         FROM members
         WHERE user_id = ?
         LIMIT 1"
    );

    $stmt->execute([
        $_SESSION['user_id']
    ]);
}

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
        'message' => 'Suspended members cannot borrow books.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Transaction
|--------------------------------------------------------------------------
*/

try {

    $pdo->beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Lock book row
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "SELECT id, title, available_copies
         FROM books
         WHERE id = ?
         FOR UPDATE"
    );

    $stmt->execute([
        $bookId
    ]);

    $book = $stmt->fetch();

    if (!$book) {

        throw new Exception('Book not found.');
    }

    /*
    |--------------------------------------------------------------------------
    | Check available copies
    |--------------------------------------------------------------------------
    */

    if ((int) $book['available_copies'] <= 0) {

        throw new Exception('No available copies of this book.');
    }

    /*
    |--------------------------------------------------------------------------
    | Check duplicate active borrowing
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "SELECT id
         FROM borrowings
         WHERE member_id = ?
           AND book_id = ?
           AND status IN ('borrowed', 'overdue')
         LIMIT 1"
    );

    $stmt->execute([
        $member['id'],
        $bookId
    ]);

    if ($stmt->fetch()) {

        throw new Exception(
            'This member already has an active borrowing for this book.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reservation check
    |--------------------------------------------------------------------------
    */

    if ($reservationId > 0) {

        $stmt = $pdo->prepare(
            "SELECT id, member_id, book_id, status
             FROM reservations
             WHERE id = ?
             LIMIT 1
             FOR UPDATE"
        );

        $stmt->execute([
            $reservationId
        ]);

        $reservation = $stmt->fetch();

        if (!$reservation) {

            throw new Exception('Reservation not found.');
        }

        if ((int) $reservation['member_id'] !== (int) $member['id']) {

            throw new Exception(
                'This reservation does not belong to the selected member.'
            );
        }

        if ((int) $reservation['book_id'] !== $bookId) {

            throw new Exception(
                'The reservation book does not match the selected book.'
            );
        }

        if ($reservation['status'] !== 'approved') {

            throw new Exception(
                'Only approved reservations can be borrowed.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Borrowing period
    |--------------------------------------------------------------------------
    | Default: 14 days
    |--------------------------------------------------------------------------
    */

    $borrowedAt = date('Y-m-d');
    $dueDate = date('Y-m-d', strtotime('+14 days'));

    /*
    |--------------------------------------------------------------------------
    | Create borrowing
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "INSERT INTO borrowings
        (
            member_id,
            book_id,
            borrowed_at,
            due_date,
            status
        )
        VALUES (?, ?, ?, ?, 'borrowed')"
    );

    $stmt->execute([
        $member['id'],
        $bookId,
        $borrowedAt,
        $dueDate
    ]);

    /*
    |--------------------------------------------------------------------------
    | Decrease available copies
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE books
         SET available_copies = available_copies - 1
         WHERE id = ?
           AND available_copies > 0"
    );

    $stmt->execute([
        $bookId
    ]);

    /*
    |--------------------------------------------------------------------------
    | Increase member borrowed count
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE members
         SET borrowed_count = borrowed_count + 1
         WHERE id = ?"
    );

    $stmt->execute([
        $member['id']
    ]);

    /*
    |--------------------------------------------------------------------------
    | Complete reservation
    |--------------------------------------------------------------------------
    */

    if ($reservationId > 0) {

        $stmt = $pdo->prepare(
            "UPDATE reservations
             SET status = 'approved'
             WHERE id = ?"
        );

        $stmt->execute([
            $reservationId
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Book borrowed successfully.',
        'borrowing' => [
            'book_id' => $bookId,
            'member_id' => (int) $member['id'],
            'borrowed_at' => $borrowedAt,
            'due_date' => $dueDate,
            'status' => 'borrowed'
        ]
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}