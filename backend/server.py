"""FastAPI server for Blackjack game."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import os

from game_logic import BlackjackEngine
from models import GameState, Card, BetRequest, ActionResponse, Statistics

app = FastAPI(title="Blackjack API", version="1.0.0")

# Enable CORS for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active games
games: Dict[str, BlackjackEngine] = {}


def engine_to_game_state(engine: BlackjackEngine) -> GameState:
    """Convert engine state to GameState model."""
    dealer_visible_card = engine.dealer_hand[0] if engine.dealer_hand else None
    
    # Get betting advice
    units, advice_text = engine.get_betting_advice()
    betting_advice = f"{units} units (${units * 10}) - {advice_text}" if engine.game_state == "betting" else None
    
    # Get strategy advice
    strategy_advice = engine.get_basic_strategy() if engine.game_state == "playing" else None
    
    return GameState(
        game_id=engine.game_id,
        state=engine.game_state,
        player_hand=engine.player_hand,
        dealer_hand=engine.dealer_hand if engine.game_state in ["dealer", "finished"] else [dealer_visible_card] if dealer_visible_card else [],
        dealer_visible_card=dealer_visible_card,
        bankroll=engine.bankroll,
        current_bet=engine.current_bet,
        running_count=engine.running_count,
        true_count=engine.get_true_count(),
        cards_dealt=engine.cards_dealt,
        num_decks=engine.num_decks,
        message=engine.message,
        is_split=engine.is_split,
        split_hands=engine.split_hands if engine.is_split else None,
        active_split_hand=engine.active_split_hand,
        insurance_offered=engine.insurance_offered,
        insurance_bet=engine.insurance_bet,
        can_split=engine.can_split(),
        can_double=engine.can_double(),
        betting_advice=betting_advice,
        strategy_advice=strategy_advice,
    )


@app.get("/")
async def root():
    """API root."""
    return {"message": "Blackjack API", "version": "1.0.0"}


@app.post("/game/new")
async def new_game(num_decks: int = 6, starting_bankroll: int = 1000) -> ActionResponse:
    """Create a new game."""
    try:
        engine = BlackjackEngine(num_decks=num_decks, starting_bankroll=starting_bankroll)
        games[engine.game_id] = engine
        
        return ActionResponse(
            success=True,
            game_state=engine_to_game_state(engine)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/game/{game_id}/bet")
async def place_bet(game_id: str, bet: BetRequest) -> ActionResponse:
    """Place a bet."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.place_bet(bet.amount)
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/deal")
async def deal_cards(game_id: str) -> ActionResponse:
    """Deal initial cards."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.deal_initial_cards()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/hit")
async def hit(game_id: str) -> ActionResponse:
    """Player hits."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.hit()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/stand")
async def stand(game_id: str) -> ActionResponse:
    """Player stands."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.stand()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/double")
async def double_down(game_id: str) -> ActionResponse:
    """Player doubles down."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.double_down()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/split")
async def split(game_id: str) -> ActionResponse:
    """Player splits."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.split()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/insurance/take")
async def take_insurance(game_id: str) -> ActionResponse:
    """Take insurance."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.take_insurance()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/insurance/decline")
async def decline_insurance(game_id: str) -> ActionResponse:
    """Decline insurance."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.decline_insurance()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/new-hand")
async def new_hand(game_id: str) -> ActionResponse:
    """Start a new hand."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    success, message = engine.new_hand()
    
    if not success:
        return ActionResponse(success=False, game_state=engine_to_game_state(engine), error=message)
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.post("/game/{game_id}/new-shoe")
async def new_shoe(game_id: str) -> ActionResponse:
    """Shuffle a new shoe."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    engine = games[game_id]
    engine.initialize_deck()
    
    return ActionResponse(success=True, game_state=engine_to_game_state(engine))


@app.get("/game/{game_id}/state")
async def get_game_state(game_id: str) -> GameState:
    """Get current game state."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return engine_to_game_state(games[game_id])


@app.delete("/game/{game_id}")
async def delete_game(game_id: str):
    """Delete a game."""
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    del games[game_id]
    return {"message": "Game deleted"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
