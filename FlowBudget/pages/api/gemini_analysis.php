<?php
header('Content-Type: application/json');

// Récupérer les données envoyées
$userId = $_POST['user_id'] ?? 1;
$promptName = $_POST['prompt'] ?? 'analyse des dépenses';

// Appeler le script Python avec les paramètres
$cmd = escapeshellcmd("python3 ../orchestrator/analyze_demand.py $userId \"$promptName\"");
exec($cmd . " 2>&1", $output, $resultCode);

if ($resultCode !== 0) {
    echo json_encode([
        "error" => "Erreur lors de l'appel Python",
        "code" => $resultCode,
        "raw" => $output
    ]);
    exit;
}

$response = implode("\n", $output);
echo json_encode([
    "success" => true,
    "response" => $response
]);
