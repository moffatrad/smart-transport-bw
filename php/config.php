<?php
// Smart Transport BW - Configuration File

// Database Configuration
define('DB_DSN', 'pgsql:host=ep-wandering-hat-ape43uns-pooler.c-7.us-east-1.aws.neon.tech;port=5432;dbname=neondb;sslmode=require;channel_binding=require');
define('DB_USER', 'neondb_owner');
define('DB_PASS', 'npg_kZcAmI02egYC');
define('DB_OPTIONS', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

// Application Configuration
define('APP_NAME', 'Smart Transport BW');
define('APP_URL', 'http://localhost/smart-transport-bw');
define('API_KEY', 'your-api-key-here');

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session Configuration
session_start();

// Time Zone
date_default_timezone_set('Africa/Gaborone');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Function to return JSON response
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Function to sanitize input
function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}
?>
