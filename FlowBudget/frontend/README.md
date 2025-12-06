# 💸 FlowBudget - Gen Z Edition 🚀

Welcome to **FlowBudget**, the ultimate financial companion that doesn't bore you to death. We've ditched the spreadsheets for a vibe-checked, AI-powered experience.

## ✨ What's New (v2.1)

We've been busy giving this place a massive glow-up:

*   **🎨 Gen Z UI Overhaul:** Dark mode by default, neon accents (Acid Green & Electric Purple), glassmorphism cards, and smooth animations. It's a whole mood.
*   **🤖 AI Financial Bestie (v2.1):**
    *   A fully integrated AI chat interface (`/ai-advice`).
    *   **Smart Context:** Knows who you are and (soon) your spending habits.
    *   **Suggested Questions:** One-tap prompts like "Analyze my spending" or "How to save more?".
    *   **Robust Layout:** Rebuilt with absolute positioning to ensure the chat fits your screen perfectly (work in progress on specific viewports).
*   **🔐 Secure Auth:** PHP-powered Sign In and Sign Up pages with the new aesthetic.
*   **📊 Dashboard:** Visualized spending data with sleek charts and "MAD" currency formatting.

---

## 🛠️ Tech Stack

*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons.
*   **Backend (Core):** PHP (XAMPP/Apache), MySQL.
*   **Backend (AI):** Python 3.x, FastAPI, LangChain, Google Gemini API.

---

## 🚀 How to Start (The "Technique de Démarrage")

Follow these steps to get the full experience up and running.

### 1. 🗄️ Start the Database & Core Backend
*   Open **XAMPP Control Panel**.
*   Start **Apache** and **MySQL**.
*   Ensure your PHP files are served at `http://localhost/FlowBudget/`.

### 2. 🧠 Start the AI Brain (Python)
This powers the chat interface.
1.  Open a terminal.
2.  Navigate to the agent folder:
    ```bash
    cd c:\xampp\htdocs\FlowBudget\smartbudget_ai_agent
    ```
3.  Activate the virtual environment:
    ```bash
    .\venv\Scripts\activate
    ```
4.  Run the server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *You should see "Application startup complete".*

### 3. 🎨 Start the Frontend
1.  Open a new terminal.
2.  Navigate to the frontend folder:
    ```bash
    cd c:\xampp\htdocs\FlowBudget\frontend
    ```
3.  Run the development server (for editing):
    ```bash
    npm run dev
    ```
    *OR*
4.  Build for production (what we've been doing):
    ```bash
    npm run build
    ```
    *The build outputs to `dist/`, which is served by XAMPP.*

---

## 📂 Key File Structure

*   **`frontend/src/pages/AIAdvice.jsx`**: The brain of the chat interface. Handles messages, API calls, and the layout.
*   **`smartbudget_ai_agent/main.py`**: The FastAPI entry point.
*   **`smartbudget_ai_agent/agent/langchain_agent.py`**: Where the AI logic lives.
*   **`pages/api/getUser.php`**: Bridges the React frontend with the PHP session data.

---

## 🐛 Known Issues & Next Steps
*   **Chat Layout:** The input bar positioning is still acting "sus" on some screens. We're currently using `absolute inset-0` to force it, but further tweaking might be needed tomorrow.
*   **Data Connection:** Ensuring the AI has full access to the latest transaction data.

---

*Rest up! We continue the grind tomorrow. 🌙*
