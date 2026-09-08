# POLARIS AI — API-Connected Edition

This version keeps the original Bolt-built UI and adds a server-side data gateway.

## Architecture

```text
React/Vite dashboard
        │
        │ VITE_API_BASE_URL
        ▼
FastAPI POLARIS Data Gateway
        ├── USNIC Antarctic Icebergs
        ├── Copernicus Sentinel Hub
        ├── Copernicus Marine
        └── optional AIS/Vessel provider
```

## Windows quick start

### 1. Backend

Open a terminal in this project folder:

```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
py -m pip install -r requirements.txt
copy .env.example .env
uvicorn app:app --reload --port 8000
```

### 2. Frontend

Open a second terminal:

```powershell
npm install
copy .env.example .env
npm run dev
```

The frontend uses `http://localhost:8000` by default.

## Credentials

Do **not** paste credentials into the React frontend or commit them to GitHub.

- USNIC iceberg feed: public CSV, no credential required.
- Copernicus Data Space: create an OAuth client and put the client ID/secret in `backend/.env`.
- Copernicus Marine: put the account credentials in `backend/.env`.
- AIS: only configure a provider you are authorized to use; keep its key server-side.

## What is genuinely live vs fallback

The dashboard intentionally uses a mixed-data model. USNIC can be live without credentials. Copernicus and AIS become live only after their server-side credentials/provider endpoint are configured. Weather and NSIDC sea-ice remain labeled as fallback/next-adapter rather than being falsely presented as live.
