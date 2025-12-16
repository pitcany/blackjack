from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from pydantic_settings import BaseSettings

# --- Settings ---
class Settings(BaseSettings):
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300

settings = Settings()

# --- Database ---
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client.blackjack_trainer

# --- Auth Helpers ---
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Models ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    email: EmailStr
    hashed_password: str
    bankroll: float = 10000.0
    settings: dict = {}
    lesson_progress: dict = {}

class Token(BaseModel):
    access_token: str
    token_type: str

class GameSession(BaseModel):
    user_id: str
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    hands_played: int = 0
    mistakes: int = 0
    final_bankroll: float = 0

class HandEvent(BaseModel):
    player_cards: List[str]
    dealer_up_card: str
    player_action: str
    recommended_action: str
    is_correct: bool
    true_count: float
    running_count: int
    hand_result: Optional[str] = None  # win, loss, push
    bet_amount: float = 0
    payout: float = 0

class SessionStats(BaseModel):
    session_id: Optional[str] = None
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    hands_played: int = 0
    correct_plays: int = 0
    mistakes: int = 0
    starting_bankroll: float = 0
    ending_bankroll: float = 0
    net_profit: float = 0
    accuracy: float = 0.0
    hand_events: List[HandEvent] = []

# --- App ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependencies ---
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "Blackjack Trainer API"}

@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "hashed_password": hashed_password,
        "bankroll": 10000.0,
        "settings": {
            "decks": 6,
            "s17": True,
            "das": True,
            "difficulty": "soft"
        },
        "lesson_progress": {}
    }
    await db.users.insert_one(new_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    user_db = await db.users.find_one({"email": user.email})
    if not user_db or not verify_password(user.password, user_db["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_db["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "bankroll": current_user.get("bankroll", 10000),
        "lesson_progress": current_user.get("lesson_progress", {}),
        "settings": current_user.get("settings", {})
    }

@app.put("/api/settings")
async def update_settings(settings: dict, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"settings": settings}}
    )
    return {"status": "updated"}

@app.put("/api/progress")
async def update_progress(progress: dict, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"lesson_progress": progress}}
    )
    return {"status": "updated"}

@app.post("/api/sessions/save")
async def save_session(session_data: dict, current_user: dict = Depends(get_current_user)):
    # Save session results
    # Update bankroll
    bankroll_end = session_data.get("bankroll_end")
    if bankroll_end is not None:
        await db.users.update_one(
            {"email": current_user["email"]},
            {"$set": {"bankroll": bankroll_end}}
        )

    # Save session record
    session_record = {
        "user_id": str(current_user["_id"]),
        "timestamp": datetime.utcnow(),
        **session_data
    }
    await db.sessions.insert_one(session_record)
    return {"status": "saved"}

# --- Phase 4: Hand Event Logging & Review ---

@app.post("/api/sessions/start")
async def start_session(current_user: dict = Depends(get_current_user)):
    """Start a new game session"""
    session = {
        "user_id": str(current_user["_id"]),
        "start_time": datetime.utcnow(),
        "starting_bankroll": current_user.get("bankroll", 10000),
        "hands_played": 0,
        "correct_plays": 0,
        "mistakes": 0,
        "hand_events": [],
        "status": "active"
    }
    result = await db.game_sessions.insert_one(session)
    return {"session_id": str(result.inserted_id), "status": "started"}

@app.post("/api/sessions/{session_id}/hand")
async def log_hand_event(session_id: str, event: HandEvent, current_user: dict = Depends(get_current_user)):
    """Log a hand event (player action) to the session"""
    from bson import ObjectId

    event_dict = event.dict()
    event_dict["timestamp"] = datetime.utcnow()

    # Update session with new hand event and stats
    update_fields = {
        "$push": {"hand_events": event_dict},
        "$inc": {
            "hands_played": 1 if event.hand_result else 0,  # Only count completed hands
            "correct_plays": 1 if event.is_correct else 0,
            "mistakes": 0 if event.is_correct else 1
        }
    }

    await db.game_sessions.update_one(
        {"_id": ObjectId(session_id), "user_id": str(current_user["_id"])},
        update_fields
    )
    return {"status": "logged"}

class EndSessionRequest(BaseModel):
    ending_bankroll: float

@app.post("/api/sessions/{session_id}/end")
async def end_session(session_id: str, request: EndSessionRequest, current_user: dict = Depends(get_current_user)):
    """End a game session and calculate final stats"""
    from bson import ObjectId
    ending_bankroll = request.ending_bankroll

    session = await db.game_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": str(current_user["_id"])
    })

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    starting_bankroll = session.get("starting_bankroll", 10000)
    net_profit = ending_bankroll - starting_bankroll
    correct = session.get("correct_plays", 0)
    total_decisions = correct + session.get("mistakes", 0)
    accuracy = (correct / total_decisions * 100) if total_decisions > 0 else 0

    await db.game_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {
            "end_time": datetime.utcnow(),
            "ending_bankroll": ending_bankroll,
            "net_profit": net_profit,
            "accuracy": accuracy,
            "status": "completed"
        }}
    )

    # Update user's bankroll
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"bankroll": ending_bankroll}}
    )

    return {
        "status": "ended",
        "net_profit": net_profit,
        "accuracy": accuracy,
        "hands_played": session.get("hands_played", 0)
    }

@app.get("/api/sessions/history")
async def get_session_history(limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get user's session history"""
    from bson import ObjectId

    sessions = await db.game_sessions.find(
        {"user_id": str(current_user["_id"]), "status": "completed"}
    ).sort("end_time", -1).limit(limit).to_list(length=limit)

    # Convert ObjectIds to strings
    for s in sessions:
        s["_id"] = str(s["_id"])
        # Don't include full hand_events in list view for performance
        s["event_count"] = len(s.get("hand_events", []))
        s.pop("hand_events", None)

    return {"sessions": sessions}

@app.get("/api/sessions/{session_id}")
async def get_session_detail(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed session info including all hand events"""
    from bson import ObjectId

    session = await db.game_sessions.find_one({
        "_id": ObjectId(session_id),
        "user_id": str(current_user["_id"])
    })

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["_id"] = str(session["_id"])
    return session

@app.get("/api/stats/mistakes")
async def get_common_mistakes(limit: int = 10, current_user: dict = Depends(get_current_user)):
    """Get user's most common mistakes"""
    # Aggregate mistakes across all sessions
    pipeline = [
        {"$match": {"user_id": str(current_user["_id"])}},
        {"$unwind": "$hand_events"},
        {"$match": {"hand_events.is_correct": False}},
        {"$group": {
            "_id": {
                "player_cards": "$hand_events.player_cards",
                "dealer_up": "$hand_events.dealer_up_card",
                "action": "$hand_events.player_action",
                "recommended": "$hand_events.recommended_action"
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]

    mistakes = await db.game_sessions.aggregate(pipeline).to_list(length=limit)
    return {"mistakes": mistakes}

@app.get("/api/stats/overview")
async def get_stats_overview(current_user: dict = Depends(get_current_user)):
    """Get overall statistics for the user"""
    pipeline = [
        {"$match": {"user_id": str(current_user["_id"]), "status": "completed"}},
        {"$group": {
            "_id": None,
            "total_sessions": {"$sum": 1},
            "total_hands": {"$sum": "$hands_played"},
            "total_correct": {"$sum": "$correct_plays"},
            "total_mistakes": {"$sum": "$mistakes"},
            "total_profit": {"$sum": "$net_profit"},
            "avg_accuracy": {"$avg": "$accuracy"}
        }}
    ]

    result = await db.game_sessions.aggregate(pipeline).to_list(length=1)

    if not result:
        return {
            "total_sessions": 0,
            "total_hands": 0,
            "total_correct": 0,
            "total_mistakes": 0,
            "total_profit": 0,
            "avg_accuracy": 0,
            "overall_accuracy": 0
        }

    stats = result[0]
    stats.pop("_id", None)

    # Calculate overall accuracy
    total_decisions = stats.get("total_correct", 0) + stats.get("total_mistakes", 0)
    stats["overall_accuracy"] = (stats.get("total_correct", 0) / total_decisions * 100) if total_decisions > 0 else 0

    return stats
