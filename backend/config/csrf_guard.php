<?php
/** Validate a session-bound CSRF token for state-changing API requests. */
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}
$sessionToken = $_SESSION['csrf_token'] ?? '';
$requestToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if (!is_string($sessionToken) || $sessionToken === '' || !is_string($requestToken) || $requestToken === '' || !hash_equals($sessionToken, $requestToken)) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Security token expired. Refresh the page and try again.']);
    exit;
}
