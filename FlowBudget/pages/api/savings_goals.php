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

// GET - Fetch all savings goals
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate days remaining for each goal
        foreach ($goals as &$goal) {
            $target = new DateTime($goal['target_date']);
            $now = new DateTime();
            $diff = $now->diff($target);
            $goal['days_remaining'] = $diff->invert ? 0 : $diff->days;
            $goal['is_locked'] = $now < $target;
        }
        
        echo json_encode($goals);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// POST - Create new savings goal
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || !isset($data['target_amount']) || !isset($data['target_date'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO savings_goals 
            (user_id, name, target_amount, target_date, auto_contribute, contribution_amount, contribution_frequency) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['target_amount'],
            $data['target_date'],
            $data['auto_contribute'] ?? false,
            $data['contribution_amount'] ?? null,
            $data['contribution_frequency'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT - Update savings goal or contribute
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing goal ID']);
        exit;
    }
    
    try {
        // If it's a contribution
        if (isset($data['contribute'])) {
            $stmt = $pdo->prepare("
                UPDATE savings_goals 
                SET current_amount = current_amount + ? 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$data['contribute'], $data['id'], $user_id]);
        }
        // If it's a withdrawal
        elseif (isset($data['withdraw'])) {
            // Check if goal is unlocked
            $stmt = $pdo->prepare("SELECT target_date, current_amount FROM savings_goals WHERE id = ? AND user_id = ?");
            $stmt->execute([$data['id'], $user_id]);
            $goal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$goal) {
                http_response_code(404);
                echo json_encode(['error' => 'Goal not found']);
                exit;
            }
            
            $target = new DateTime($goal['target_date']);
            $now = new DateTime();
            
            if ($now < $target) {
                http_response_code(403);
                echo json_encode(['error' => 'Cannot withdraw before target date']);
                exit;
            }
            
            if ($data['withdraw'] > $goal['current_amount']) {
                http_response_code(400);
                echo json_encode(['error' => 'Insufficient funds']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                UPDATE savings_goals 
                SET current_amount = current_amount - ? 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$data['withdraw'], $data['id'], $user_id]);
        }
        // Regular update
        else {
            $stmt = $pdo->prepare("
                UPDATE savings_goals 
                SET name = ?, target_amount = ?, target_date = ?, 
                    auto_contribute = ?, contribution_amount = ?, contribution_frequency = ?
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([
                $data['name'],
                $data['target_amount'],
                $data['target_date'],
                $data['auto_contribute'] ?? false,
                $data['contribution_amount'] ?? null,
                $data['contribution_frequency'] ?? null,
                $data['id'],
                $user_id
            ]);
        }
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// DELETE - Delete savings goal
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing goal ID']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM savings_goals WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
