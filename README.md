# Tab — proxy attendance tracker for small squads

A ledger for tracking who marked attendance for who in a small group (2–4 people),
per semester. Built MERN-style: React (Vite) frontend, Express/MongoDB backend,
JWT + Google OAuth, proper MVC structure.

## How it works

- A squad of 2–4 people forms a **Group** via an invite code.
- Each group manages its own **Semesters** (created manually, e.g. "Sem 5").
- Logging a proxy ("I covered for B") creates a **ProxyEntry** — counts immediately,
  no confirmation step.
- Balances (net + raw give/receive counts) are **computed on read** from the
  ProxyEntry collection via a MongoDB aggregation pipeline — never stored as a
  separate counter, so they can never drift out of sync with the actual log.

## Project structure

```
proxy-tracker/
├── backend/                 Express + TypeScript, MVC
│   └── src/
│       ├── models/          User, Group, Semester, ProxyEntry (Mongoose)
│       ├── controllers/     Route handlers
│       ├── routes/          Express routers
│       ├── middleware/      JWT auth guard, group-membership guard, validation, errors
│       ├── services/        tokenService (JWT/refresh rotation), balanceService (aggregation)
│       └── config/          env, db connection, passport (Google strategy)
└── frontend/                React + Vite + TypeScript
    └── src/
        ├── pages/           Landing, Login, Signup, Onboarding, Dashboard, Ledger, Stats, Settings
        ├── components/      AppShell (nav), AddProxyModal, empty states, ui/ primitives
        ├── api/              axios client + per-resource functions
        ├── store/            zustand auth store
        └── hooks/            useActiveGroup, useAuthBootstrap
```

## Running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to a MongoDB Atlas connection string (or local mongod),
# and generate real JWT secrets, e.g. `openssl rand -hex 64`
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend
(see `vite.config.ts`).

### 3. Google OAuth (optional but recommended)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID (Web application).
3. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Authorized JavaScript origin: `http://localhost:5173`
5. Put the client ID/secret into `backend/.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

Without these set, the app still works fully with email/password auth — the Google
button will just fail gracefully if clicked.

## Auth design

- **Access token**: short-lived JWT (15 min default), sent as `Authorization: Bearer`,
  held in memory in the frontend (zustand store) — never localStorage, to limit XSS exposure.
- **Refresh token**: opaque random token, stored httpOnly + secure cookie, rotated on
  every use (old token invalidated, new one issued). The frontend transparently
  refreshes on a 401 via an axios interceptor — the user never sees a "session expired"
  unless the refresh token itself is gone/expired.
- **Google OAuth**: Passport's Google strategy creates/links a `User`, then issues the
  same JWT/refresh pair as email/password login, so the rest of the app doesn't need
  to know which method was used.

## Data model decisions worth knowing

- **No group required at signup.** Users can exist without a group and create/join
  one later from `/onboarding`. The dashboard shows an empty state if `activeGroup`
  is unset.
- **Semesters are manual.** You name and activate them yourself; there's no
  date-based auto-rollover. Only one semester per group is "active" at a time
  (enforced in the service layer, not a DB constraint, since switching active
  semester needs to flip the old one off atomically).
- **Proxy entries count immediately** — no confirmation step from the receiver.
  Deletion is restricted to the person who logged the entry, or a group admin,
  so people can't unilaterally erase favors done for others.
- **Balances are derived, not stored.** `balanceService.computeGroupBalances`
  aggregates the `ProxyEntry` collection on every dashboard load. This trades a
  bit of read performance (negligible at this scale — a few hundred entries per
  group per semester) for guaranteed consistency.

## Deployment

**Recommended split:**
- Frontend → [Vercel](https://vercel.com) (static build, fast global CDN)
- Backend → [Render](https://render.com) or [Railway](https://railway.app) (long-running Node process)
- Database → [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier is plenty to start)

### Backend (Render)
1. New Web Service → point at the `backend/` directory.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add all the env vars from `.env.example` (with real values — Atlas URI, strong
   JWT secrets, your deployed frontend URL as `CLIENT_URL`, Google OAuth creds with
   the **production** callback URL).

### Frontend (Vercel)
1. Import the `frontend/` directory as a new project.
2. Framework preset: Vite.
3. Set an environment-based API base URL if you don't want to rely on the dev proxy —
   for production, either deploy frontend+backend behind the same domain (recommended,
   avoids CORS/cookie complications with cross-site cookies) or configure `axios`'s
   `baseURL` to point at your Render backend URL and make sure CORS + cookie
   `sameSite`/`secure` settings in `backend/src/app.ts` and `authController.ts` match
   your actual domains.

### Cookie/CORS gotcha for cross-domain deploys
If frontend and backend end up on different domains (e.g. `tab.vercel.app` and
`tab-api.onrender.com`), the refresh-token cookie needs `sameSite: "none"` +
`secure: true` to survive cross-site requests, and CORS `origin` must exactly match
the frontend's deployed URL. The simplest way to dodge this entirely is to put both
behind one domain (e.g. backend at `tab.app/api/*` via a reverse proxy/rewrite rule).

## What's intentionally left for you to extend

- Push notifications / email digest when someone marks a proxy for you
- CSV export of the ledger
- Editing an entry (currently delete + re-add)
- Promote/demote admin roles from the Settings UI (model supports it; no endpoint yet)
- Rate limiting on auth routes before production traffic
