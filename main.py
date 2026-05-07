# main.py
from fastapi import FastAPI
from app.db import init_db
from app.routers import auth, user, shop, stats, health
from app.routers import work, games, loans

app = FastAPI(title="Freezino API")

# Инициализация БД (временно; позже заменим на миграции)
init_db()

# Подключение роутеров
app.include_router(auth.router)
app.include_router(work.router)
app.include_router(user.router)
app.include_router(shop.router)
app.include_router(games.router)
app.include_router(loans.router)
app.include_router(stats.router)
app.include_router(health.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)