<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$host = 'localhost';
$dbname = 'budget_ai';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$user_id = $_SESSION['user_id'];
$month = isset($_GET['month']) ? $_GET['month'] : date('m');
$year = isset($_GET['year']) ? $_GET['year'] : date('Y');

$stmt = $pdo->prepare("SELECT category, amount FROM budgets 
                      WHERE MONTH(created_at) = ? 
                      AND YEAR(created_at) = ?
                      AND user_id = ?");
$stmt->execute([$month, $year, $user_id]);
$budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($budgets);
?>
