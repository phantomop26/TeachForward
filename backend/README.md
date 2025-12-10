Minimal FastAPI backend for TeachForward (dev scaffold).

Run locally:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Change `DATABASE_URL` env var to use Postgres when ready.
