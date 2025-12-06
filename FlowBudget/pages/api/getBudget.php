<?php
// api/getBudget.php

require_once('../config/auth.php');
require_once('../config/db.php');

header('Content-Type: application/json');

if (!isAuthorized()) {
    http_response_code(403);
    echo json_encode(["error" => "Accès refusé."]);
    exit;
}

$userId = $_POST['user_id'] ?? null;
$month = $_POST['month'] ?? null;

if (!$userId || !$month) {
    http_response_code(400);
    echo json_encode(["error" => "Champs requis : user_id et month (format YYYY-MM)."]);
    exit;
}

try {
    $db = getDBConnection();

    // 1. Récupération des dépenses
    $stmtDepenses = $db->prepare("
        SELECT SUM(montant) as total 
        FROM transactions 
        WHERE user_id = :user_id 
          AND type = 'Dépense'
          AND DATE_FORMAT(date, '%Y-%m') = :month
    ");
    $stmtDepenses->execute([':user_id' => $userId, ':month' => $month]);
    $totalDepenses = (float)$stmtDepenses->fetchColumn();

    // 2. Récupération des revenus
    $stmtRevenus = $db->prepare("
        SELECT SUM(montant) as total 
        FROM transactions 
        WHERE user_id = :user_id 
          AND type = 'Revenu'
          AND DATE_FORMAT(date, '%Y-%m') = :month
    ");
    $stmtRevenus->execute([':user_id' => $userId, ':month' => $month]);
    $totalRevenus = (float)$stmtRevenus->fetchColumn();

    // 3. Calcul du budget
    $budget = $totalRevenus - $totalDepenses;

    // 4. Récupération du détail par catégorie
    $stmtCategories = $db->prepare("
        SELECT 
            type,
            categorie,
            SUM(montant) as total
        FROM transactions
        WHERE user_id = :user_id
          AND DATE_FORMAT(date, '%Y-%m') = :month
        GROUP BY type, categorie
    ");
    $stmtCategories->execute([':user_id' => $userId, ':month' => $month]);
    
    $details = [
        'Revenus' => [],
        'Dépenses' => []
    ];

    while ($row = $stmtCategories->fetch(PDO::FETCH_ASSOC)) {
        $details[$row['type']][$row['categorie']] = (float)$row['total'];
    }

    echo json_encode([
        "status" => "success",
        "budget" => $budget,
        "total_revenus" => $totalRevenus,
        "total_depenses" => $totalDepenses,
        "details" => $details
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}