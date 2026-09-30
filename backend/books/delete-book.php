<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

if (($_SESSION['role'] ?? '') !== 'admin') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Admin access required.'
    ]);

    exit;
}

$data = json_decode(
    file_get_contents('php://input'),
    true
) ?? [];

$id = (int)($data['id'] ?? 0);

if ($id < 1) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Valid book ID is required.'
    ]);

    exit;
}

try {

    $checkBook = $pdo->prepare(
        'SELECT id FROM books WHERE id = ? LIMIT 1'
    );

    $checkBook->execute([$id]);

    if (!$checkBook->fetch()) {

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Book not found.'
        ]);

        exit;
    }

    $checkBorrowing = $pdo->prepare(
        "SELECT COUNT(*)
         FROM borrowings
         WHERE book_id = ?
         AND status IN ('borrowed', 'overdue')"
    );

    $checkBorrowing->execute([$id]);

    $activeBorrowings =
        (int)$checkBorrowing->fetchColumn();

    if ($activeBorrowings > 0) {

        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' =>
                'This book cannot be deleted because it has active borrowings.'
        ]);

        exit;
    }

    $stmt = $pdo->prepare(
        'DELETE FROM books WHERE id = ?'
    );

    $stmt->execute([$id]);

    echo json_encode([
        'success' => true,
        'message' => 'Book deleted successfully.'
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete book.'
    ]);
}
