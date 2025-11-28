import sqlite3
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

app = FastAPI()

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


def init_db():
    conn = sqlite3.connect('freezino.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            balance REAL DEFAULT 0,
            avatar TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


init_db()



@app.post("/api/auth/register")
def register_user(user: UserRegister):
    password_to_save = user.password
    try:
        conn = sqlite3.connect('freezino.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, balance)
            VALUES (?, ?, ?, ?)
        """, (user.username, user.email, password_to_save, 1000.0))
        conn.commit()
        new_user_id = cursor.lastrowid
        response = {
            "success": True,
            "data": {
                "user": {
                    "id": new_user_id,
                    "username": user.username,
                    "email": user.email,
                    "balance": 1000.0,
                },
                "access_token": "fake1",
                "refresh_token": "fake2"
            }
        }
        return response
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Пользователь с таким username или email уже существует")
    finally:
        if 'conn' in locals():
            conn.close()


@app.get("/api/health")
def health_status():
    return {
        "status": "IT'S ALIVE",
        "timestamp": datetime.now().isoformat()
    }



# if __name__ == "__main__":
#     import uvicorn
#
#     # Запускаем сервер
#     uvicorn.run(app, host="0.0.0.0", port=3000)