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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$user_id = $_SESSION['user_id'];
$montant = $input['montant'] ?? 0;
$type = $input['type'] ?? '';
$categorie = $input['categorie'] ?? '';
$date = $input['date'] ?? date('Y-m-d');

if ($montant && $type && $categorie) {
    try {
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, montant, type, categorie, date) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $montant, $type, $categorie, $date]);
        echo json_encode(['success' => true, 'message' => 'Transaction added successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add transaction: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
}
?>
