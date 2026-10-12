<?php
/**
 * Revalidates an existing login against the database before protected API work.
 * Existing endpoint-level login and role checks remain in place.
 */
function ensureActiveSessionUser(PDO $pdo): void
{
    if (empty($_SESSION['user_id'])) {
        return;
    }

    $stmt = $pdo->prepare(
        'SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1'
    );
    $stmt->execute([(int) $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'] ?: '/',
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => true,
                'samesite' => $params['samesite'] ?? 'Lax',
            ]);
        }
        session_destroy();
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'This account is inactive. Please sign in again or contact the library administrator.'
        ]);
        exit;
    }

    // Refresh role and identity from the database; do not trust stale session values.
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
}
