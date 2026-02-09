import sqlite3
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from enum import Enum

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


SECRET_KEY = "secret_key_test"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


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
    except JWTError:
        raise credentials_exception

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


class JobTypeEnum(str, Enum):
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
            duration INTEGER DEFAULT 10,
            completed INTEGER DEFAULT 0,
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
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
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


@app.get("/api/health")
def health_status():
    return {"status": "IT'S ALIVE", "timestamp": datetime.now().isoformat()}


@app.get("/api/auth/me")
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


@app.post("/api/work/start")
def start_work_session(work: WorkStartRequest, current_user=Depends(get_current_user)):
    print(f"Пользователь {current_user['username']} хочет работать {work.job_type}")
    print(current_user["id"])
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        time_now = datetime.utcnow()
        time_db = time_now.isoformat()
        duration = 10
        # print(time_db)
        cursor.execute(
            "SELECT user_id FROM work_sessions WHERE user_id = ? AND completed = 0",
            (current_user["id"],),
        )
        rows = cursor.fetchone()
        # print(rows)
        if rows:
            raise HTTPException(
                status_code=400, detail="work session already in progress"
            )
        else:
            cursor.execute(
                """
            INSERT INTO work_sessions (user_id, job_type, start_time, duration, completed)
            VALUES (?, ?, ?, ?, ?)
            """,
                (current_user["id"], work.job_type.value, time_db, duration, 0),
            )
            conn.commit()
            new_session_id = cursor.lastrowid
        return {
            "success": True,
            "data": {
                "id": new_session_id,
                "job_type": work.job_type.value,
                "start_time": time_db,
                "duration": duration,
                "completed": 0,
            },
            "description": "Work session started",
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}")
    finally:
        if "conn" in locals():
            conn.close()


@app.get("/api/work/status")
def get_status(current_user=Depends(get_current_user)):
    print(current_user)
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
                "message": f"No work in progress found",
            }
        else:
            duration = rows["duration"]
            work_name = rows["job_type"]
            datePy = datetime.fromisoformat(rows["start_time"])
            timeCheck = datetime.utcnow() - datePy
            timeLeft = duration - timeCheck.total_seconds()
            if timeLeft < 0:
                timeLeft = 0
            return {
                "data": {
                    "is_working": True,
                    "time_remaining": timeLeft,
                    "message": f"Hey, work here is not done yet. Time left: {timeLeft} seconds",
                    "session": {
                        "id": current_user["id"],
                        "job_type": work_name,
                        "start_time": datePy,
                    },
                }
            }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}")
    finally:
        if "conn" in locals():
            conn.close()


@app.post("/api/work/complete")
def complete_work(current_user=Depends(get_current_user)):
    try:
        conn = sqlite3.connect("freezino.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM work_sessions WHERE user_id = ? AND completed = 0 LIMIT 1",
            (current_user["id"],),
        )
        rows = cursor.fetchone()
        # print(rows["balance"])

        # new_balance = rows["balance"] + earned
        # print(rows)
        if rows is None:
            raise HTTPException(status_code=400, detail="no work session found")
        else:
            check = False
            earned = 500
            new_balance = current_user["balance"] + earned
            duration = rows["duration"]
            work_name = rows["job_type"]
            datePy = datetime.fromisoformat(rows["start_time"])
            timeCheck = datetime.utcnow() - datePy
            timeLeft = duration - timeCheck.total_seconds()
            if timeLeft < 0:
                check = True
                timeLeft = 0
            if check:
                cursor.execute(
                    """
                        UPDATE users
                        SET balance = ?
                        WHERE id = ?
                        """,
                    (
                        new_balance,
                        current_user["id"],
                    ),
                )
                cursor.execute(
                    """
                       UPDATE work_sessions
                       SET completed = 1
                       WHERE user_id = ? AND completed = 0
                        """,
                    (current_user["id"],),
                )
                conn.commit()
                return {
                    "success": True,
                    "data": {
                        "earned": earned,
                        "new_balance": new_balance,
                        "bonus": None,
                    },
                    "message": "work session completed successfully",
                }
            else:
                return {
                    "success": True,
                    "message": f"Wait {timeLeft} seconds for your reward",
                }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка сервера: {str(e)}")
    finally:
        if "conn" in locals():
            conn.close()
