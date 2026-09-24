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
| Admin only
|--------------------------------------------------------------------------
*/

if (($_SESSION['role'] ?? '') !== 'admin') {

    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' => 'Admin access required.'
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Search/filter values
|--------------------------------------------------------------------------
*/

$search = trim($_GET['search'] ?? '');
$status = trim($_GET['status'] ?? '');

/*
|--------------------------------------------------------------------------
| Base query
|--------------------------------------------------------------------------
*/

$sql = "
    SELECT
        m.id,
        m.member_id,
        m.branch,
        m.nic,
        m.phone,
        m.joined_date,
        m.status,
        m.borrowed_count,

        u.id AS user_id,
        u.full_name,
        u.email

    FROM members m

    INNER JOIN users u
        ON m.user_id = u.id

    WHERE 1 = 1
";

$params = [];

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

if ($search !== '') {

    $sql .= "
        AND (
            u.full_name LIKE ?
            OR u.email LIKE ?
            OR m.member_id LIKE ?
            OR m.nic LIKE ?
            OR m.phone LIKE ?
        )
    ";

    $searchValue = '%' . $search . '%';

    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
}

/*
|--------------------------------------------------------------------------
| Status filter
|--------------------------------------------------------------------------
*/

if (
    $status !== '' &&
    in_array($status, ['active', 'suspended'], true)
) {

    $sql .= " AND m.status = ?";

    $params[] = $status;
}

/*
|--------------------------------------------------------------------------
| Order
|--------------------------------------------------------------------------
*/

$sql .= " ORDER BY m.joined_date DESC, m.id DESC";

/*
|--------------------------------------------------------------------------
| Execute
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare($sql);

$stmt->execute($params);

$members = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'members' => $members
]);
