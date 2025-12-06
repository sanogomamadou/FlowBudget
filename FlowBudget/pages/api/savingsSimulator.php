<?php
// api/savingsSimulator.php

require_once('../config/auth.php');
require_once('../config/db.php');

header('Content-Type: application/json');

if (!isAuthorized()) {
    http_response_code(403);
    echo json_encode(["error" => "Accès refusé."]);
    exit;
}

// Récupération des données
parse_str(file_get_contents('php://input'), $input);

$userId = $input['user_id'] ?? null;
$reduceData = $input['reduce'] ?? [];

// Validation des paramètres
if (!$userId || empty($reduceData)) {
    http_response_code(400);
    echo json_encode(["error" => "Paramètres manquants : user_id et reduce requis"]);
    exit;
}

try {
    $db = getDBConnection();
    
    // 1. Récupération des dépenses actuelles
    $stmt = $db->prepare("
        SELECT categorie, SUM(montant) as total
        FROM transactions
        WHERE user_id = :user_id
          AND type = 'Dépense'
          AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
        GROUP BY categorie
    ");
    $stmt->execute([':user_id' => $userId]);
    $currentSpending = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // 2. Calcul des économies potentielles
    $savings = [];
    $totalMonthlySavings = 0;

    foreach ($reduceData as $category => $percent) {
        if (isset($currentSpending[$category])) {
            $amount = $currentSpending[$category] * ($percent / 100);
            $savings[$category] = [
                'current_amount' => $currentSpending[$category],
                'reduction_percent' => $percent,
                'monthly_saving' => round($amount, 2)
            ];
            $totalMonthlySavings += $amount;
        }
    }

    // 3. Calcul des projections
    $yearlySavings = $totalMonthlySavings * 12;

    // 4. Équivalents étudiants
    $equivalents = [
        'Tacos' => round($totalMonthlySavings / 30),   // Prix Tacos
        'Sneakers' => round($totalMonthlySavings / 400) // Prix Sneakers
    ];

    // 5. Formatage de la réponse
    echo json_encode([
        "status" => "success",
        "projection" => [
            "economies_mensuelles" => round($totalMonthlySavings, 2),
            "economies_annuelles" => round($yearlySavings, 2),
            "details" => $savings,
            "equivalents" => [
                "Tacos" => "≈ {$equivalents['cafes']} Tacos à ARTCHILL",
                "Sneakers" => "≈ {$equivalents['repas_ru']} Sneakers chez OG SHOP"
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}