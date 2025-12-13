"""
PRIMEX Clone Orchestrator Service
FastAPI backend for managing specialized AI clones via Ollama
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import ollama
import json
import os
from pathlib import Path

app = FastAPI(
    title="PRIMEX Clone Orchestrator",
    description="Multi-Agent AI Operations Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load configurations
CONFIG_DIR = Path(__file__).parent.parent / "config"
CLONES_DIR = CONFIG_DIR / "clones"

def load_loyalty_core():
    """Load loyalty core configuration"""
    loyalty_path = CONFIG_DIR / "loyalty-core.json"
    if loyalty_path.exists():
        with open(loyalty_path, 'r') as f:
            return json.load(f)
    return {}

def load_clone_configs():
    """Load all clone configurations"""
    clones = {}
    if CLONES_DIR.exists():
        for config_file in CLONES_DIR.glob("*.json"):
            with open(config_file, 'r') as f:
                clone_data = json.load(f)
                clones[clone_data['name'].lower()] = clone_data
    return clones

LOYALTY_CORE = load_loyalty_core()
CLONES = load_clone_configs()

# Request/Response Models
class Query(BaseModel):
    clone: str = Field(..., description="Clone name to invoke")
    message: str = Field(..., description="Message to send to the clone")
    context: Optional[str] = Field("", description="Additional context")
    temperature: Optional[float] = Field(None, description="Override temperature")
    stream: Optional[bool] = Field(False, description="Enable streaming response")

class MultiQuery(BaseModel):
    queries: List[Query] = Field(..., description="List of queries to execute")

class CloneResponse(BaseModel):
    clone: str
    role: str
    response: str
    model: str
    temperature: float

# Routes
@app.get("/")
async def root():
    """System status"""
    return {
        "status": "online",
        "service": "PRIMEX Clone Orchestrator",
        "owner": LOYALTY_CORE.get("owner", "Unknown"),
        "available_clones": len(CLONES),
        "clones": list(CLONES.keys())
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "primex-orchestrator"}

@app.get("/clones")
async def list_clones():
    """List all available clones with configurations"""
    return {
        "clones": CLONES,
        "loyalty_core": LOYALTY_CORE
    }

@app.get("/clone/{clone_name}")
async def get_clone(clone_name: str):
    """Get specific clone configuration"""
    clone_key = clone_name.lower()
    if clone_key not in CLONES:
        raise HTTPException(status_code=404, detail=f"Clone '{clone_name}' not found")
    return CLONES[clone_key]

@app.post("/invoke", response_model=CloneResponse)
async def invoke_clone(query: Query):
    """Invoke a specific clone with a message"""
    clone_key = query.clone.lower()
    
    if clone_key not in CLONES:
        raise HTTPException(status_code=404, detail=f"Clone '{query.clone}' not found")
    
    clone_config = CLONES[clone_key]
    model = clone_config['model']
    temperature = query.temperature if query.temperature is not None else clone_config['temperature']
    
    try:
        # Prepare the message with context
        full_message = query.message
        if query.context:
            full_message = f"Context: {query.context}\n\nQuery: {query.message}"
        
        # Call Ollama
        response = ollama.chat(
            model=model,
            messages=[
                {
                    'role': 'user',
                    'content': full_message
                }
            ],
            options={
                'temperature': temperature
            }
        )
        
        return CloneResponse(
            clone=clone_config['name'],
            role=clone_config['role'],
            response=response['message']['content'],
            model=model,
            temperature=temperature
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error invoking clone: {str(e)}")

@app.post("/invoke/multi")
async def invoke_multi_clones(multi_query: MultiQuery):
    """Invoke multiple clones in sequence"""
    results = []
    
    for query in multi_query.queries:
        try:
            result = await invoke_clone(query)
            results.append(result.dict())
        except HTTPException as e:
            results.append({
                "clone": query.clone,
                "error": e.detail,
                "status_code": e.status_code
            })
    
    return {"results": results}

@app.post("/verify-owner")
async def verify_owner(owner_name: str, security_key: str):
    """Verify owner credentials"""
    if (owner_name == LOYALTY_CORE.get("owner") and 
        security_key == LOYALTY_CORE.get("security_key")):
        return {
            "verified": True,
            "owner": owner_name,
            "access_level": "sovereign"
        }
    return {
        "verified": False,
        "access_level": "none"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
