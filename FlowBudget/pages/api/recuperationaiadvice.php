<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1. Configuration
$apiKey = 'AIzaSyByGAWxHu-qP9NzN7oA3EtomyXnlzaHa9k'; // Remplacez par votre clé valide

// 2. Récupération de l'entrée utilisateur
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
$userMessage = '';

if ($contentType === "application/json") {
    $content = file_get_contents("php://input");
    $data = json_decode($content, true);
    $userMessage = $data['message'] ?? '';
} else {
    $userMessage = $_POST['message'] ?? '';
}

// Validation
if (empty($userMessage)) {
    http_response_code(400);
    echo json_encode(['error' => 'Le message ne peut pas être vide']);
    exit;
}

// 3. Construction de la requête Gemini
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;
// Après la récupération du message utilisateur ($userMessage)
$context = "Tu es un assistant financier expert en gestion de budget. 
Tu réponds à un utilisateur de l'application Smart Budget AI.
Si l'utilisateur te salue, salue le en retour et demande lui comment tu peux l'aider;
S'il te demande de l'aide ou des conseils,
Tes réponses doivent être concises, techniques mais accessibles, 
et toujours inclure un conseil pratique.
Si l'utilisateur te demande par rapport à d'autre sujets que les finances, rappelle lui que ton domaine est la gestion des finances. 

Voici la question de l'utilisateur :
";

// Construction du prompt final
$fullPrompt = $context . $userMessage . "\n\n(Contexte : l'utilisateur a accès à des outils d'analyse de dépenses dans l'appli)";

$requestData = [
    'contents' => [
        [
            'parts' => [
                ['text' => $fullPrompt]
            ]
        ]
    ],
    'safetySettings' => [
        [
            'category' => 'HARM_CATEGORY_DANGEROUS_CONTENT',
            'threshold' => 'BLOCK_ONLY_HIGH'
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.9,
        'topP' => 1,
        'topK' => 40,
        'maxOutputTokens' => 2048
    ]
];

// 4. Envoi de la requête
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($requestData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_FAILONERROR => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// 5. Gestion des erreurs
if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => "Erreur de connexion à l'API: " . $curlError]);
    exit;
}

$responseData = json_decode($response, true);

if ($httpCode !== 200) {
    $errorMsg = $responseData['error']['message'] ?? 'Erreur inconnue de l\'API';
    http_response_code($httpCode);
    echo json_encode(['error' => "Erreur $httpCode: " . $errorMsg]);
    exit;
}

// 6. Traitement de la réponse
if (empty($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    $blockReason = $responseData['promptFeedback']['blockReason'] ?? 'Réponse vide de l\'API';
    http_response_code(422);
    echo json_encode([
        'error' => 'Problème avec la réponse de l\'API',
        'reason' => $blockReason,
        'full_response' => $responseData // Debug seulement
    ]);
    exit;
}

// 7. Renvoi de la réponse formatée
$aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'];
echo json_encode([
    'success' => true,
    'response' => $aiResponse,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
