from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from gemini_client import gre_question

app = FastAPI(title="GRE Quiz API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/question")
async def api_question(topic: str = "GRE Verbal Reasoning"):
    try:
        return await gre_question(topic)
    except Exception as e:
        print("❌ ERROR in /api/question:", str(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Serve the frontend
app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")
