# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agent.langchain_agent import run_agent
from pydantic import BaseModel
import uvicorn
import os
from apscheduler.schedulers.background import BackgroundScheduler
from agent.tools import verifierDepassementBudget, get_balance_prediction, get_smart_actions
from fastapi import UploadFile, File
import shutil
import pytesseract
from PIL import Image
try:
    import json
except ImportError:
    pass

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class AgentRequest(BaseModel):
    user_id: int
    query: str

@app.post("/ask-agent")
async def ask_agent(data: AgentRequest):
    response = run_agent(data.query, data.user_id)
    print(f"Utilisateur ID au niveau de main : {data.user_id}")
    return {"response": response}

@app.get("/dashboard-data/{user_id}")
async def get_dashboard_data(user_id: int):
    """
    Returns consolidated data for Money Radar and Smart Actions.
    """
    try:
        # 1. Get Balance Predictions (Money Radar)
        prediction_json = get_balance_prediction(user_id)
        # Handle case where tool returns stringified JSON or error string
        if isinstance(prediction_json, str) and prediction_json.startswith("{"):
             prediction_data = json.loads(prediction_json)
        else:
             prediction_data = {"error": str(prediction_json)}

        # 2. Get Smart Actions
        actions_json = get_smart_actions(user_id)
        if isinstance(actions_json, str) and actions_json.startswith("["):
            actions_data = json.loads(actions_json)
        elif isinstance(actions_json, str) and actions_json == "[]":
            actions_data = []
        else:
            actions_data = [] # Fallback

        return {
            "money_radar": prediction_data,
            "smart_actions": actions_data
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
    """
    Uploads an image, runs OCR, and attempts to extract transaction details.
    Requires Tesseract installed on the server.
    """
    try:
        # 1. Save uploaded file temporarily
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Run OCR
        # Note: You might need to specify tesseract cmd path if not in PATH
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        try:
            text = pytesseract.image_to_string(Image.open(temp_file))
        except Exception as ocr_error:
            # Fallback for dev environment without Tesseract
            print(f"OCR Error (is Tesseract installed?): {ocr_error}")
            return {
                "success": True,
                "data": {
                    "montant": "0.00",
                    "categorie": "Autre",
                    "date": "2023-01-01",
                    "raw_text": "OCR Simulation (Tesseract not found)"
                }
            }

        # 3. Simple Regex/Heuristic Extraction (Mock implementation to be improved by LLM later)
        # For now, we just return the raw text and let the frontend or user decide, 
        # or use a regex for money.
        import re
        
        # Find amount: looks for numbers like 12.50 or 12,50
        amount_match = re.search(r'(\d+[.,]\d{2})', text)
        amount = amount_match.group(1).replace(',', '.') if amount_match else ""
        
        # Check for keywords for category
        category = "Autre"
        lower_text = text.lower()
        if "restaurant" in lower_text or "cafe" in lower_text or "mcdo" in lower_text:
            category = "Alimentation"
        elif "station" in lower_text or "uber" in lower_text:
            category = "Transport"
        elif "carrefour" in lower_text or "marjane" in lower_text:
             category = "Alimentation"

        # Find date
        date_match = re.search(r'(\d{2}[/-]\d{2}[/-]\d{4})', text)
        date = date_match.group(1) if date_match else ""

        # Cleanup
        os.remove(temp_file)

        return {
            "success": True,
            "data": {
                "montant": amount,
                "categorie": category,
                "date": date,
                "raw_text": text
            }
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

# === FONCTION DE VÉRIF PÉRIODIQUE ===
def check_budget_job():
    print("Exécution automatique de l'agent de vérification des budgets...")
    result = verifierDepassementBudget("start")
    print(result)

# === PLANIFICATION AUTOMATIQUE ===
scheduler = BackgroundScheduler()
scheduler.add_job(check_budget_job, 'interval', minutes=20)
scheduler.start()

# === ARRÊT DU SCHEDULER PROPREMENT ===
@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
