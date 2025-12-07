<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Use session user_id if available, otherwise default to 1
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;
$montant = isset($input['montant']) ? $input['montant'] : 0;
$type = isset($input['type']) ? $input['type'] : '';
$categorie = isset($input['categorie']) ? $input['categorie'] : '';
$date = isset($input['date']) ? $input['date'] : date('Y-m-d');

if ($montant && $type && $categorie) {
    try {
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, montant, type, categorie, date) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $montant, $type, $categorie, $date]);
        echo json_encode(['success' => true, 'message' => 'Transaction added successfully', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add transaction: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields', 'received' => $input]);
}
?>
