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
$year = isset($_GET['year']) ? $_GET['year'] : date('Y');

$stmt = $pdo->prepare("
    SELECT categorie, SUM(montant) AS total
    FROM transactions 
    WHERE type = 'Dépense' 
    AND user_id = ?
    AND YEAR(date) = ?
    GROUP BY categorie
");
$stmt->execute([$user_id, $year]);
$expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Format for frontend
$result = [];
foreach ($expenses as $row) {
    $result[] = [
        'name' => $row['categorie'],
        'value' => (float)$row['total']
    ];
}

echo json_encode($result);
?>
