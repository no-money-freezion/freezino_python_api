# app/routers/stats.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/stats", tags=["stats"])
# Стабы для будущих фич, включая /api/casino/*