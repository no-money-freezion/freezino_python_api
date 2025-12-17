import sqlite3
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@app.middleware("http")
async def jwt_auth_middleware(request: Request, call_next):
    public_paths = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/health",
        "/docs",  # Swagger UI
        "/openapi.json",
        "/redoc",
    ]
    if request.url.path in public_paths:
        return await call_next(request)
    response = await call_next(request)
    return response


@app.middleware("http")
async def global_exception_handler(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        print(f"ERROR at {request.url.path}: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "detail": "Internal Server Error (Something broke, check server logs)",
            },
        )


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
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duration INTEGER NOT NULL,
            completed BOOLEAN DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """
    )

    conn.commit()
    conn.close()


init_db()


@app.post("/api/auth/login")
def login_user(user_data: UserLogin):
    conn = sqlite3.connect("freezino.db")
    conn.row_factory = sqlite3.Row
    try:
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
    finally:
        conn.close()


@app.post("/api/auth/register")
def register_user(user: UserRegister):
    hashed_password = get_password_hash(user.password)
    conn = sqlite3.connect("freezino.db")
    conn.row_factory = sqlite3.Row
    try:
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
    finally:
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
