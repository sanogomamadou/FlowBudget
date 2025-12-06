<?php
// api/analyzeSpending.php

require_once('../config/auth.php');
require_once('../config/db.php');

// Nettoyer les headers existants
header_remove();
header('Content-Type: application/json; charset=utf-8');

// Désactiver l'affichage des erreurs dans la réponse
ini_set('display_errors', 0);

// if (!isAuthorized()) {
//     http_response_code(403);
//     echo json_encode(["error" => "Accès refusé."]);
//     exit;
// }

// Récupération sécurisée des paramètres
$userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
$month = filter_input(INPUT_POST, 'month', FILTER_SANITIZE_STRING);

if (!$userId || !$month || !preg_match('/^\d{4}-\d{2}$/', $month)) {
    http_response_code(400);
    echo json_encode([
        "error" => "Paramètres invalides",
        "details" => [
            "user_id" => "Doit être un entier",
            "month" => "Doit être au format YYYY-MM"
        ]
    ]);
    exit;
}

try {
    $db = getDBConnection();
    
    // Transactions
    $stmtExpenses = $db->prepare("SELECT categorie, SUM(montant) as total FROM transactions 
                                 WHERE user_id = :user_id AND type = 'Dépense' 
                                 AND DATE_FORMAT(date, '%Y-%m') = :month GROUP BY categorie");
    $stmtExpenses->execute([':user_id' => $userId, ':month' => $month]);
    $realExpenses = $stmtExpenses->fetchAll(PDO::FETCH_KEY_PAIR);

    // Budgets
    $stmtBudgets = $db->prepare("SELECT category, amount FROM budgets 
                                WHERE user_id = :user_id AND month = :month");
    $stmtBudgets->execute([':user_id' => $userId, ':month' => $month]);
    $plannedBudgets = $stmtBudgets->fetchAll(PDO::FETCH_KEY_PAIR);

    // Analyse
    $analysis = [];
    $totals = [
        'overspending' => 0,
        'savings' => 0,
        'real' => 0,
        'planned' => 0
    ];

    foreach ($plannedBudgets as $category => $planned) {
        $real = $realExpenses[$category] ?? 0;
        $diff = $real - $planned;
        
        $status = match(true) {
            $diff > 0 => 'over',
            $diff < 0 => 'under',
            default => 'equal'
        };

        $analysis[$category] = [
            'planned' => (float)$planned,
            'real' => (float)$real,
            'difference' => (float)$diff,
            'status' => $status
        ];

        $totals['real'] += $real;
        $totals['planned'] += $planned;
        $diff > 0 ? $totals['overspending'] += $diff : $totals['savings'] += abs($diff);
    }

    // Catégories sans budget
    foreach (array_diff_key($realExpenses, $plannedBudgets) as $category => $real) {
        $analysis[$category] = [
            'planned' => null,
            'real' => (float)$real,
            'difference' => null,
            'status' => 'no_budget'
        ];
        $totals['real'] += $real;
    }

    // Réponse finale
    $response = [
        "status" => "success",
        "month" => $month,
        "user_id" => (int)$userId,
        "totals" => [
            "planned" => (float)$totals['planned'],
            "real" => (float)$totals['real'],
            "difference" => (float)($totals['real'] - $totals['planned']),
            "overspending" => (float)$totals['overspending'],
            "savings" => (float)$totals['savings']
        ],
        "details" => $analysis
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database error: " . $e->getMessage());
    echo json_encode(["error" => "Erreur de base de données"]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("System error: " . $e->getMessage());
    echo json_encode(["error" => "Erreur système"]);
}
exit;