import os
import json
import re
from dotenv import load_dotenv
from google.generativeai import configure, GenerativeModel

# Load API key from `.env` located two levels above
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not found")

# Configure Gemini client
configure(api_key=API_KEY)
model = GenerativeModel("gemini-2.5-flash")


def gre_question(category="verbal"):
    re_format = '''Return only plain JSON, no markdown, no explanation:
    {
    "question": "What is the meaning of 'laconic'?",
    "options": ["Verbose", "Talkative", "Concise", "Elaborate"],
    "correct_answer": "Concise"
    }'''
    if category == "verbal":
        prompt = f"""Generate a GRE Verbal Reasoning question with 4-5 options and one correct answer.
        {re_format}"""
    elif category == "quant":
        prompt = f"""Generate a GRE Quantitative Reasoning math question with 4-5 options and one correct answer.
        {re_format}"""
    elif category == "analytical":
        prompt = f"""Generate a GRE Analytical Writing prompt. Format as JSON with one field 'question' only.
        {re_format}"""
    else:
        prompt = f"""Generate a general GRE question with multiple choice options. Format as JSON.
        {re_format}"""

    response = model.generate_content(prompt)
    raw_text = response.text

    try:
        match = re.search(r"{[\s\S]+}", raw_text)
        if not match:
            raise ValueError(f"Could not extract JSON from response:\n{raw_text}")
        json_str = match.group(0)
        return json.loads(json_str)
    except Exception:
        raise ValueError(f"Failed to parse Gemini response:\n{raw_text}")
