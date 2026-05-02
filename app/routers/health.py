# app/routers/health.py
from datetime import datetime
from fastapi import APIRouter

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("")
def health_status():
    return {"status": "IT'S + ALIVE", "timestamp": datetime.now().isoformat()}