<?php
class Database {
    private $host = 'localhost';
    private $dbname = 'budget_ai';
    private $username = 'root';
    private $password = '';
    private $pdo;

    public function __construct() {
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            die("Erreur de connexion : " . $e->getMessage());
        }
    }

    public function getBalance($user_id) {
        $stmt = $this->pdo->prepare("
            SELECT SUM(CASE WHEN type = 'Revenu' THEN montant ELSE -montant END) as solde
            FROM transactions WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        return $stmt->fetchColumn() ?: 0;
    }

    public function getMonthlyBudget($user_id, $month = null) {
        $month = $month ?? date('Y-m');
        $stmt = $this->pdo->prepare("
            SELECT category, amount FROM budgets 
            WHERE user_id = ? AND month = ?
        ");
        $stmt->execute([$user_id, $month]);
        return $stmt->fetchAll();
    }
}
?>