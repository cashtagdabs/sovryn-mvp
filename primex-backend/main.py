"""
PRIMEX Backend API - Simplified and Working
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import ollama
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PRIMEX API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "llama3.2:1b"
    conversation_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    model: str

class HealthResponse(BaseModel):
    status: str
    available_models: List[str]

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if PRIMEX backend is running and list available models"""
    try:
        models = ollama.list()
        model_names = [m['name'] for m in models.get('models', [])]
        return HealthResponse(
            status="online",
            available_models=model_names
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama not available: {str(e)}")

# Main chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process chat request through PRIMEX (Ollama)
    """
    try:
        # Build messages for Ollama
        messages = []
        
        # Add conversation history
        for msg in request.conversation_history:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Call Ollama
        response = ollama.chat(
            model=request.model,
            messages=messages
        )
        
        return ChatResponse(
            response=response['message']['content'],
            model=request.model
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

# Streaming endpoint (for future use)
@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint"""
    try:
        messages = [{"role": "user", "content": request.message}]
        
        async def generate():
            stream = ollama.chat(
                model=request.model,
                messages=messages,
                stream=True
            )
            for chunk in stream:
                yield chunk['message']['content']
        
        return generate()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in streaming: {str(e)}")

# List available models
@app.get("/models")
async def list_models():
    """List all available Ollama models"""
    try:
        models = ollama.list()
        return {"models": models.get('models', [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing models: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
