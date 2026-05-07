# app/routers/auth.py


from fastapi import APIRouter, Depends, HTTPException
import sqlite3



from app.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)
from app.models.user import UserRegister, UserLogin
#
router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/api/auth/login")
def login_user(user_data: UserLogin):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (user_data.email,))
        user_db = cursor.fetchone()

        if user_db is None:
            raise HTTPException(status_code=401, detail="Неверный логин или пароль")

        password_hash_from_db = user_db["password_hash"]

        if not verify_password(user_data.password, password_hash_from_db):
            raise HTTPException(status_code=401, detail="Неверный логин или пароль")

        return {
            "success": True,
            "data": {
                "user": {
                    "id": user_db["id"],
                    "username": user_db["username"],
                    "email": user_db["email"],
                    "balance": user_db["balance"],
                },
                "access_token": create_access_token(data={"sub": user_data.email}),
                "refresh_token": "fake2",
            },
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
    finally:
        if "conn" in locals():
            conn.close()


@router.post("/api/auth/register")
def register_user(user: UserRegister):
    hashed_password = get_password_hash(user.password)
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users (username, email, password_hash, balance)
            VALUES (?, ?, ?, ?)
            """,
            (user.username, user.email, hashed_password, 1000.0),
        )
        conn.commit()
        new_user_id = cursor.lastrowid

        return {
            "success": True,
            "data": {
                "user": {
                    "id": new_user_id,
                    "username": user.username,
                    "email": user.email,
                    "balance": 1000.0,
                },
                "access_token": create_access_token(data={"sub": user.email}),
                "refresh_token": "fake2",
            },
        }
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким username или email уже существует",
        )
    except Exception as e:
        print(f"Registration Error: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")
    finally:
        if "conn" in locals():
            conn.close()


@router.get("/api/health")
def health_status():
    return {"status": "IT'S ALIVE", "timestamp": datetime.now().isoformat()}


@router.get("/api/auth/me")
def read_users_me(current_user=Depends(get_current_user)):
    return {
        "user": {
            "id": current_user["id"],
            "username": current_user["username"],
            "email": current_user["email"],
            "balance": current_user["balance"],
            "avatar": current_user["avatar"],
        }
    }
