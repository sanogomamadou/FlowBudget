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

$nom = $input['nom'] ?? null;
$email = $input['email'] ?? null;
$new_password = $input['password'] ?? null;

if (!$nom && !$email && !$new_password) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update']);
    exit;
}

try {
    $updates = [];
    $params = [];

    if ($nom) {
        $updates[] = "nom = ?";
        $params[] = $nom;
    }

    if ($email) {
        $updates[] = "email = ?";
        $params[] = $email;
    }

    if ($new_password) {
        $updates[] = "mdp = ?";
        $params[] = password_hash($new_password, PASSWORD_DEFAULT);
    }

    $params[] = $user_id;

    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update profile: ' . $e->getMessage()]);
}
?>
