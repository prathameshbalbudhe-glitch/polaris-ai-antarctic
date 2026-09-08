# POLARIS AI — API Integration Map

The uploaded Bolt project is now structured as a React frontend + Python API gateway.

## Frontend files changed

- `src/App.tsx` — polls `/api/dashboard` every 5 minutes, merges live data, and shows LIVE / MIXED / SYNCING status.
- `src/lib/api.ts` — frontend API client.
- `src/data/mockData.ts` — existing demo data remains the safe fallback; live values can replace vessel and iceberg data without rewriting every page.
- `src/types/index.ts` — optional source/prediction metadata for iceberg contacts.
- `src/components/MapView.tsx` — map status no longer claims that live feeds are simulated.
- `src/pages/Pages.tsx` — wording updated so the UI distinguishes configured feeds from fallback data.

## Backend files added

- `backend/app.py` — FastAPI gateway and provider adapters.
- `backend/requirements.txt` — backend dependencies.
- `backend/.env.example` — secret/configuration template.
- `backend/README.md` — run and deployment instructions.

## Official data connections

1. **USNIC Antarctic Icebergs** — live CSV feed used by `/api/icebergs` and `/api/dashboard`.
2. **Copernicus Sentinel Hub / Data Space** — OAuth-backed Sentinel-1 catalog search through `/api/satellite`.
3. **Copernicus Marine** — current-vector adapter through `/api/ocean` and the dashboard aggregator.
4. **AIS/Vessel provider** — configurable server-side adapter through `/api/vessel`; no credentials are shipped to the browser.
5. **NSIDC** — the frontend source registry marks this as the next sea-ice adapter; the existing demo sea-ice values are not mislabeled as live.

## Important

Do not put client secrets, passwords, or AIS keys in the React `.env` file. They belong in `backend/.env` on the server.
