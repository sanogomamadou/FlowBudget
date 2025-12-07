<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// Database connection
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

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// GET - Fetch all budgets with current spending
if ($method === 'GET') {
    try {
        // Get current month
        $current_month = date('Y-m');
        
        // Fetch budgets for current month
        $stmt = $pdo->prepare("
            SELECT b.*, 
                   COALESCE(SUM(t.montant), 0) as spent
            FROM budgets b
            LEFT JOIN transactions t ON t.user_id = b.user_id 
                AND t.categorie = b.category 
                AND t.type = 'Dépense'
                AND DATE_FORMAT(t.date, '%Y-%m') = b.month
            WHERE b.user_id = ? AND b.month = ?
            GROUP BY b.id, b.category
        ");
        $stmt->execute([$user_id, $current_month]);
        $budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($budgets);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// POST - Create new budget
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['category']) || !isset($data['amount'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    try {
        $month = $data['month'] ?? date('Y-m');
        
        // Check if budget already exists for this category and month
        $stmt = $pdo->prepare("SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ?");
        $stmt->execute([$user_id, $data['category'], $month]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Budget already exists for this category']);
            exit;
        }
        
        // Insert new budget
        $stmt = $pdo->prepare("
            INSERT INTO budgets (user_id, month, category, amount) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $month, $data['category'], $data['amount']]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT - Update budget
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['amount'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE budgets 
            SET amount = ? 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$data['amount'], $data['id'], $user_id]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// DELETE - Delete budget
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing budget ID']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
