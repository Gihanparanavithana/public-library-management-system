<?php

session_start();

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);

    exit;
}

try {

    $data = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($data)) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Invalid request data.'
        ]);

        exit;
    }

    /*
     * Get registration data
     */

    $fullName = trim($data['full_name'] ?? '');
    $email = trim($data['email'] ?? '');
    $nic = trim($data['nic'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $branch = trim($data['branch'] ?? '');
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirm_password'] ?? '';

    /*
     * Validate required fields
     */

    if (
        $fullName === '' ||
        $email === '' ||
        $password === ''
    ) {

        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Full name, email and password are required.'
        ]);

        exit;
    }

    /*
     * Validate email
     */

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Please enter a valid email address.'
        ]);

        exit;
    }

    /*
     * Validate password confirmation
     */

    if ($password !== $confirmPassword) {

        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Passwords do not match.'
        ]);

        exit;
    }

    /*
     * Password length
     */

    if (strlen($password) < 6) {

        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Password must contain at least 6 characters.'
        ]);

        exit;
    }

    /*
     * Check duplicate email
     */

    $checkEmail = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $checkEmail->execute([$email]);

    if ($checkEmail->fetch()) {

        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' => 'An account with this email already exists.'
        ]);

        exit;
    }

    /*
     * Start database transaction
     */

    $pdo->beginTransaction();

    /*
     * Create password hash
     */

    $hashedPassword = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    /*
     * Create user account
     */

    $userStmt = $pdo->prepare("
        INSERT INTO users
        (
            full_name,
            email,
            password,
            role,
            status
        )
        VALUES (?, ?, ?, 'member', 'active')
    ");

    $userStmt->execute([
        $fullName,
        $email,
        $hashedPassword
    ]);

    $userId = (int)$pdo->lastInsertId();

    /*
     * Generate member ID
     */

    $memberId = 'LKL-MBR-' . str_pad(
        (string)$userId,
        5,
        '0',
        STR_PAD_LEFT
    );

    /*
     * Create member record
     */

    $memberStmt = $pdo->prepare("
        INSERT INTO members
        (
            user_id,
            member_id,
            nic,
            phone,
            branch,
            joined_date,
            borrowed_count,
            status
        )
        VALUES (?, ?, ?, ?, ?, CURDATE(), 0, 'active')
    ");

    $memberStmt->execute([
        $userId,
        $memberId,
        $nic !== '' ? $nic : null,
        $phone !== '' ? $phone : null,
        $branch !== '' ? $branch : null
    ]);

    /*
     * Commit transaction
     */

    $pdo->commit();

    /*
     * Success response
     */

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.',
        'member_id' => $memberId
    ]);

} catch (PDOException $e) {

    /*
     * Rollback if transaction is active
     */

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Registration failed. Please try again.'
    ]);

} catch (Throwable $e) {

    /*
     * Rollback if transaction is active
     */

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred.'
    ]);
}