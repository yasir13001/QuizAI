from fastapi import FastAPI, HTTPException,  Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .gemini_client import gre_question
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import traceback
from typing import Dict,List
from datetime import datetime
from fastapi.responses import StreamingResponse
import io
import csv
import traceback 


user_history : Dict[str, List[dict]] = {}
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
    client_ip = request.client.host
    category = request.query_params.get("category", "verbal")

    if client_ip not in user_history:
        user_history[client_ip]= []

        question_data = await gre_question(category)
        question_data['timestamp']= datetime.utcnow().isoformat()
        question_data['category']= category
        question_data['user_answer'] = None
        user_history[client_ip].append(question_data)

        return JSONResponse(content=question_data)

    
@app.post("/api/answer")
async def api_submit_answer(request: Request):
    client_ip = request.client.host
    data = await request.json()
    answer = data.get("user_answer")
    question_text = data.get("question")
    # Find last unanswered question with the same text
    for q in reversed(user_history.get(client_ip, [])):
        if q.get("question") == question_text and q["user_answer"] is None:
            q["user_answer"] = answer
            break
    return {"status": "ok"}
    
@app.get("/api/history")
async def get_history(request: Request):
    client_ip = request.client.host
    return JSONResponse(content= user_history.get(client_ip, []))

@app.get("/api/analytics")
async def get_analytics(request: Request):
    client_ip = request.client.host
    history = user_history.get(client_ip,[])
    
    stats = {}
    for q in history:
        cat = q['category']
        if cat not in stats:
            stats[cat] = {"total": 0, "correct": 0}
            stats[cat]["total"] += 1
        if q["user_answer"] == q.get("correct_answer"):
            stats[cat]["correct"] += 1

        return JSONResponse(content= stats)
    
@app.get("/api/export")
async def export_result(request: Request):
    client_ip = request.client.host
    history = user_history.get(client_ip, [])

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Question", "category", "User answer", "correct answer", "timestamp"])

    for q in history:
     writer.writerow([
     q.get("question", " "),
     q.get("category", " "),
     q.get("user_answer", " "),
     q.get("correct_answer", " "),
     q.get("timestamp", " "),
         ])

        
    output.seek(0)
    return StreamingResponse(output, media_type= "text/csv",headers={"Content-Disposition": "attachment; filename=result.csv"})
    
    

# Get absolute path to ../frontend relative to main.py
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

if not os.path.exists(frontend_path):
    raise RuntimeError(f"Frontend directory does not exist at: {frontend_path}")

app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
