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

$borrowingId = (int) ($data['borrowing_id'] ?? 0);

if ($borrowingId <= 0) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid borrowing ID.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Get borrowing
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare(
    "SELECT
        br.id,
        br.member_id,
        br.book_id,
        br.status,
        br.due_date
     FROM borrowings br
     WHERE br.id = ?
     LIMIT 1"
);

$stmt->execute([
    $borrowingId
]);

$borrowing = $stmt->fetch();

if (!$borrowing) {

    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'Borrowing record not found.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Member can only return own book
|--------------------------------------------------------------------------
*/

if (($_SESSION['role'] ?? '') !== 'admin') {

    $stmt = $pdo->prepare(
        "SELECT id
         FROM members
         WHERE id = ?
           AND user_id = ?
         LIMIT 1"
    );

    $stmt->execute([
        $borrowing['member_id'],
        $_SESSION['user_id']
    ]);

    if (!$stmt->fetch()) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'You are not allowed to return this book.'
        ]);

        exit;
    }
}

/*
|--------------------------------------------------------------------------
| Already returned
|--------------------------------------------------------------------------
*/

if ($borrowing['status'] === 'returned') {

    http_response_code(409);

    echo json_encode([
        'success' => false,
        'message' => 'This book has already been returned.'
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

    $returnDate = date('Y-m-d');

    /*
    |--------------------------------------------------------------------------
    | Update borrowing
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE borrowings
         SET returned_at = ?,
             status = 'returned'
         WHERE id = ?
           AND status IN ('borrowed', 'overdue')"
    );

    $stmt->execute([
        $returnDate,
        $borrowingId
    ]);

    if ($stmt->rowCount() === 0) {

        throw new Exception(
            'The borrowing record could not be updated.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Increase available copies
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE books
         SET available_copies = available_copies + 1
         WHERE id = ?"
    );

    $stmt->execute([
        $borrowing['book_id']
    ]);

    /*
    |--------------------------------------------------------------------------
    | Decrease member borrowed count
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "UPDATE members
         SET borrowed_count =
             CASE
                 WHEN borrowed_count > 0
                 THEN borrowed_count - 1
                 ELSE 0
             END
         WHERE id = ?"
    );

    $stmt->execute([
        $borrowing['member_id']
    ]);

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Book returned successfully.',
        'returned_at' => $returnDate
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
