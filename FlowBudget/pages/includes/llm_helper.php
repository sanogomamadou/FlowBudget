<?php
require_once __DIR__.'/db.php';
require_once __DIR__.'/mailer.php';

class LLMAssistant {
    private $api_url;
    private $api_key;
    
    public function __construct() {
        $this->api_url = 'http://localhost:8000/chat';
        $this->api_key = '2vRP0AkZaDpvRHMN6lKyM21HTsYtomyu27RA2Mdalxk';
    }

    public function askFinancialAdvice($user_id, $message) {
        $context = $this->getFinancialContext($user_id);
        
        $data = [
            'user_id' => $user_id,
            'message' => $message,
            'context' => $context
        ];
        
        $response = $this->callAPI($data);
        
        if ($response['needs_action'] ?? false) {
            $this->handleAction($response, $user_id);
        }
        
        return $response['response'];
    }
    
    private function getFinancialContext($user_id) {
        // Implémentez la récupération des données financières
        return [
            'current_balance' => $this->getCurrentBalance($user_id),
            'monthly_budget' => $this->getMonthlyBudget($user_id)
        ];
    }
}
?>