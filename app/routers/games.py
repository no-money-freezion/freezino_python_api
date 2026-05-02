# app/routers/games.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/games", tags=["games"])
# Стабы для будущих фич