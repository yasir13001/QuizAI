import os
import json
import re
from dotenv import load_dotenv
from google import genai

# Load API key from `.env` located one level above (QuizAI/.env)
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not found in .env file")

# Configure Gemini client
client = genai.Client(api_key=API_KEY)
model = "gemini-2.5-flash"


def gre_question(category="verbal", difficulty="easy"):
    """
    Generate a GRE question using Gemini based on category and difficulty.
    Returns a Python dictionary with the question and options.
    """

    # Prompt configuration
    system_prompt = (
        "You are an expert GRE question generator. "
        "Respond ONLY with plain JSON, without explanations, markdown, or formatting."
    )

    # Common response format
    example_response = """{
                        "question": "What is the meaning of 'laconic'?",
                        "options": ["Verbose", "Talkative", "Concise", "Elaborate"],
                        "correct_answer": "Concise"
                        }"""

    # Category instructions
    category_instructions = {
        "verbal": "Generate a GRE Verbal Reasoning question with exactly 4 options and one correct answer.",
        "quant": "Generate a GRE Quantitative Reasoning math question with exactly 4 options and one correct answer.",
        "analytical": "Generate a GRE Analytical Writing prompt. Format as JSON with one field 'question' only.",
    }

    # Fallback if category is unknown
    instruction = category_instructions.get(
        category,
        "Generate a general GRE-style multiple choice question with exactly 4 options and one correct answer.",
    )

    # Final prompt
    prompt = (
        f"{system_prompt}\n"
        f"Category: {category.capitalize()}\n"
        f"Difficulty: {difficulty.capitalize()}\n"
        f"{instruction}\n"
        f"Expected format:\n{example_response}"
    )

    # Call Gemini model
    response = client.models.generate_content(model=model, contents=prompt)
    raw_text = response.text

    # Extract JSON from response
    try:
        if not raw_text:
            raise ValueError("Empty response from model.")

        match = re.search(r"{[\s\S]+}", raw_text)
        if not match:
            raise ValueError(f"Could not extract JSON from response:\n{raw_text}")

        json_str = match.group(0)
        return json.loads(json_str)

    except Exception as e:
        raise ValueError(
            f"Failed to parse Gemini response:\n{raw_text}\nError: {str(e)}"
        )
