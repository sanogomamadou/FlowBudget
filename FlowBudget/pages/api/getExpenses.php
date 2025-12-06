<?php
// api/getExpenses.php

require_once('../config/auth.php');
require_once('../config/db.php');

header('Content-Type: application/json');
error_log("[DEBUG] Headers reçus : " . print_r(getallheaders(), true)); // ← Log dans error_log

if (!isAuthorized()) {
    http_response_code(403);
    echo json_encode(["error" => "Accès refusé.","debug_headers" => getallheaders()]);
    exit;
}

$userId = $_POST['user_id'] ?? null;
$month = $_POST['month'] ?? null; // Format attendu : '2024-12'

if (!$userId || !$month) {
    http_response_code(400);
    echo json_encode(["error" => "Champs requis : user_id et month (format YYYY-MM)."]);
    exit;
}

try {
    $db = getDBConnection();

    // Requête : filtre les transactions de type 'Dépense' pour le mois spécifié
    $stmt = $db->prepare("
        SELECT categorie, montant 
        FROM transactions 
        WHERE user_id = :user_id 
          AND type = 'Dépense'
          AND DATE_FORMAT(date, '%Y-%m') = :month
    ");

    $stmt->execute([
        ':user_id' => $userId,
        ':month' => $month
    ]);

    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total = 0;
    $categories = [];

    foreach ($transactions as $t) {
        $cat = $t['categorie'];
        $montant = floatval($t['montant']);

        $categories[$cat] = ($categories[$cat] ?? 0) + $montant;
        $total += $montant;
    }

    echo json_encode([
        "status" => "success",
        "total" => $total,
        "categories" => $categories
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur : " . $e->getMessage()]);
}
