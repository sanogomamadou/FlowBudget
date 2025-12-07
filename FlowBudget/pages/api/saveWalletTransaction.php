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

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['referenceId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

// Database connection
$host = 'localhost';
$dbname = 'budget_ai';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get user ID
$userId = 1; // Default user

// Check for duplicates
$refId = $input['referenceId'];
$checkSql = "SELECT id FROM transactions WHERE description LIKE ?";
$checkStmt = $pdo->prepare($checkSql);
$checkStmt->execute(["%{$refId}%"]);

if ($checkStmt->fetch()) {
    echo json_encode(['success' => true, 'message' => 'Already exists', 'duplicate' => true]);
    exit;
}

// Prepare data
$type = 'Dépense'; // Default
if (isset($input['type'])) {
    if ($input['type'] === 'MMD' || $input['type'] === 'CASHIN') {
        $type = 'Revenu';
    }
}

$category = isset($input['clientNote']) ? $input['clientNote'] : 'Wallet';
$amount = $input['amount'];
$date = date('Y-m-d H:i:s'); // Use current time
$description = "Wallet Transaction - Ref: " . $refId;

// Insert transaction
$sql = "INSERT INTO transactions (user_id, type, categorie, montant, date, description) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);

try {
    $stmt->execute([$userId, $type, $category, $amount, $date, $description]);
    echo json_encode([
        'success' => true,
        'message' => 'Transaction saved',
        'id' => $pdo->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save: ' . $e->getMessage()]);
}
?>
