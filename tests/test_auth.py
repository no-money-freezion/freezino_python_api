def test_register_and_login(client):

    r = client.post("/api/auth/register", json={
        "username": "alice", "email": "a@test.com", "password": "pw"
    })
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    assert r.status_code == 200
    assert r.json()["data"]["user"]["username"] == "alice"

    r = client.post("/api/auth/login", json={"email": "a@test.com", "password": "pw"})
    token = r.json()["data"]["access_token"]
    assert token

    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200

def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "username": "bob", "email": "b@test.com", "password": "pw"
    })
    r = client.post("/api/auth/login", json={"email": "b@test.com", "password": "WRONG"})
    assert r.status_code == 401

def test_duplicate_email(client):
    client.post("/api/auth/register", json={
        "username": "c1", "email": "c@test.com", "password": "pw"
    })
    r = client.post("/api/auth/register", json={
        "username": "c2", "email": "c@test.com", "password": "pw"
    })
    assert r.status_code == 400