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

    $find = $pdo->prepare(
        'SELECT
            id,
            title,
            author,
            isbn,
            publisher,
            category,
            year_published,
            pages,
            synopsis
         FROM books
         WHERE id = ?
         LIMIT 1'
    );

    $find->execute([$id]);

    $current = $find->fetch();

    if (!$current) {

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Book not found.'
        ]);

        exit;
    }

    $title = array_key_exists('title', $data)
        ? trim((string)$data['title'])
        : $current['title'];

    $author = array_key_exists('author', $data)
        ? trim((string)$data['author'])
        : $current['author'];

    $isbn = array_key_exists('isbn', $data)
        ? trim((string)$data['isbn'])
        : ($current['isbn'] ?? '');

    $publisher = array_key_exists('publisher', $data)
        ? trim((string)$data['publisher'])
        : ($current['publisher'] ?? '');

    $category = array_key_exists('category', $data)
        ? trim((string)$data['category'])
        : ($current['category'] ?? '');

    $yearValue = array_key_exists('year_published', $data)
        ? $data['year_published']
        : $current['year_published'];

    $year = ($yearValue !== null && $yearValue !== '')
        ? (int)$yearValue
        : null;

    $pagesValue = array_key_exists('pages', $data)
        ? $data['pages']
        : $current['pages'];

    $pages = ($pagesValue !== null && $pagesValue !== '')
        ? (int)$pagesValue
        : null;

    $synopsis = array_key_exists('synopsis', $data)
        ? trim((string)$data['synopsis'])
        : ($current['synopsis'] ?? '');

    if ($title === '' || $author === '') {

        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Title and author are required.'
        ]);

        exit;
    }

    if ($isbn !== '') {

        $check = $pdo->prepare(
            'SELECT id
             FROM books
             WHERE isbn = ?
             AND id != ?
             LIMIT 1'
        );

        $check->execute([
            $isbn,
            $id
        ]);

        if ($check->fetch()) {

            http_response_code(409);

            echo json_encode([
                'success' => false,
                'message' => 'Another book already uses this ISBN.'
            ]);

            exit;
        }
    }

    /*
     * total_copies and available_copies are intentionally
     * not changed during editing because active borrowings
     * must remain consistent.
     */

    $stmt = $pdo->prepare(
        'UPDATE books
         SET
            title = ?,
            author = ?,
            isbn = ?,
            publisher = ?,
            category = ?,
            year_published = ?,
            pages = ?,
            synopsis = ?
         WHERE id = ?'
    );

    $stmt->execute([
        $title,
        $author,
        $isbn !== '' ? $isbn : null,
        $publisher !== '' ? $publisher : null,
        $category !== '' ? $category : null,
        $year,
        $pages,
        $synopsis !== '' ? $synopsis : null,
        $id
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Book updated successfully.'
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Failed to update book.'
    ]);
}
