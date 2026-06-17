import pytest
from fastapi.testclient import TestClient
from main import app as fastapi_app
import app.db
import sqlite3


@pytest.fixture
def client(tmp_path, monkeypatch):
    test_db = tmp_path / "test.db"

    # Создаём таблицы в тестовой БД
    with sqlite3.connect(test_db) as conn:
        app.db.run_migrations(conn)

    # Подменяем sqlite3.connect чтобы ВСЕ подключения шли в test_db
    original_connect = sqlite3.connect

    def test_connect(*args, **kwargs):
        conn = original_connect(test_db)
        conn.row_factory = sqlite3.Row
        return conn

    monkeypatch.setattr(sqlite3, "connect", test_connect)

    with TestClient(fastapi_app) as c:
        yield c


@pytest.fixture
def auth_headers(client):
    """Регистрирует пользователя и возвращает заголовки с токеном"""
    register_response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    })
    assert register_response.status_code in [200, 201], f"Register failed: {register_response.text}"

    login_response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "testpass123"
    })
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"

    token = login_response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}