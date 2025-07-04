import os, httpx, json
from dotenv import load_dotenv



# Step up TWO levels from backend/ to reach parent of QuizAI/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(dotenv_path=ENV_PATH)

API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    raise EnvironmentError("GEMINI_API_KEY not found in .env")

MODEL_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"


async def gre_question(topic: str = "GRE Verbal Reasoning"):
    prompt = f"""
Generate one GRE-style multiple-choice question for {topic}.
Return JSON like this:

{{
  "question": "What is the meaning of 'laconic'?",
  "options": ["Verbose", "Talkative", "Concise", "Elaborate"],
  "correct_answer": "Concise"
}}
"""
    body = {"contents": [{"parts": [{"text": prompt}]}]}

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(MODEL_URL, json=body)
        r.raise_for_status()
        txt = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        

    return json.loads(txt.strip("`\n "))
