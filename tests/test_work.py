def test_work_start_complete(client, auth_headers):
    r = client.post("/api/work/start", json={"job_type": "office"}, headers=auth_headers)
    assert r.status_code == 200

    r = client.get("/api/work/status", headers=auth_headers)
    # проверить формат (fix: should be object or null, not 0) — покроет BE-010

    r = client.post("/api/work/complete", headers=auth_headers)
    assert r.status_code == 200
    # проверить, что total_earned обновился ровно на reward, а не 2*reward

def test_work_cancel(client, auth_headers):
    client.post("/api/work/start", json={"job_type": "office"}, headers=auth_headers)
    r = client.post("/api/work/cancel", headers=auth_headers)
    assert r.status_code == 200