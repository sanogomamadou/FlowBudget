<?php
// api/analyzeSpending.php

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

    // 1. Récupérer les dépenses réelles
    $stmtExpenses = $db->prepare("
        SELECT categorie, SUM(montant) as total
        FROM transactions
        WHERE user_id = :user_id
          AND type = 'Dépense'
          AND DATE_FORMAT(date, '%Y-%m') = :month
        GROUP BY categorie
    ");
    $stmtExpenses->execute([':user_id' => $userId, ':month' => $month]);
    $realExpenses = $stmtExpenses->fetchAll(PDO::FETCH_KEY_PAIR);

    // 2. Récupérer les budgets prévus
    $stmtBudgets = $db->prepare("
        SELECT category, amount
        FROM budgets
        WHERE user_id = :user_id
          AND month = :month
    ");
    $stmtBudgets->execute([':user_id' => $userId, ':month' => $month]);
    $plannedBudgets = $stmtBudgets->fetchAll(PDO::FETCH_KEY_PAIR);

    // 3. Calculer les comparaisons
    $analysis = [];
    $totalOverspending = 0;
    $totalSavings = 0;

    // Catégories avec budget
    foreach ($plannedBudgets as $category => $planned) {
        $real = $realExpenses[$category] ?? 0;
        $difference = $real - $planned;
        
        if ($difference > 0) {
            $totalOverspending += $difference;
        } else {
            $totalSavings += abs($difference);
        }

        $analysis[$category] = [
            'planned' => (float)$planned,
            'real' => (float)$real,
            'difference' => (float)$difference,
            'status' => $difference > 0 ? 'over' : ($difference < 0 ? 'under' : 'equal')
        ];
    }

    // Catégories sans budget mais avec dépenses
    foreach ($realExpenses as $category => $real) {
        if (!isset($plannedBudgets[$category])) {
            $analysis[$category] = [
                'planned' => null,
                'real' => (float)$real,
                'difference' => null,
                'status' => 'no_budget'
            ];
        }
    }

    // 4. Calculer les totaux
    $totalReal = array_sum($realExpenses);
    $totalPlanned = array_sum($plannedBudgets);
    $globalDifference = $totalReal - $totalPlanned;

    echo json_encode([
        "status" => "success",
        "month" => $month,
        "user_id" => $userId,
        "totals" => [
            "planned" => (float)$totalPlanned,
            "real" => (float)$totalReal,
            "difference" => (float)$globalDifference,
            "overspending" => (float)$totalOverspending,
            "savings" => (float)$totalSavings
        ],
        "details" => $analysis
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}