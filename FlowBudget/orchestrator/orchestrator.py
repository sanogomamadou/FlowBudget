import requests
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, List
from datetime import datetime  

# Configuration de base
API_BASE_URL = "http://localhost/projetianosql/pages/api"
AUTH_TOKEN = "ton-token-secret-ici"
HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/x-www-form-urlencoded"
}

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('smartbudget_orchestrator.log'),
        logging.StreamHandler()
    ]
)

class SmartBudgetOrchestrator:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def call_endpoint(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Appel générique à un endpoint de l'API"""
        try:
            url = f"{API_BASE_URL}/{endpoint}"
            response = self.session.post(url, data=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Erreur sur {endpoint}: {str(e)}")
            return {"error": str(e)}

    def get_financial_overview(self, user_id: int) -> Dict[str, Any]:
        """Orchestre plusieurs appels pour un rapport complet"""
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Appels parallèles
            cashflow_future = executor.submit(
                self.call_endpoint, 
                "getCashflow.php", 
                {"user_id": user_id}
            )
            alerts_future = executor.submit(
                self.call_endpoint,
                "checkAlerts.php",
                {"user_id": user_id}
            )
            tips_future = executor.submit(
                self.call_endpoint,
                "getFinancialTips.php",
                {"user_id": user_id}
            )

            # Récupération des résultats
            cashflow = cashflow_future.result()
            alerts = alerts_future.result()
            tips = tips_future.result()

        # Construction du rapport synthétique
        return {
            "cashflow_status": cashflow.get("projection", {}).get("niveau_alerte"),
            "critical_alerts": [
                alert for alert in alerts.get("alerts", [])
                if alert.get("severity") == "critical"
            ],
            "top_tips": tips.get("tips", [])[:3],
            "generated_at": datetime.now().isoformat()
        }

    def optimize_budget(self, user_id: int, month: str) -> Dict[str, Any]:
        """Workflow d'optimisation du budget"""
        # 1. Analyse des dépenses
        analysis = self.call_endpoint(
            "analyzeSpendingHabits.php",
            {"user_id": user_id}
        )
        
        # 2. Simulation d'économies
        if "top_categories" in analysis:
            simulation = self.call_endpoint(
                "savingsSimulator.php",
                {
                    "user_id": user_id,
                    "reduce": {
                        category: 20  # 20% de réduction par défaut
                        for category in analysis["top_categories"].keys()
                    }
                }
            )
        
        # 3. Mise à jour du budget
            return self.call_endpoint(
                "setBudget.php",
                {
                    "user_id": user_id,
                    "month": month,
                    "budgets": {
                        category: amount * 0.8  # Réduction de 20%
                        for category, amount in analysis["top_categories"].items()
                    }
                }
            )
        return {"error": "Aucune donnée d'analyse disponible"}

# Exemple d'utilisation
if __name__ == "__main__":
    orchestrator = SmartBudgetOrchestrator()
    
    # Rapport financier complet
    user_report = orchestrator.get_financial_overview(user_id=1)
    logging.info(f"Rapport utilisateur : {user_report}")
    
    # Optimisation automatique
    budget_update = orchestrator.optimize_budget(user_id=1, month="2024-04")
    logging.info(f"Résultat optimisation : {budget_update}")