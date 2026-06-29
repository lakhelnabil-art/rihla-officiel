# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Frontend (5173) + API (3001) concurrently
npm run dev:client    # Vite only
npm run dev:server    # Express API only
npm run build         # Production frontend → dist/
npm run start:server  # Production API (serves dist/ when NODE_ENV=production)
docker compose up --build   # Full stack in container (port 3001)
```

No test suite or linter is configured.

## Architecture

**Rihla Platform** (mère) → **Agences** (tenants isolés) → modules métier + recherches.

| Couche | Rôle |
|--------|------|
| **Plateforme** | Login, liste agences, création avec modèle, super-admin PIN |
| **Agence** | ERP isolé (SQLite `agency_data` par `agency_id`) |
| **Modèles** | `vide`, `rihla-demo`, `bab-annaser` (référence Essaouira) |

Création agence : `POST /api/agencies` ou `/api/auth/register-agency` avec `templateId` + config (ville, adresse, ICE…).

**Rihla** — React SPA (Vite + Tailwind) + Express API (SQLite) for Moroccan travel agencies. UI in French.

### Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind, React Router |
| API | Express, better-sqlite3, JWT, bcryptjs, nodemailer (optional SMTP) |
| Dev proxy | `/api` → `http://localhost:3001` |
| Deploy | Docker multi-stage, `render.yaml` for Render.com |

### Auth flow

1. **Login / Register** (`src/pages/Auth/Login.jsx`) — email + password
2. **Platform** — list agencies the user belongs to
3. **Select agency** — `POST /api/auth/select-agency` → agency-scoped JWT
4. **App** — role (`admin` / `agent`) from server, not client PIN

Tokens stored in `localStorage` under `rihla_token`.

### Data persistence

Agency data lives in SQLite (`server/data/rihla.db`), table `agency_data` (key/value JSON per agency).

Frontend: `AgencyDataProvider` loads all keys via `GET /api/data`; `useLocalStorage` writes via debounced `PUT /api/data/:key`.

**Do not call `localStorage` for business data** — use `useLocalStorage` or `api` client.

Legacy browser data: `MigrationBanner` + `src/utils/migrateLocalStorage.js` import old prefixed keys via `POST /api/data/bulk`.

Reset/clear in Paramètres uses `api.bulkData(getAgencySeedPayload())` and `api.clearData()`.

### Key files

- `server/src/` — API routes (auth, agencies, data, platform, mail, users)
- `src/api/client.js` — fetch wrapper + JWT
- `src/context/AuthContext.jsx` — user, token, login/logout
- `src/context/AgencyDataContext.jsx` — synced agency data store
- `src/context/PlatformContext.jsx` — agency selection
- `src/utils/sampleData.js` — `STORAGE_KEYS`, demo seed, `getAgencySeedPayload`
- `src/utils/calendarSync.js` — reservations ↔ calendar events
- `src/components/MigrationBanner.jsx` — localStorage → API migration UI

### Roles

- `admin` — full access (finances, équipe, fournisseurs, paramètres)
- `agent` — limited sidebar (no admin-only routes)

Admin can create agent accounts: `POST /api/auth/users`. List: `GET /api/users`.

### Email (optional)

Configure SMTP in `server/.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).

- `GET /api/mail/status` — whether SMTP is configured
- `POST /api/mail/devis` — send devis email (falls back to mailto in UI if SMTP off)

### Brand (RIHLA)

Teal `#0E8C7F`, ink `#14161D`, amber `#F4A24C`, font Sora. Assets: `public/favicon.svg`, `public/rihla-mark.svg`.

### Recherche voyage (Phase 5)

Sidebar section **Recherches** : Vols, Hôtels, Transport, Activités, Croisières (`src/pages/Recherche/`).

- **Mode actuel** : recherche assistée (données locales + liens partenaires) — portée depuis `dev/rihla`
- **API stubs** : `POST /api/search/{flights,hotels,transport,cruises,activities}`, `GET /api/search/status`
- **Client** : `src/api/search.js`
- **Mode live** : configurer clés API dans `server/.env` (voir `.env.example`)

### Server config

Copy `server/.env.example` → `server/.env`. Set `JWT_SECRET` in production.

Production: `NODE_ENV=production` + built `dist/` → API serves static SPA from `STATIC_DIR` (default `../dist`).
