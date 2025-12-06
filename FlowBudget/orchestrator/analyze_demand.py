
import sys
import google.generativeai as genai
from pathlib import Path
import os
from datetime import datetime

# === CONFIG ===
GEMINI_API_KEY = "ta-cle-api-gemini-ici"  # Remplace avec ta vraie clé
PROMPT_FILE = "assets/cot_prompts.md"
genai.configure(api_key=GEMINI_API_KEY)

def ask_gemini(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    return response.text.strip()

def get_prompt(prompt_name: str, user_id: int) -> str:
    if not os.path.exists(PROMPT_FILE):
        return "cot_prompts.md manquant."

    with open(PROMPT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
        sections = content.split("---")

        for section in sections:
            if prompt_name.lower() in section.lower():
                return section.replace("{user_id}", str(user_id)).strip()

    return "Prompt introuvable."

def main():
    if len(sys.argv) != 3:
        print("Erreur : arguments attendus => user_id prompt_name")
        return

    user_id = int(sys.argv[1])
    prompt_name = sys.argv[2]

    prompt = get_prompt(prompt_name, user_id)
    response = ask_gemini(prompt)

    print(response)

if __name__ == "__main__":
    main()
