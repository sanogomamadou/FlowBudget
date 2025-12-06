<?php
// api/analyzeSpendingHabits.php

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
    
    // 1. Analyse des dépenses sur 3 mois
    $stmt = $db->prepare("
        SELECT 
            DATE_FORMAT(date, '%Y-%m') as month,
            categorie,
            SUM(montant) as total
        FROM transactions
        WHERE user_id = :user_id
          AND type = 'Dépense'
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
        GROUP BY month, categorie
        ORDER BY total DESC
    ");
    $stmt->execute([':user_id' => $userId]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Calcul des indicateurs clés
    $totalDepenses = array_sum(array_column($transactions, 'total'));
    $categories = [];
    
    foreach ($transactions as $t) {
        $categories[$t['categorie']] = ($categories[$t['categorie']] ?? 0) + $t['total'];
    }

    arsort($categories);
    $topCategory = key($categories);
    $topPercentage = round(($categories[$topCategory] / $totalDepenses) * 100);

    // 3. Détection des tendances (comparaison mois dernier/mois actuel)
    $currentMonth = date('Y-m');
    $lastMonth = date('Y-m', strtotime('-1 month'));
    
    $currentSpending = [];
    $lastSpending = [];
    
    foreach ($transactions as $t) {
        if ($t['month'] === $currentMonth) {
            $currentSpending[$t['categorie']] = $t['total'];
        } elseif ($t['month'] === $lastMonth) {
            $lastSpending[$t['categorie']] = $t['total'];
        }
    }

    // 4. Analyse des habitudes spécifiques aux étudiants
    $habits = [
        'plus_grosse_depense' => "$topCategory ($topPercentage% du budget)",
        'tendance' => 'stable',
        'points_faibles' => []
    ];

    // Détection des tendances
    foreach ($currentSpending as $category => $amount) {
        if (isset($lastSpending[$category])) {
            $change = (($amount - $lastSpending[$category]) / $lastSpending[$category]) * 100;
            
            if ($change > 15) {
                $habits['tendance'] = "Dépenses $category ↗️ +" . round($change) . "% vs mois dernier";
            } elseif ($change < -15) {
                $habits['tendance'] = "Dépenses $category ↘️ " . round($change) . "% vs mois dernier";
            }
        }
    }

    // Détection des points faibles (config étudiant)
    $studentWeakPoints = [
        'Vêtements' => 400,  // Seuil à ne pas dépasser en MAD
        'Loisir' => 200,
        'Abonnement' => 100,
        'Soins corporels' => 80
    ];

    foreach ($studentWeakPoints as $category => $threshold) {
        if (isset($categories[$category]) && $categories[$category] > $threshold) {
            $habits['points_faibles'][] = "$category (dépassement de " . ($categories[$category] - $threshold) . "MAD)";
        }
    }

    // 5. Formatage de la réponse
    echo json_encode([
        "status" => "success",
        "analysis_period" => "3_months",
        "habits" => $habits,
        "student_specific_tip" => "💡 Astuce étudiante : Utilise ton compte ISIC pour -10% chez les partenaires"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}