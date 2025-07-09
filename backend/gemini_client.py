import os
import json
from dotenv import load_dotenv
from google import genai
import re

# Load API key from `.env` located two levels above
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise EnvironmentError("GEMINI_API_KEY not found")

# Initialize Gemini client with your syntax
client = genai.Client(api_key=API_KEY)

async def gre_question(topic: str = "GRE Verbal Reasoning"):
    prompt = f"""
    Generate one GRE-style multiple-choice question for {topic}.

    Return only plain JSON, no markdown, no explanation:

    {{
    "question": "What is the meaning of 'laconic'?",
    "options": ["Verbose", "Talkative", "Concise", "Elaborate"],
    "correct_answer": "Concise"
    }}
    """

    from anyio.to_thread import run_sync

    def get_response():
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    raw_text = await run_sync(get_response)

    try:

        # Extract JSON block if wrapped in markdown or backticks
        match = re.search(r"{[\s\S]+}", raw_text)
        if not match:
            raise ValueError(f"Could not extract JSON from response:\n{raw_text}")

        json_str = match.group(0)
        return json.loads(json_str)

    except Exception as e:
        raise ValueError(f"Failed to parse Gemini response:\n{raw_text}") from e
