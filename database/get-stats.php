<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

/*
|--------------------------------------------------------------------------
| Admin authentication
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['user_id']) ||
    ($_SESSION['role'] ?? '') !== 'admin'
) {

    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Administrator authentication required.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Total books
|--------------------------------------------------------------------------
*/

$stmt = $pdo->query(
    'SELECT COUNT(*) FROM books'
);

$totalBooks = (int) $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| Active members
|--------------------------------------------------------------------------
*/

$stmt = $pdo->query(
    "SELECT COUNT(*)
     FROM members
     WHERE status = 'active'"
);

$activeMembers = (int) $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| Pending reservations
|--------------------------------------------------------------------------
*/

$stmt = $pdo->query(
    "SELECT COUNT(*)
     FROM reservations
     WHERE status = 'pending'"
);

$pendingReservations = (int) $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| Overdue books
|--------------------------------------------------------------------------
*/

$stmt = $pdo->query(
    "SELECT COUNT(*)
     FROM borrowings
     WHERE status = 'overdue'"
);

$overdueBooks = (int) $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| Return dashboard statistics
|--------------------------------------------------------------------------
*/

echo json_encode([
    'success' => true,
    'stats' => [
        'total_books' => $totalBooks,
        'active_members' => $activeMembers,
        'pending_reservations' => $pendingReservations,
        'overdue_books' => $overdueBooks
    ]
]);