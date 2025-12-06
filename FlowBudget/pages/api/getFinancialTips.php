<?php
// api/getFinancialTips.php

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
    
    // 1. Analyse des dépenses du mois courant
    $stmt = $db->prepare("
        SELECT categorie, SUM(montant) as total
        FROM transactions
        WHERE user_id = :user_id
          AND type = 'Dépense'
          AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
        GROUP BY categorie
        ORDER BY total DESC
    ");
    $stmt->execute([':user_id' => $userId]);
    $currentMonthSpending = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // 2. Récupération du budget prévu
    $stmt = $db->prepare("
        SELECT category, amount 
        FROM budgets 
        WHERE user_id = :user_id
        AND month = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')
    ");
    $stmt->execute([':user_id' => $userId]);
    $budgets = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // 3. Génération des conseils
    $tips = [];
    $totalDepenses = array_sum($currentMonthSpending);

    // Conseils basés sur les catégories
    $categoryTips = [
        'Alimentation' => [
            'icon' => '🍔',
            'template' => "Limite tes livraisons à %dx/semaine pour économiser ~%dMAD ce mois-ci",
            'threshold' => 600 // Seuil en MAD pour déclencher le conseil
        ],
        'Transport' => [
            'icon' => '🚌',
            'template' => "Passe au forfait étudiant mensuel de Tramway (%dMAD) pour économiser %dMAD/mois",
            'threshold' => 150
        ],
        'Loisir' => [
            'icon' => '🚌',
            'template' => "Utilise les réductions estudiantines pour économiser %dMAD/mois",
            'threshold' => 300
        ],
        'Abonnement' => [
            'icon' => '📱',
            'template' => "Regroupe %s avec un forfait duo pour économiser %dMAD/mois",
            'threshold' => 50
        ]
    ];

    foreach ($currentMonthSpending as $category => $amount) {
        if (isset($categoryTips[$category]) && $amount > $categoryTips[$category]['threshold']) {
            $savings = round($amount * 0.3); // Estimation 30% d'économie possible
            
            $tips[] = [
                'icon' => $categoryTips[$category]['icon'],
                'conseil' => sprintf(
                    $categoryTips[$category]['template'],
                    rand(2, 3), // Ex: 2-3x/semaine
                    $savings
                ),
                'category' => $category,
                'current_spending' => $amount
            ];
        }
    }

    // Conseils généraux (si peu de données)
    if (empty($tips)) {
        $tips[] = [
            'icon' => '🎓',
            'conseil' => "Utilise ton statut étudiant pour des réductions chez nos partenaires !",
            'type' => 'general_tip'
        ];
    }

    // 4. Ajout d'un conseil basé sur le budget
    if (!empty($budgets)) {
        $totalBudget = array_sum($budgets);
        $progress = round(($totalDepenses / $totalBudget) * 100);
        
        if ($progress > 75) {
            $tips[] = [
                'icon' => '⚠️',
                'conseil' => "Attention ! Tu as déjà consommé $progress% de ton budget mensuel",
                'severity' => 'high'
            ];
        }
    }

    // 5. Conseil spécifique aux étudiants (toujours inclus)
    // $tips[] = [
    //     'icon' => '🏫',
    //     'conseil' => "Profite du RU Crous : repas à 3.30MAD au lieu de 7MAD en ville !",
    //     'source' => 'student_perk'
    // ];

    echo json_encode([
        "status" => "success",
        "analysis_period" => date('Y-m'),
        "tips" => $tips,
        "generated_at" => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}