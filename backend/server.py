from fastapi import FastAPI, APIRouter, HTTPException, Response, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ====================
# Models
# ====================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    last_sync: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None

class UserStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    game_stats: Dict[str, Any] = Field(default_factory=dict)
    strategy_stats: Dict[str, Any] = Field(default_factory=dict)
    training_stats: Dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    hands: List[Dict[str, Any]] = Field(default_factory=list)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SyncData(BaseModel):
    game_stats: Optional[Dict[str, Any]] = None
    strategy_stats: Optional[Dict[str, Any]] = None
    training_stats: Optional[Dict[str, Any]] = None
    hands: Optional[List[Dict[str, Any]]] = None
    settings: Optional[Dict[str, Any]] = None

# ====================
# Auth Helper
# ====================

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    # Convert datetime strings to datetime objects
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    if isinstance(user_doc.get("last_sync"), str):
        user_doc["last_sync"] = datetime.fromisoformat(user_doc["last_sync"])
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ====================
# Status Routes
# ====================

@api_router.get("/")
async def root():
    return {"message": "Blackjack Trainer API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ====================
# Auth Routes
# ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id with Emergent auth
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                logger.error(f"Auth failed: {auth_response.status_code} - {auth_response.text}")
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            auth_data = auth_response.json()
        except httpx.RequestError as e:
            logger.error(f"Auth request error: {e}")
            raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    email = auth_data.get("email")
    name = auth_data.get("name", email.split("@")[0] if email else "User")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    if not email or not session_token:
        raise HTTPException(status_code=400, detail="Invalid auth response")
    
    # Find or create user
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info if needed
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "name": name,
                "picture": picture,
                "last_sync": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_sync": datetime.now(timezone.utc).isoformat(),
            "settings": {}
        }
        await db.users.insert_one(user_doc)
        
        # Initialize stats and history for new user
        await db.stats.insert_one({
            "user_id": user_id,
            "game_stats": {},
            "strategy_stats": {},
            "training_stats": {},
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        await db.history.insert_one({
            "user_id": user_id,
            "hands": [],
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Fetch user for response
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    if isinstance(user_doc.get("last_sync"), str):
        user_doc["last_sync"] = datetime.fromisoformat(user_doc["last_sync"])
    
    return {
        "user": User(**user_doc).model_dump(),
        "session_token": session_token
    }

@api_router.get("/auth/me")
async def get_current_user_route(request: Request):
    """Get current authenticated user"""
    user = await require_auth(request)
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# ====================
# Sync Routes
# ====================

@api_router.get("/sync/stats")
async def get_user_stats(request: Request):
    """Get user's synced stats"""
    user = await require_auth(request)
    
    stats_doc = await db.stats.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not stats_doc:
        return {
            "user_id": user.user_id,
            "game_stats": {},
            "strategy_stats": {},
            "training_stats": {},
            "updated_at": None
        }
    
    return stats_doc

@api_router.post("/sync/stats")
async def update_user_stats(request: Request, data: SyncData):
    """Update user's synced stats (merge strategy)"""
    user = await require_auth(request)
    
    # Get existing stats
    existing = await db.stats.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not existing:
        existing = {
            "user_id": user.user_id,
            "game_stats": {},
            "strategy_stats": {},
            "training_stats": {}
        }
    
    # Merge stats (take higher values for cumulative stats)
    def merge_stats(existing_stats: dict, new_stats: dict) -> dict:
        if not new_stats:
            return existing_stats
        merged = {**existing_stats}
        for key, value in new_stats.items():
            if key in merged:
                if isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                    merged[key] = max(merged[key], value)
                elif isinstance(value, dict) and isinstance(merged[key], dict):
                    merged[key] = merge_stats(merged[key], value)
                else:
                    merged[key] = value
            else:
                merged[key] = value
        return merged
    
    updated_stats = {
        "user_id": user.user_id,
        "game_stats": merge_stats(existing.get("game_stats", {}), data.game_stats or {}),
        "strategy_stats": merge_stats(existing.get("strategy_stats", {}), data.strategy_stats or {}),
        "training_stats": merge_stats(existing.get("training_stats", {}), data.training_stats or {}),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.stats.update_one(
        {"user_id": user.user_id},
        {"$set": updated_stats},
        upsert=True
    )
    
    # Update user last_sync
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"last_sync": datetime.now(timezone.utc).isoformat()}}
    )
    
    return updated_stats

@api_router.get("/sync/history")
async def get_user_history(request: Request):
    """Get user's hand history"""
    user = await require_auth(request)
    
    history_doc = await db.history.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    if not history_doc:
        return {
            "user_id": user.user_id,
            "hands": [],
            "updated_at": None
        }
    
    return history_doc

@api_router.post("/sync/history")
async def update_user_history(request: Request, data: SyncData):
    """Update user's hand history (merge and cap at 200)"""
    user = await require_auth(request)
    
    if not data.hands:
        raise HTTPException(status_code=400, detail="hands required")
    
    # Get existing history
    existing = await db.history.find_one(
        {"user_id": user.user_id},
        {"_id": 0}
    )
    
    existing_hands = existing.get("hands", []) if existing else []
    
    # Merge hands (newer first, dedupe by timestamp)
    all_hands = data.hands + existing_hands
    seen_timestamps = set()
    unique_hands = []
    for hand in all_hands:
        ts = hand.get("timestamp")
        if ts and ts not in seen_timestamps:
            seen_timestamps.add(ts)
            unique_hands.append(hand)
    
    # Sort by timestamp descending and cap at 200
    unique_hands.sort(key=lambda h: h.get("timestamp", 0), reverse=True)
    capped_hands = unique_hands[:200]
    
    updated_history = {
        "user_id": user.user_id,
        "hands": capped_hands,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.history.update_one(
        {"user_id": user.user_id},
        {"$set": updated_history},
        upsert=True
    )
    
    return updated_history

@api_router.get("/sync/settings")
async def get_user_settings(request: Request):
    """Get user's settings"""
    user = await require_auth(request)
    
    user_doc = await db.users.find_one(
        {"user_id": user.user_id},
        {"_id": 0, "settings": 1}
    )
    
    return {"settings": user_doc.get("settings", {}) if user_doc else {}}

@api_router.post("/sync/settings")
async def update_user_settings(request: Request):
    """Update user's settings"""
    user = await require_auth(request)
    body = await request.json()
    settings = body.get("settings", {})
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "settings": settings,
            "last_sync": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"settings": settings}

@api_router.post("/sync/full")
async def full_sync(request: Request, data: SyncData):
    """Full sync - upload and download all data"""
    user = await require_auth(request)
    
    # Update stats if provided
    if data.game_stats or data.strategy_stats or data.training_stats:
        existing_stats = await db.stats.find_one(
            {"user_id": user.user_id},
            {"_id": 0}
        ) or {"game_stats": {}, "strategy_stats": {}, "training_stats": {}}
        
        def merge_stats(existing: dict, new: dict) -> dict:
            if not new:
                return existing
            merged = {**existing}
            for key, value in new.items():
                if key in merged and isinstance(value, (int, float)) and isinstance(merged[key], (int, float)):
                    merged[key] = max(merged[key], value)
                elif key in merged and isinstance(value, dict) and isinstance(merged[key], dict):
                    merged[key] = merge_stats(merged[key], value)
                else:
                    merged[key] = value
            return merged
        
        await db.stats.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "game_stats": merge_stats(existing_stats.get("game_stats", {}), data.game_stats or {}),
                "strategy_stats": merge_stats(existing_stats.get("strategy_stats", {}), data.strategy_stats or {}),
                "training_stats": merge_stats(existing_stats.get("training_stats", {}), data.training_stats or {}),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    
    # Update history if provided
    if data.hands:
        existing_history = await db.history.find_one(
            {"user_id": user.user_id},
            {"_id": 0}
        )
        existing_hands = existing_history.get("hands", []) if existing_history else []
        
        all_hands = data.hands + existing_hands
        seen = set()
        unique = []
        for h in all_hands:
            ts = h.get("timestamp")
            if ts and ts not in seen:
                seen.add(ts)
                unique.append(h)
        unique.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
        
        await db.history.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "hands": unique[:200],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    
    # Update settings if provided
    if data.settings:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": {"settings": data.settings}}
        )
    
    # Update last_sync
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"last_sync": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Fetch and return all data
    stats = await db.stats.find_one({"user_id": user.user_id}, {"_id": 0})
    history = await db.history.find_one({"user_id": user.user_id}, {"_id": 0})
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    
    return {
        "stats": stats or {},
        "history": history or {},
        "settings": user_doc.get("settings", {}) if user_doc else {},
        "last_sync": user_doc.get("last_sync") if user_doc else None
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
