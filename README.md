# Ambulance Configurator

A 3D configurator for building and pricing custom ambulances — pick a vehicle chassis,
choose an ambulance package (PTA / BLS / ALS), add and arrange medical equipment in a live
3D view, and get a real-time cost and payload-capacity breakdown. Includes a browser-based
admin panel for managing the catalog (vehicles, equipment, packages, certifications).

## Features

- **3D configurator** — visualize equipment placement inside the ambulance cabin (React
  Three Fiber / Three.js)
- **Vehicle + package matrix** — cabin dimensions, conversion cost, and default equipment
  bundles are specific to each (vehicle, ambulance type) combination, not a flat price
- **Live cost breakdown** — vehicle cost + conversion cost + any equipment added beyond
  the package defaults
- **Live payload/weight tracker** — tracks crew weight + mounted equipment weight against
  the vehicle's payload capacity, and warns/blocks before there isn't enough capacity left
  for a patient
- **Stock-aware equipment list** — each item shows real inventory count and blocks adding
  more than what's in stock or physically fits
- **Certifications shown per product** (CE, CDSCO, ISO 13485, etc.)
- **Admin panel** (`/admin`) — add vehicles, equipment, packages, and conversion specs
  directly from the browser instead of a command-line script
- **Save & share** a configuration via a shareable link

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Three Fiber + Drei, Three.js, Axios |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database | SQLite by default (auto-created), PostgreSQL supported via `DATABASE_URL` |
| Migrations | Alembic (schema) + one-off scripts in `backend/migrations/` (data/columns) |

## Prerequisites

- **Python 3.12+**
- **Node.js 18+** and npm
- Git

No database server is required to get started — the backend automatically falls back to
a local SQLite file (`backend/ambulance.db`) if it can't reach PostgreSQL, and seeds it
with sample catalog data on first run.

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/sanmithshetty5/ambulance-configurator.git
cd ambulance-configurator
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# activate the virtual environment
source .venv/bin/activate        # macOS/Linux
.venv\Scripts\activate           # Windows

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

On first run you'll see a console message confirming it's using SQLite
(`Falling back to SQLite local database (ambulance.db)`) — that's expected unless you've
set up PostgreSQL. The database is seeded automatically on startup only if it's empty, so
restarting the server won't duplicate or wipe your data.

### 3. Frontend setup

In a **separate terminal**, leaving the backend running:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Open the app

- **Configurator:** `http://localhost:5173`
- **Admin panel:** click the "⚙️ Admin" link in the header, or go to
  `http://localhost:5173/admin`
  - Login: `admin` / `1234`
  - ⚠️ These are hardcoded demo credentials for local/internal use only — do not deploy
    this as-is anywhere publicly reachable without adding real authentication.

## Configuration (optional)

By default the backend uses SQLite with no setup needed. To use PostgreSQL instead, set
the `DATABASE_URL` environment variable before starting the backend:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>"
```

If the connection fails for any reason, the backend automatically falls back to SQLite.

## Project structure

```
ambulance-configurator/
├── backend/
│   ├── main.py              # FastAPI app, route registration, startup seeding
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # DB connection (Postgres w/ SQLite fallback)
│   ├── manage_catalog.py    # CLI fallback for catalog data entry
│   ├── routers/             # vehicles, equipment, packages, configurations, conversions, admin
│   ├── migrations/          # one-off scripts for schema/data changes (e.g. stock_quantity)
│   ├── alembic/             # schema migration environment
│   └── ambulance.db         # local SQLite database (not committed)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/      # VehicleSelector, EquipmentPanel, Viewer3D, CostSummary,
│   │                         # PayloadSummary, AdminLogin, AdminDashboard, ...
│   └── package.json
└── database/
    └── seed.sql
```

## Catalog data entry

There are two ways to add/edit catalog data (vehicles, equipment, packages, conversion
specs):

1. **Admin panel (recommended)** — `http://localhost:5173/admin`, no command line needed.
2. **CLI script** — `python backend/manage_catalog.py`, an interactive fallback that does
   the same thing from the terminal.

## Known limitations

- Admin login is a hardcoded username/password with no hashing, expiry, or rate limiting —
  fine for local development, not production-ready.
- No automated test suite yet.
- `frontend/node_modules` should be reinstalled (`npm install`) fresh on whatever machine
  you're running on — some packages (esbuild, rollup) install platform-specific binaries,
  so a `node_modules` folder copied from Windows won't work as-is on macOS/Linux or vice
  versa.

## License

_Add your license here (e.g. MIT) — none specified yet._
