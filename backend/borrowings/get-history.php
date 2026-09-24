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
| Update overdue records
|--------------------------------------------------------------------------
*/

$pdo->exec(
    "UPDATE borrowings
     SET status = 'overdue'
     WHERE status = 'borrowed'
       AND due_date < CURDATE()"
);

/*
|--------------------------------------------------------------------------
| Admin → all history
|--------------------------------------------------------------------------
*/

if (($_SESSION['role'] ?? '') === 'admin') {

    $stmt = $pdo->query(
        "
        SELECT
            br.id,
            br.borrowed_at,
            br.due_date,
            br.returned_at,
            br.status,

            m.member_id AS member_code,
            u.full_name AS member_name,

            b.title AS book_title,
            b.author AS book_author

        FROM borrowings br

        INNER JOIN members m
            ON br.member_id = m.id

        INNER JOIN users u
            ON m.user_id = u.id

        INNER JOIN books b
            ON br.book_id = b.id

        ORDER BY br.borrowed_at DESC
        "
    );

} else {

    /*
    |--------------------------------------------------------------------------
    | Member → own history
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare(
        "
        SELECT
            br.id,
            br.borrowed_at,
            br.due_date,
            br.returned_at,
            br.status,

            b.title AS book_title,
            b.author AS book_author

        FROM borrowings br

        INNER JOIN members m
            ON br.member_id = m.id

        INNER JOIN books b
            ON br.book_id = b.id

        WHERE m.user_id = ?

        ORDER BY br.borrowed_at DESC
        "
    );

    $stmt->execute([
        $_SESSION['user_id']
    ]);
}

$history = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'history' => $history
]);
