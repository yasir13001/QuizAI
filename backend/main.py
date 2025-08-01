from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.gemini_client import gre_question
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import traceback


app = FastAPI(title="GRE Quiz API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/question")
async def api_question(request: Request):
    try:
        category = request.query_params.get("category", "verbal")
        difficulty = request.query_params.get("difficulty", "easy")
        result = gre_question(category, difficulty)  # Remove 'await'
        return JSONResponse(content=result)
    except Exception as e:
        print("❌ ERROR in /api/question:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Get absolute path to ../frontend relative to main.py
frontend_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)

if not os.path.exists(frontend_path):
    raise RuntimeError(f"Frontend directory does not exist at: {frontend_path}")

print("Serving from:", frontend_path)
print("Files in frontend:", os.listdir(frontend_path))
# Serve the frontend
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")