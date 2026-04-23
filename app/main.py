import sqlite3
from datetime import datetime, timedelta
from enum import StrEnum
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


SECRET_KEY = "secret_key_test"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


ITEM_LIST = {
    "Business Suit": {
        "id": 1,
        "cost": 100,
        "status": True,
        "breakable": False,
        "type": "clothing",
        "rarity": "common",
        "description": "Professional office attire",
    },
    "Designer Watch": {
        "id": 2,
        "cost": 110,
        "status": True,
        "breakable": False,
        "type": "accessory",
        "rarity": "rare",
        "description": "Luxury timepiece",
    },
    "Nice house": {
        "id": 3,
        "cost": 120,
        "status": True,
        "breakable": False,
        "type": "house",
        "rarity": "epic",
        "description": "Place to live",
    },
    "Toyota Highlander": {
        "id": 4,
        "cost": 130,
        "status": True,
        "breakable": True,
        "type": "car",
        "rarity": "legendary",
        "description": "Red go faster",
    },
    "Uniform": {
        "id": 4,
        "cost": 130,
        "status": True,
        "breakable": True,
        "type": "clothing",
        "rarity": "epic",
        "description": "Courier Uniform, yes",
    },
}
JOB_LIST: dict[str, dict[str, Any]] = {
    "office": {
        "depends": False,
        "reward": 500,
        "duration": 1,
        "Requirements": "clothing",
        "money_bonus": 0,
        "punish": None,
        "special": None,
    },
    "courier": {
        "depends": True,
        "reward": 500,
        "duration": 2,
        "requirements": "uniform",
        "money_bonus": 250,
        "punish": None,
        "special": "+250 reward if own car",
    },
    "lab_rat": {
        "depends": False,
        "reward": 500,
        "duration": 3,
        "requirements": None,
        "money_bonus": 0,
        "punish": None,
        "special": "Random mutation",
    },
    "stunt_driver": {
        "depends": False,
        "reward": 1500,
        "duration": 4,
        "requirements": "car",
        "money_bonus": 0,
        "punish": None,
        "special": "Car breaks after",
    },
    "drug_dealer": {
        "depends": False,
        "reward": 2000,
        "duration": 5,
        "requirements": None,
        "money_bonus": 0,
        "punish": True,
        "special": "8 year jail sentence",
    },
    "streamer": {
        "depends": True,
        "reward": 0,
        "duration": 6,
        "requirements": None,
        "money_bonus": 0,
        "punish": None,
        "special": "70%=$0, 29%=$1, 1%=$10k",
    },
    "bottle_collector": {
        "depends": False,
        "reward": 100,
        "duration": 7,
        "requirements": None,
        "money_bonus": 0,
        "punish": None,
        "special": "Always available",
    },
}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError as e:
        raise credentials_exception from e

    conn = sqlite3.connect("freezino.db")
    conn.row_factory = sqlite3.Row
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if user is None:
            raise credentials_exception

        return user
    finally:
        conn.close()


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class JobTypeEnum(StrEnum):
    office = "office"
    courier = "courier"
    lab_rat = "lab_rat"
    stunt_driver = "stunt_driver"
    drug_dealer = "drug_dealer"
    streamer = "streamer"
    bottle_collector = "bottle_collector"


class WorkStartRequest(BaseModel):
    job_type: JobTypeEnum


def init_db():
    conn = sqlite3.connect("freezino.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            balance REAL DEFAULT 0,
            avatar TEXT DEFAULT NULL,
            total_work_time INTEGER DEFAULT 0,
            total_earned INTEGER DEFAULT 0,
            total_lost INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS work_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            job_type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            duration INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            earned INTEGER DEFAULT 0,
            end_time TEXT NOT NULL,
            jailed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """
    )
    conn.commit()
    conn.close()


init_db()


@app.post("/api/auth/login")
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
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.post("/api/auth/register")
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
    except sqlite3.IntegrityError as e:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким username или email уже существует",
        ) from e
    except Exception as e:
        print(f"Registration Error: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.get("/api/health")
def health_status():
    return {"status": "IT'S ALIVE", "timestamp": datetime.now().isoformat()}


@app.get("/api/auth/me")
def read_users_me(current_user: Any = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user["id"],
            "username": current_user["username"],
            "email": current_user["email"],
            "balance": current_user["balance"],
            "avatar": current_user["avatar"],
        }
    }


@app.post("/api/work/start")
def start_work_session(work: WorkStartRequest, current_user: Any = Depends(get_current_user)):
    print(f"Пользователь {current_user['username']} хочет работать {work.job_type}")
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND jailed = 1 LIMIT 1",
            (current_user["id"],),
        )
        jail_check = cursor.fetchone()
        if jail_check:
            raise HTTPException(status_code=400, detail="Go back to jail cell!")
        time_now = datetime.utcnow()
        time_db = time_now.isoformat()
        end_time = 0
        job = work.job_type
        duration = JOB_LIST[job].get("duration")
        cursor.execute(
            "SELECT user_id FROM work_sessions WHERE user_id = ? AND completed = 0",
            (current_user["id"],),
        )
        rows = cursor.fetchone()

        if rows:
            raise HTTPException(status_code=400, detail="work session already in progress")
        else:
            cursor.execute(
                """
                    INSERT INTO work_sessions (
                        user_id,
                        job_type,
                        start_time,
                        duration,
                        completed,
                        earned,
                        end_time,
                        jailed
                    )

                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                (
                    current_user["id"],
                    work.job_type,
                    time_db,
                    duration,
                    0,
                    0,
                    0,
                    0,
                ),
            )
            conn.commit()
            new_session_id = cursor.lastrowid
        return {
            "success": True,
            "data": {
                "id": new_session_id,
                "job_type": work.job_type,
                "start_time": time_db,
                "duration": duration,
                "completed": 0,
                "jailed": 0,
            },
            "description": "Work session started",
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.get("/api/work/status")
def get_status(current_user: Any = Depends(get_current_user)):
    # print(current_user)
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0",
            (current_user["id"],),
        )
        # user_db = cursor.fetchone()
        # print(user_db)
        rows = cursor.fetchone()
        # print(rows)

        if rows is None:
            return {
                "success": True,
                "data": {"is_working": False, "time_remaining": 0, "session": 0},
                "message": "No work in progress found",
            }
        else:
            duration = rows["duration"]
            work_name = rows["job_type"]
            datePy = datetime.fromisoformat(rows["start_time"])
            timeCheck = datetime.utcnow() - datePy
            timeLeft = duration - timeCheck.total_seconds()
            message = f"Hey, work here is not done yet. Time left: {timeLeft} seconds"
            if timeLeft < 0:
                message = "Job done!"
                timeLeft = 0
            return {
                "data": {
                    "is_working": True,
                    "time_remaining": timeLeft,
                    "message": message,
                    "session": {
                        "id": current_user["id"],
                        "job_type": work_name,
                        "start_time": datePy,
                    },
                }
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.get("/api/work/history")
def get_history(limit: int = 20, offset: int = 0, current_user: Any = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
                SELECT *
                FROM work_sessions
                WHERE user_id = ?
                AND completed = 1
                ORDER BY end_time DESC
                LIMIT ? OFFSET ?
                """,
            (current_user["id"], limit, offset),
        )
        rows = cursor.fetchall()
        if rows is None:
            raise HTTPException(
                status_code=400, detail="Work sessions does not exist for history log"
            )
        else:
            cursor.execute(
                "SELECT COUNT(*) FROM work_sessions WHERE user_id = ? AND completed = 1",
                (current_user["id"],),
            )
            total = cursor.fetchone()[0]
            sessions = []
            for row in rows:
                sessions.append(
                    {
                        "id": row["id"],
                        "job_type": row["job_type"],
                        "duration": row["duration"],
                        "start_time": row["start_time"],
                        "end_time": row["end_time"],
                        "earned": row["earned"],
                        "completed": row["completed"],
                    }
                )
            # id_session = rows["id"]
            # work_name = rows["job_type"]
            # duration = rows["duration"]
            # start_time = datetime.fromisoformat(rows["start_time"])
            # end_time = rows["end_time"]
            # earned = rows["earned"]
            # completed = rows["completed"]
            return {
                "data": {
                    "sessions": sessions,
                    "total": total,
                }
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.post("/api/work/complete")
def complete_work(current_user: Any = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0 LIMIT 1",
            (current_user["id"],),
        )
        rows = cursor.fetchone()
        if rows is None:
            raise HTTPException(status_code=400, detail="no work session found")
        else:
            check = False
            bonus = 0
            message_bonus = None
            message_jail = None
            duration = rows["duration"]
            work_name = rows["job_type"]
            job_info = JOB_LIST[work_name]
            earned = job_info["reward"]
            date_py = datetime.fromisoformat(rows["start_time"])
            time_check = datetime.utcnow() - date_py
            time_left = duration - time_check.total_seconds()
            bonus_value = job_info.get("money_bonus", 0)
            end_time: int | datetime = 0

            if job_info.get("depends") and bonus_value > 0:
                message_bonus = "No bonus for you"
                bonus = job_info.get("money_bonus", 0)
                req_item = job_info["requirements"]
                message_bonus = f"You have an {req_item}, your bonus is {bonus} dollars"
            if time_left < 0:
                check = True
                time_left = 0
            if check:
                cursor.execute(
                    """
                        UPDATE users 
                        SET balance = balance + ? WHERE id = ?
                        """,
                    (
                        earned,
                        current_user["id"],
                    ),
                )
                conn.commit()
                cursor.execute(
                    """
                        UPDATE users 
                        SET total_work_time = total_work_time + ? WHERE id = ?
                        """,
                    (
                        duration,
                        current_user["id"],
                    ),
                )
                conn.commit()
                cursor.execute(
                    """
                       UPDATE work_sessions
                       SET completed = 1
                       WHERE user_id = ? AND completed = 0
                        """,
                    (current_user["id"],),
                )
                conn.commit()
                cursor.execute(
                    """
                       UPDATE work_sessions
                       SET earned = ?
                       WHERE user_id = ?
                        """,
                    (
                        earned,
                        current_user["id"],
                    ),
                )
                conn.commit()
                end_time = datetime.utcnow()
                cursor.execute(
                    """
                       UPDATE work_sessions
                       SET end_time = ?
                       WHERE user_id = ?
                        """,
                    (
                        end_time,
                        current_user["id"],
                    ),
                )
                conn.commit()
                total_earned = current_user["total_earned"] + earned
                cursor.execute(
                    """
                       UPDATE users
                       SET total_earned = total_earned + ? 
                       WHERE id = ?
                        """,
                    (
                        total_earned,
                        current_user["id"],
                    ),
                )
                conn.commit()
                new_balance = earned + current_user["balance"]
                if job_info.get("punish"):
                    cursor.execute(
                        """
                            UPDATE work_sessions SET jailed = 1 WHERE user_id = ? AND completed = 1
                            """,
                        (current_user["id"],),
                    )
                    message_jail = (
                        "You are going to Jail for 8 game-years, and cant start work anymore"
                    )

                conn.commit()
                return {
                    "success": True,
                    "data": {
                        "earned": earned,
                        "new_balance": new_balance + bonus,
                        "total_earned": total_earned + earned,
                        "end_time": end_time,
                        "bonus": bonus,
                    },
                    "message": "work session completed successfully",
                    "message_bonus": message_bonus,
                    "message_jail": message_jail,
                }
            else:
                return {
                    "success": True,
                    "message": f"Wait {time_left} seconds for your reward",
                }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.post("/api/work/cancel")
def cancel(current_user: Any = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0 LIMIT 1",
            (current_user["id"],),
        )
        rows = cursor.fetchone()
        if rows is None:
            raise HTTPException(status_code=400, detail="No work session found")
        else:
            cursor.execute(
                """
                    DELETE FROM work_sessions WHERE user_id = ? AND completed = 0
                    """,
                (current_user["id"],),
            )
            conn.commit()
            return {
                "success": True,
                "message": "work session cancelled successfully",
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.get("/api/work/jobs")
def get_work_jobs():
    return JOB_LIST


@app.post("/api/work/skip-jail")

def skip_jail(current_user: Any = Depends(get_current_user)):  #  Skip в работе
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 1 AND jailed = 1 ",
            (current_user["id"],),
        )
        jail_row = cursor.fetchone()
        if jail_row:
            cursor.execute(
                "UPDATE work_sessions SET jailed = 0 WHERE user_id = ? AND completed = 1",
                (current_user["id"],),
            )
            conn.commit()
            rows = cursor.rowcount
            if rows == 0:
                raise HTTPException(status_code=400, detail="No jail found")
            else:
                return {
                    "success": True,
                    "message_jail": "Jail skipped",
                }
        else:
            return {
                "success": True,
                "message_jail": "User is not jailed",
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}") from e
    finally:
        if "conn" in locals():
            conn.close()


@app.get("/api/user/profile")
def get_profile(current_user: Any = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
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


@app.get("/api/user/balance")
def get_balance(current_user: Any = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
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


@app.get("/api/user/stats")
def get_stats(current_user: Any = Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
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
