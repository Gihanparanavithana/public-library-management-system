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

$title = trim($data['title'] ?? '');
$author = trim($data['author'] ?? '');
$isbn = trim($data['isbn'] ?? '');
$publisher = trim($data['publisher'] ?? '');
$category = trim($data['category'] ?? '');

$year = !empty($data['year_published'])
    ? (int)$data['year_published']
    : null;

$pages = !empty($data['pages'])
    ? (int)$data['pages']
    : null;

$copies = (int)($data['copies'] ?? 0);

$synopsis = trim($data['synopsis'] ?? '');

if ($title === '' || $author === '' || $copies < 1) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'Title, author and number of copies are required.'
    ]);

    exit;
}

try {

    if ($isbn !== '') {

        $check = $pdo->prepare(
            'SELECT id FROM books WHERE isbn = ? LIMIT 1'
        );

        $check->execute([$isbn]);

        if ($check->fetch()) {

            http_response_code(409);

            echo json_encode([
                'success' => false,
                'message' => 'A book with this ISBN already exists.'
            ]);

            exit;
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO books
        (
            title,
            author,
            isbn,
            publisher,
            category,
            year_published,
            pages,
            total_copies,
            available_copies,
            synopsis
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    $stmt->execute([
        $title,
        $author,
        $isbn !== '' ? $isbn : null,
        $publisher !== '' ? $publisher : null,
        $category !== '' ? $category : null,
        $year,
        $pages,
        $copies,
        $copies,
        $synopsis !== '' ? $synopsis : null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Book added successfully.',
        'id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Failed to add book.'
    ]);
}
