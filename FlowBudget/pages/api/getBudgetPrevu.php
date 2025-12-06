<?php
// api/getBudgetPrevu.php

require_once('../config/auth.php');
require_once('../config/db.php');

header('Content-Type: application/json');

// Fonction de réponse JSON locale
function sendJsonResponse($success, $message = '', $data = [], $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ]);
    exit;
}

// Vérification d'authentification
if (!isAuthorized()) {
    sendJsonResponse(false, 'Accès refusé', [], 403);
}

$userId = $_POST['user_id'] ?? null;
$month = $_POST['month'] ?? null;

// Validation des entrées
if (!$userId || !$month || !preg_match('/^[0-9]{4}-(0[1-9]|1[0-2])$/', $month)) {
    sendJsonResponse(false, 'Paramètres invalides. user_id et month (YYYY-MM) requis', [], 400);
}

try {
    $db = getDBConnection();

    // Requête pour récupérer les budgets
    $stmt = $db->prepare("
        SELECT category, amount 
        FROM budgets 
        WHERE user_id = :user_id 
        AND month = :month
    ");
    $stmt->execute([':user_id' => $userId, ':month' => $month]);

    $budgets = [];
    $total = 0;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $amount = (float)$row['amount'];
        $budgets[$row['category']] = $amount;
        $total += $amount;
    }

    // Formatage de la réponse
    $response = [
        'month' => $month,
        'user_id' => (int)$userId,
        'total' => $total,
        'budgets' => $budgets
    ];

    sendJsonResponse(true, 'Budgets prévus récupérés', $response);

} catch (PDOException $e) {
    // Journalisation d'erreur basique
    file_put_contents('../logs/error.log', date('[Y-m-d H:i:s] ') . $e->getMessage() . "\n", FILE_APPEND);
    sendJsonResponse(false, 'Erreur de base de données', [], 500);
}