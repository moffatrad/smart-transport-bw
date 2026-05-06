<?php
require_once __DIR__ . '/config.php';

function getDbConnection() {
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    try {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, DB_OPTIONS);
        return $pdo;
    } catch (PDOException $ex) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Database connection failed',
            'message' => $ex->getMessage(),
        ]);
        exit;
    }
}
