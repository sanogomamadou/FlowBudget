<?php
// api/getCashflow.php

require_once('../config/auth.php');
require_once('../config/db.php');

header('Content-Type: application/json');

if (!isAuthorized()) {
    http_response_code(403);
    echo json_encode(["error" => "Accès refusé."]);
    exit;
}

$userId = $_POST['user_id'] ?? null;
if (!$userId) {
    http_response_code(400);
    echo json_encode(["error" => "user_id est requis."]);
    exit;
}

try {
    $db = getDBConnection();
    $currentDate = date('Y-m-d');
    $currentMonth = date('Y-m');
    $daysInMonth = date('t');
    $daysRemaining = $daysInMonth - date('j');
    
    // 1. Calcul des revenus et dépenses actuels
    $stmt = $db->prepare("
        SELECT 
            SUM(CASE WHEN type = 'Revenu' THEN montant ELSE 0 END) as revenus,
            SUM(CASE WHEN type = 'Dépense' THEN montant ELSE 0 END) as depenses
        FROM transactions
        WHERE user_id = :user_id
          AND DATE_FORMAT(date, '%Y-%m') = :current_month
    ");
    $stmt->execute([':user_id' => $userId, ':current_month' => $currentMonth]);
    $totals = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Prévision des revenus récurrents
    $futureIncome = 0;
    if ($db->query("SHOW TABLES LIKE 'transactions_recurrentes'")->rowCount() > 0) {
        $stmt = $db->prepare("
            SELECT SUM(montant) as revenus_futurs
            FROM transactions_recurrentes
            WHERE user_id = :user_id
              AND date_prochaine BETWEEN :current_date AND LAST_DAY(:current_date)
              AND type = 'Revenu'
        ");
        $stmt->execute([':user_id' => $userId, ':current_date' => $currentDate]);
        $futureIncome = (float)$stmt->fetchColumn();
    }

    // 3. Prévision des dépenses récurrentes
    $futureExpenses = 0;
    if ($db->query("SHOW TABLES LIKE 'transactions_recurrentes'")->rowCount() > 0) {
        $stmt = $db->prepare("
            SELECT SUM(montant) as depenses_futures
            FROM transactions_recurrentes
            WHERE user_id = :user_id
              AND date_prochaine BETWEEN :current_date AND LAST_DAY(:current_date)
              AND type = 'Dépense'
        ");
        $stmt->execute([':user_id' => $userId, ':current_date' => $currentDate]);
        $futureExpenses = (float)$stmt->fetchColumn();
    }

    // 4. Calcul des projections
    $currentBalance = ($totals['revenus'] ?? 0) - ($totals['depenses'] ?? 0);
    $projectedBalance = $currentBalance + $futureIncome - $futureExpenses;
    
    // 5. Détection des seuils d'alerte
    $alertThresholds = [
        'critical' => 0,
        'warning' => 50,
        'normal' => 100
    ];
    
    $alertLevel = ($projectedBalance < $alertThresholds['critical']) ? 'critical' : 
                 (($projectedBalance < $alertThresholds['warning']) ? 'warning' : 
                 (($projectedBalance < $alertThresholds['normal']) ? 'normal' : 'good'));

    // 6. Formatage de la réponse
    echo json_encode([
        "status" => "success",
        "projection" => [
            "solde_actuel" => round($currentBalance, 2),
            "solde_fin_mois" => round($projectedBalance, 2),
            "jours_restants" => $daysRemaining,
            "niveau_alerte" => $alertLevel,
            "details" => [
                "revenus" => round($totals['revenus'] ?? 0, 2),
                "depenses" => round($totals['depenses'] ?? 0, 2),
                "revenus_futurs" => round($futureIncome, 2),
                "depenses_futures" => round($futureExpenses, 2)
            ]
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}