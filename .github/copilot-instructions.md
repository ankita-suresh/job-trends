### Quick orientation — what this repo is

- Backend: FastAPI app in `backend/` (entry: `backend/app.py`). Uses SQLAlchemy + PyMySQL to talk to a MySQL database. Tables are created at startup with `models.Base.metadata.create_all(bind=engine)` (no migrations configured).
- Frontend: Vite + React in `frontend/`. Main entry `frontend/src/main.jsx`, primary components in `frontend/src/components/` (Dashboard, JobList, JobForm, Analytics3d).

### Running locally (dev)

1. Backend (from the `backend/` folder):

```powershell
cd backend
python -m pip install -r requirements.txt
# then run the API server
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

2. Frontend (from the `frontend/` folder):

```powershell
cd frontend
npm install
npm run dev    # vite dev server (default: http://localhost:5173)
```

Notes: the frontend expects the API at `http://127.0.0.1:8000`. Some components use the `src/api.js` axios instance (baseURL set there), but other components currently call `http://127.0.0.1:8000` directly — prefer `src/api.js` for new work.

### Key files and patterns to reference

- `backend/db.py` — SQLAlchemy engine & `SessionLocal`. Currently contains hard-coded DB credentials (DB_USER, DB_PASS, DB_HOST, DB_NAME). The repository includes `python-dotenv` in requirements but the code does not call `load_dotenv()`; prefer env vars for changes.
- `backend/models.py` — SQLAlchemy models. Column names use PascalCase (e.g. `Job_ID`, `Job_Title`) and the table name is `jobs`. Keep this exact naming when returning rows consumed by the frontend.
- `backend/schemas.py` — Pydantic request/response models. `JobResponse` uses `orm_mode = True` so SQLAlchemy objects map to JSON fields directly.
- `backend/app.py` — FastAPI routes and aggregation helpers. Important endpoints:
  - GET `/jobs?skip={n}&limit={m}` — paginated fetch (frontend uses large limit for full-table fetches)
  - GET `/jobs/count` — total job count
  - POST `/jobs` — create job (accepts shape from `JobCreate`)
  - GET/PUT/DELETE `/jobs/{job_id}`
  - GET `/jobs/agg/location` and `/jobs/agg/industry` — aggregation endpoints that try multiple candidate column names (useful when CSV column names vary)
  - GET `/debug/job_columns` — introspect available columns and a sample row (handy during schema mismatch debugging)

### Data shapes and frontend expectations (concrete)

- Job objects returned by the API contain PascalCase keys: e.g. `Job_ID`, `Job_Title`, `Salary_USD`, `Experience_Level`, `Employment_Type`, `Work_Setting`, `Company_ID`, `Location_ID`, `Industry_ID`.
- The DataGrid in `frontend/src/components/JobList.jsx` uses `getRowId={row => row.Job_ID}` — do not change the primary key field name on the API without updating the grid and other callers.

### Project-specific gotchas & conventions

- No DB migrations: model changes rely on `create_all`. For production work, add Alembic rather than modifying models in place.
- Column naming uses PascalCase (not snake_case) and the code often searches for multiple possible column names in aggregation endpoints — if you add new import/normalization steps, map column names to the PascalCase used in `models.py`.
- Credentials are hard-coded in `db.py` — when creating changes, prefer reading credentials from environment variables (and add `.env` loading if required). If you change the approach, update the README/run notes and `requirements.txt` if you add new libs.
- CORS is permissive for local dev: `localhost:5173/5174` are allowed origins in `app.py`. Keep that in mind when changing ports.

### Debugging tips (fast)

- If frontend shows empty lists: confirm backend is running on `127.0.0.1:8000`, and `GET /jobs?skip=0&limit=100` returns an array.
- Schema mismatch: call `GET /debug/job_columns` to see DB column names and a sample row returned by the SQLAlchemy model — frontend code often expects specific keys.
- DB connection errors: check `backend/db.py` credentials and ensure a MySQL instance `job_trends` exists; the engine string uses `mysql+pymysql`.

### Where to update code (examples)

- To make API client usage consistent: update components to import and use `frontend/src/api.js` (axios) rather than hardcoded `fetch('http://127.0.0.1:8000')` calls.
- To make DB credentials configurable: update `backend/db.py` to read from `os.environ` (or call `dotenv.load_dotenv()`), and document required env vars in `README.md`.

### Minimal checklist for AI code changes

1. Check `backend/db.py` for DB credentials and whether tests/dev DB is available.
2. Confirm the API route and payload shape in `backend/schemas.py` before changing frontend code that consumes it.
3. When changing a model column name, update: `models.py`, `schemas.py` (if needed), `app.py` endpoints, and any frontend code that references the field (e.g., JobList columns).
4. Use `/debug/job_columns` and `/jobs/count` during development to validate dataset alignment.

If any of these sections are unclear or you want more detail (examples of env var handling, or a short PR that moves axios usage to `src/api.js` everywhere), tell me which part to expand and I will iterate.
