<?php
// api/setBudget.php

require_once('../config/auth.php');
require_once('../config/db.php');

header('Content-Type: application/json');

if (!isAuthorized()) {
    http_response_code(403);
    echo json_encode(["error" => "Accès refusé."]);
    exit;
}

$userId = $_POST['user_id'] ?? null;
$month = $_POST['month'] ?? null; // Format: 'YYYY-MM'
$budgets = $_POST['budgets'] ?? null; // Format: JSON string

if (!$userId || !$month || !$budgets) {
    http_response_code(400);
    echo json_encode(["error" => "Champs requis : user_id, month et budgets (JSON)."]);
    exit;
}

// Décodage des budgets
$budgetsArray = json_decode($budgets, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["error" => "Format JSON invalide pour les budgets."]);
    exit;
}

try {
    $db = getDBConnection();
    
    // Commencer une transaction
    $db->beginTransaction();

    // 1. Suppression des anciens budgets pour ce mois
    $stmtDelete = $db->prepare("
        DELETE FROM budgets 
        WHERE user_id = :user_id 
        AND month = :month
    ");
    $stmtDelete->execute([
        ':user_id' => $userId,
        ':month' => $month
    ]);

    // 2. Insertion des nouveaux budgets
    $stmtInsert = $db->prepare("
        INSERT INTO budgets (user_id, month, category, amount)
        VALUES (:user_id, :month, :category, :amount)
    ");

    foreach ($budgetsArray as $category => $amount) {
        $stmtInsert->execute([
            ':user_id' => $userId,
            ':month' => $month,
            ':category' => $category,
            ':amount' => $amount
        ]);
    }

    // Valider la transaction
    $db->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Budgets enregistrés avec succès",
        "month" => $month,
        "user_id" => $userId,
        "budgets" => $budgetsArray
    ]);

} catch (Exception $e) {
    // Annuler en cas d'erreur
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}