<?php
// config/auth.php

function isAuthorized() {
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? '';

    // 1. Debug : Vérifiez ce qui est reçu
    error_log("Header reçu : " . $authHeader);

    // 2. Token attendu (identique à celui envoyé par cURL)
    $validToken = "ton-token-secret-ici"; // <- Retirez "Bearer " ici !

    // 3. Comparez seulement la partie token (après "Bearer ")
    return trim(str_replace('Bearer', '', $authHeader)) === $validToken;
}