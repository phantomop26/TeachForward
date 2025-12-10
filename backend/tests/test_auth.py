from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register_and_login_flow(tmp_path, monkeypatch):
    # Ensure a fresh sqlite file for tests
    db_file = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_file}")

    # Re-import app to pick up env? For simplicity, create user via API and then login
    payload = {"email": "tester@example.com", "password": "testpass123", "full_name": "Test User", "role": "student"}
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == "tester@example.com"

    login_payload = {"email": "tester@example.com", "password": "testpass123"}
    r2 = client.post("/auth/login", json=login_payload)
    assert r2.status_code == 200, r2.text
    tok = r2.json()
    assert "access_token" in tok
