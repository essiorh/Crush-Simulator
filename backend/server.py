from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Crush Simulator API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for now (will add MongoDB later)
sessions = {}
crush_objects = [
    {
        "id": "can_aluminum",
        "name": "Aluminum Can",
        "type": "can",
        "difficulty": 1,
        "sound": "can_crush.mp3",
        "particles": "metal",
        "vibration_pattern": [100, 50, 200],
        "crush_time": 2.5,
        "satisfaction_score": 8
    },
    {
        "id": "cardboard_box",
        "name": "Cardboard Box",
        "type": "box",
        "difficulty": 2,
        "sound": "cardboard_crush.mp3",
        "particles": "paper",
        "vibration_pattern": [150, 100, 150, 100],
        "crush_time": 3.0,
        "satisfaction_score": 7
    },
    {
        "id": "phone_old",
        "name": "Old Phone",
        "type": "electronics",
        "difficulty": 3,
        "sound": "electronics_crush.mp3",
        "particles": "mixed",
        "vibration_pattern": [200, 150, 300, 100],
        "crush_time": 4.0,
        "satisfaction_score": 10
    },
    {
        "id": "glass_bottle",
        "name": "Glass Bottle",
        "type": "glass",
        "difficulty": 4,
        "sound": "glass_shatter.mp3",
        "particles": "glass",
        "vibration_pattern": [50, 200, 50, 200, 300],
        "crush_time": 1.8,
        "satisfaction_score": 9
    },
    {
        "id": "plastic_bottle",
        "name": "Plastic Bottle",
        "type": "plastic",
        "difficulty": 1,
        "sound": "plastic_crush.mp3",
        "particles": "plastic",
        "vibration_pattern": [80, 40, 120],
        "crush_time": 2.2,
        "satisfaction_score": 6
    }
]

# Models
class CrushSession(BaseModel):
    user_id: Optional[str] = None
    mode: str = "interactive"  # interactive, auto, mixed
    objects_crushed: List[str] = []
    total_satisfaction: int = 0
    session_duration: int = 0

class CrushAction(BaseModel):
    object_id: str
    force: float = 1.0
    position: dict = {"x": 0, "y": 0}

# API Routes
@app.get("/api/")
async def root():
    return {"message": "Crush Simulator API", "status": "running"}

@app.get("/api/objects")
async def get_crush_objects():
    """Get all available objects for crushing"""
    return {"objects": crush_objects}

@app.get("/api/objects/{object_id}")
async def get_object_details(object_id: str):
    """Get detailed information about a specific object"""
    obj = next((obj for obj in crush_objects if obj["id"] == object_id), None)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj

@app.post("/api/session/start")
async def start_session(session_data: CrushSession):
    """Start a new crush session"""
    session_id = str(uuid.uuid4())
    session_data.user_id = session_id
    sessions[session_id] = {
        **session_data.dict(),
        "created_at": datetime.now().isoformat(),
        "active": True
    }
    return {"session_id": session_id, "message": "Session started successfully"}

@app.post("/api/session/{session_id}/crush")
async def crush_object(session_id: str, crush_action: CrushAction):
    """Execute a crush action"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Find the object
    obj = next((obj for obj in crush_objects if obj["id"] == crush_action.object_id), None)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    
    # Update session
    session = sessions[session_id]
    session["objects_crushed"].append(crush_action.object_id)
    session["total_satisfaction"] += obj["satisfaction_score"]
    
    # Calculate crush result
    crush_result = {
        "object": obj,
        "success": True,
        "satisfaction_gained": obj["satisfaction_score"],
        "particles": obj["particles"],
        "sound": obj["sound"],
        "vibration": obj["vibration_pattern"],
        "animation_duration": obj["crush_time"],
        "force_applied": crush_action.force
    }
    
    return crush_result

@app.get("/api/session/{session_id}/stats")
async def get_session_stats(session_id: str):
    """Get statistics for a session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    return {
        "total_crushed": len(session["objects_crushed"]),
        "total_satisfaction": session["total_satisfaction"],
        "objects_crushed": session["objects_crushed"],
        "session_duration": session["session_duration"]
    }

@app.post("/api/session/{session_id}/end")
async def end_session(session_id: str):
    """End a crush session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions[session_id]["active"] = False
    sessions[session_id]["ended_at"] = datetime.now().isoformat()
    
    return {"message": "Session ended successfully", "stats": sessions[session_id]}

@app.get("/api/modes")
async def get_game_modes():
    """Get available game modes"""
    return {
        "modes": [
            {
                "id": "interactive",
                "name": "Interactive Mode",
                "description": "Tap to crush objects at your own pace",
                "icon": "👆"
            },
            {
                "id": "auto",
                "name": "Auto Mode", 
                "description": "Watch objects crush automatically in a relaxing sequence",
                "icon": "🔄"
            },
            {
                "id": "mixed",
                "name": "Mixed Mode",
                "description": "Combination of auto and interactive crushing",
                "icon": "🎭"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)