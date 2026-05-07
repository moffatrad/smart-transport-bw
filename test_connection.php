<?php
require_once __DIR__ . '/php/config.php';
require_once __DIR__ . '/php/db.php';

try {
    $pdo = getDbConnection();
    echo json_encode([
        'status' => 'success',
        'message' => 'Successfully connected to Railway PostgreSQL database',
        'database' => 'railway',
        'host' => 'trolley.proxy.rlwy.net:51992'
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
