# app/routers/user.py
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.db import get_connection
from app.security import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/profile")
def get_profile(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE id = ?",
            (current_user["id"],),
        )
        row = cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=400, detail="No user found")
        else:
            return {
                "id": current_user["id"],
                "username": current_user["username"],
                "email": current_user["email"],
                "balance": current_user["balance"],
                "avatar": current_user["avatar"],
                "total_work_time": current_user["total_work_time"],
                "created_at": current_user["created_at"],
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.get("/balance")
def get_balance(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE id = ?",
            (current_user["id"],),
        )
        row = cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=400, detail="No user found")
        else:
            return {
                "balance": current_user["balance"],
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@router.get("/stats")
def get_stats(current_user: Any = Depends(get_current_user)):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE id = ?",
            (current_user["id"],),
        )
        row = cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=400, detail="No user found")
        else:
            return {
                "total_work_time": current_user["total_work_time"],
                "total_earned": current_user["total_earned"],
                "total_lost": current_user["total_lost"],
                "games_played": current_user["games_played"],
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()