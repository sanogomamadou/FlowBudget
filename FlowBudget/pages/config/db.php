<?php
// config/db.php

function getDBConnection() {
    $host = 'localhost';
    $dbname = 'budget_ai';
    $username = 'root';
    $password = ''; // adapte selon ton serveur

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Erreur connexion DB: " . $e->getMessage()]);
        exit;
    }
}
