<?php
// api/checkAlerts.php

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
    $alerts = [];
    $currentMonth = date('Y-m');

    // 1. Alertes de dépassement de budget (10% ou plus)
    $stmt = $db->prepare("
        SELECT b.category, b.amount, SUM(t.montant) as spent
        FROM budgets b
        JOIN transactions t ON b.user_id = t.user_id 
           AND DATE_FORMAT(t.date, '%Y-%m') = b.month
           AND t.categorie = b.category
           AND t.type = 'Dépense'
        WHERE b.user_id = :user_id
          AND b.month = :current_month
        GROUP BY b.category
        HAVING spent > b.amount * 1.1
    ");
    $stmt->execute([':user_id' => $userId, ':current_month' => $currentMonth]);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $overPercent = round(($row['spent'] / $row['amount']) * 100 - 100);
        $alerts[] = [
            'type' => 'depassement',
            'category' => $row['category'],
            'message' => "⚠️ Dépenses {$row['category']} à {$overPercent}% du budget (" . round($row['spent']) . "MAD/".round($row['amount'])."MAD)",
            'severity' => ($overPercent > 30) ? 'high' : 'medium'
        ];
    }

    // 2. Alertes de dépenses atypiques (seuils étudiants)
    $studentThresholds = [
        'Loisir' => ['limit' => 200, 'message' => "🚨 Tu dépenses trop en livraison (%dMAD ce mois)"],
        'Vêtements' => ['limit' => 400, 'message' => "🎉 Tu dépenses trop dans l'habillement, future Namonie Campbell (%dMAD dépensés)"]
    ];
    
    $stmt = $db->prepare("
        SELECT categorie, SUM(montant) as total
        FROM transactions
        WHERE user_id = :user_id
          AND DATE_FORMAT(date, '%Y-%m') = :current_month
          AND type = 'Dépense'
        GROUP BY categorie
    ");
    $stmt->execute([':user_id' => $userId, ':current_month' => $currentMonth]);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (isset($studentThresholds[$row['categorie']]) && $row['total'] > $studentThresholds[$row['categorie']]['limit']) {
            $alerts[] = [
                'type' => 'seuil_etudiant',
                'category' => $row['categorie'],
                'message' => sprintf($studentThresholds[$row['categorie']]['message'], round($row['total'])),
                'severity' => 'high'
            ];
        }
    }

    // 3. Opportunités étudiantes
    $studentOpportunities = [
        [
            'type' => 'bourse',
            'message' => "🎓 Bourse étudiants en difficulté disponible : 750 MAD par mois",
            'action_url' => "https://www.amci.ma"
        ]
    ];

    echo json_encode([
        "status" => "success",
        "alerts" => array_merge($alerts, $studentOpportunities),
        "generated_at" => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}