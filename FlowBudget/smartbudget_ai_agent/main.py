# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agent.langchain_agent import run_agent
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI()

# Autoriser le frontend PHP à accéder à l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod : restreindre
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentRequest(BaseModel):
    user_id: int
    query: str

@app.post("/ask-agent")
async def ask_agent(data: AgentRequest):
    print(f"📥 Received request from user_id: {data.user_id}")
    print(f"❓ Query: {data.query}")
    try:
        response = run_agent(data.query, data.user_id)
        print(f"✅ Response generated: {response[:50]}...")
        return {"response": response}
    except Exception as e:
        print(f"❌ Error in ask_agent: {str(e)}")
        return {"response": "Désolé, une erreur est survenue lors du traitement de votre demande."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
