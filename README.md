# AgriGuide

A beginner-friendly, full-stack agricultural platform for Indian farmers.

**Current status: Phases 0–12 complete (demo release `1.0.0-demo`). Production-track workstreams are in progress: secure cookies, PostgreSQL-ready config and GitHub CI are prepared; 13 officially verified central/AP/Telangana scheme links are live; the community now has an Instagram-style photo diary with local video uploads; the NASA field advisor adds satellite-based soil moisture checks for saved field locations.**

Phases completed so far:
- **Phase 0:** folder structure, FastAPI backend, static frontend, configuration examples and `/api/health`.
- **Phase 1:** mobile-friendly shell, green theme, language picker for English/Telugu/Hindi/Tamil/Marathi, bottom navigation, large feature cards, demo voice helper, page routing, and clean sample data in `frontend/src/services/mockData.js`.
- **Phase 2:** live weather from Open-Meteo (no API key), GPS permission flow, manual place search, Telugu quick picks for Andhra Pradesh/Telangana, current conditions, hourly and 7-day forecasts, sunrise/sunset, warnings, cautious farm advice, 10-minute cache, demo fallback, and weather translations in all five languages.
- **Phase 3:** SQLite database via SQLAlchemy, optional farmer profile (state, district, crop, land size, soil, irrigation, interests) saved with `GET`/`PUT /api/profile/{id}`, and a dashboard that assembles a profile summary, local weather snapshot, alerts and advice, plus honest teaser cards for later modules.
- **Phase 4:** community questions and replies in SQLite, seven topic categories, report buttons, backend hide/restore moderation endpoints, clearly labelled demo seed posts, and community translations in all five languages.
- **Phase 5:** owner-submitted equipment rental with category and district filters, an owner listing form, direct farmer enquiries, owner reply/status management and admin moderation. Nothing is seeded: owners enter their own real details, rates and contact information. See `docs/EQUIPMENT_RENTAL.md`. Equipment text is translated in all five languages.
- **Phase 6:** eight clearly labelled sample produce listings with category and district filters, sample quantity and market hints, no invented mandi prices, and a buyer enquiry form that explains no real seller will be contacted. Marketplace text is translated in all five languages.
- **Phase 7:** six generic smart farming guidance topics (soil, water, crops, pests, records, weather) with translated explanations, plus five verified public YouTube videos on soil health, green manuring, soil health cards, pest management and irrigation. The field-note form was replaced at the farmer's request. All smart farming text is translated in all five languages.
- **Phase 8:** eight clearly labelled sample video cards with topic filters and a local save list. No video file, channel, link or invented external content is included; video text is translated in all five languages.
- **Phase 9:** seven generic scheme guidance topics (official sources, eligibility, documents, applying and help) that teach how to verify information through official channels, plus a personal question list. Scheme text is translated in all five languages. Verified official links were added in the post-release schemes workstream (see below); no benefit amounts or eligibility rules are ever stored.
- **Phase 10:** a demo voice assistant with twelve fixed commands for navigation, read-aloud and help. Speech is recognised by the device's own browser engine; a typing fallback covers browsers without speech recognition. There is no AI model, no free-form question endpoint and no invented answers. Assistant text is translated in all five languages.
- **Phase 11:** administrator sign-in with salted PBKDF2 password hashes and expiring session tokens. Reported and recent farmer content is shown in an admin queue; hiding/restoring community posts and replies now requires a valid admin token. Hidden-content reads also require a token. There is no default admin and no farmer login. Admin text is translated in all five languages.
- **Phase 12:** release hardening: security headers including Content Security Policy, narrower CORS, a `/health` probe alias with version info, administrator login rate limiting, a one-command release check, and a documented release checklist. This is a demo release, not a production deployment.

All feature pages are now implemented. The schemes page includes 13 verified official links, but there is still no eligibility checker or benefit calculator. The assistant accepts natural-language questions but needs a server-side AI key to answer them; without a key it honestly falls back to fixed commands. There is no farmer account system or role management beyond a single administrator level. Community questions/replies, saved videos, scheme questions and voice activity use plain text or a random browser ID, not a login. Equipment rental is different: owners and farmers each keep a private browser key (stored only as a hash on the server) so they can return to their own listings and enquiries. The community profile adds one locally stored photo or video per post; the display name is saved only in that browser. Smart Farming now shows five verified YouTube videos instead of a field-note form.

## Post-release workstreams

1. **Production foundation (in progress)** — HttpOnly admin cookies with double-submit CSRF, PostgreSQL driver and `DATABASE_URL` normalisation, `scripts/migrate.py`, GitHub Actions CI, Dockerfile and `docs/HOSTING.md`. The GitHub push is complete on `main`; hosting deploy still needs a platform and production secrets.
2. **Verified government schemes (done)** — central + Andhra Pradesh + Telangana official links, categorised and dated, in `docs/SCHEME_SOURCES.md`. No amounts, eligibility rules or application claims.
3. **Real AI voice assistant (provider-ready, waiting for key)** — natural spoken answers in all five languages via OpenAI-compatible or Gemini endpoints; the key stays in `backend/.env`. See `docs/AI_ASSISTANT.md`.
4. **Community social UI (done)** — Instagram-style profile with a three-column photo grid, lightbox and one photo/video per post. Files stay in `backend/uploads/` and are served from `/uploads`; see `docs/COMMUNITY_MEDIA.md`.
5. **Real-time farm data (partly done)** — five verified public YouTube videos are embedded in Smart Farming without an API key; a legitimate mandi price feed still needs an approved key and data source. See `docs/SMART_FARMING_VIDEOS.md`.
6. **Real equipment rental (done)** — owners add their own listings, farmers enquire directly, owners manage replies and administrators moderate listings. No demo listings, prices, contacts or renters are seeded. See `docs/EQUIPMENT_RENTAL.md`.
7. **NASA field advisor (done)** — farmers save field coordinates and read NASA POWER satellite-based surface/root-zone wetness, rainfall, temperature, humidity, wind and solar values, with clearly labelled app-level checks. It is not a soil test, field boundary map or crop recommendation, and it never invents values when NASA is unavailable. See `docs/NASA_FIELD_ADVISORY.md`.

Translation review is **pending**: `docs/TRANSLATION_REVIEW.md` is a generated sheet awaiting native-speaker approval.

See `docs/RELEASE.md`, `docs/HOSTING.md`, `docs/SCHEME_SOURCES.md`, `docs/AI_ASSISTANT.md`, `docs/COMMUNITY_MEDIA.md`, `docs/SMART_FARMING_VIDEOS.md`, `docs/EQUIPMENT_RENTAL.md` and `docs/NASA_FIELD_ADVISORY.md` for details, limits and source policy.

## Decisions made so far

- Frontend: plain HTML, CSS and JavaScript (ES modules, no build step)
- Backend: Python + FastAPI
- Database: SQLite now, designed so PostgreSQL can be used later
- First audience: Telugu speakers in Andhra Pradesh and Telangana
- Mock data lives in `frontend/src/services/mockData.js`
  (the `.ts` extension from the original request is not usable without TypeScript tooling)
- Crop Doctor is not part of the application

See `docs/DECISIONS.md` for details.

## Project structure

```
agri-guide/
├─ frontend/
│  ├─ index.html            # single app shell
│  ├─ css/                  # base, layout, components, pages
│  ├─ src/
│  │  ├─ app.js             # entry point
│  │  ├─ config.js          # public config only, no secrets
│  │  └─ services/
│  │     ├─ api.js          # backend calls
│  │     └─ mockData.js     # clean sample data (filled in Phase 1)
│  ├─ public/               # icons and local images
│  └─ .env.example          # public config documentation only
├─ backend/
│  ├─ app/
│  │  ├─ main.py            # FastAPI app entry point
│  │  ├─ config.py          # environment variables
│  │  ├─ routers/health.py  # /api/health endpoint
│  │  ├─ db/                # database code (Phase 1)
│  │  ├─ models/            # database tables (Phase 1)
│  │  ├─ schemas/           # validation (Phase 1)
│  │  ├─ services/          # weather, admin password/session auth
│  │  ├─ dependencies.py    # admin-token access control
│  │  └─ utils/             # helpers and logging
│  ├─ scripts/
│  │  ├─ create_admin.py    # creates the first administrator
│  │  └─ release_check.py   # tests + secret/removed-feature scan
│  ├─ tests/                # automated tests
│  ├─ requirements.txt
│  └─ .env.example          # placeholder secrets, never real keys
├─ docs/
├─ .gitignore
└─ README.md
```

## Prerequisites

- Python 3.10 or newer
- A terminal / command prompt

No Node.js or npm is needed for the plain-JavaScript frontend.

## How to run locally

Open a terminal inside `agri-guide/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open this address in your browser:

```
http://127.0.0.1:8000
```

You should see the AgriGuide home page with all feature cards. A discreet **Admin moderation** link is at the bottom of the home page.

You can also call the API directly:

```
http://127.0.0.1:8000/api/health
```

Expected response:

```json
{"status":"ok","service":"AgriGuide","mode":"development","version":"1.0.0-demo"}
```

Interactive API documentation is available at:

```
http://127.0.0.1:8000/docs
```

## How to run the tests

From `agri-guide/backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

All 73 tests should pass. They cover the API, database, community flow, local photo/video uploads, equipment, marketplace, smart farming topics and verified YouTube links, videos, schemes, verified official links, the keyless + AI assistant, NASA POWER field advisories, cookie/CSRF auth, admin access control and release hardening.

Re-check the stored official links before a release:

```powershell
.\.venv\Scripts\python.exe -m scripts.verify_scheme_links
```

For the complete pre-release check:

```powershell
.\.venv\Scripts\python.exe -m scripts.release_check
```

## Configuration

Secrets go in `backend/.env`, which is ignored by Git. Copy `backend/.env.example` to `backend/.env` and fill in values only when an integration is implemented. Never put API keys in frontend files.

`frontend/.env.example` documents public configuration only; the static frontend reads `frontend/src/config.js`, which contains no secrets.

### Create an administrator

There is no default admin account. From `agri-guide/backend`, run:

```powershell
.\.venv\Scripts\python.exe -m scripts.create_admin
```

Enter a username and a password of at least 12 characters. The password is stored only as a salted PBKDF2 hash. Then open `http://127.0.0.1:8000/#/admin` and sign in. Sessions expire after 8 hours. Deleting `agri_guide.db` removes all administrators, so create a new one after a database reset.

For non-interactive setup only, `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables can be used; do not put a real password in source files or the frontend.

## How frontend and backend communicate

The browser loads `index.html` from the FastAPI server. JavaScript in `src/app.js` calls `GET /api/health` using `fetch()`. The backend returns JSON, and the page displays it. In later phases every feature will follow this same pattern: browser → API → backend → database or external service → JSON back to browser.

## Version control

Git is installed and this folder is connected to
`https://github.com/thumikisaiprathima-cmyk/agri-guide.git` on the `main`
branch. Zip snapshots in `agri-guide/_checkpoints/` remain as extra local
rollbacks, but Git history is now the primary record.

## Phase roadmap

0. **Setup** — this phase
1. UI foundation + mock data
2. Weather and farm advice
3. Dashboard and personalisation
4. Community
5. Equipment rental
6. Marketplace
7. Smart farming
8. Educational videos
9. Government schemes
10. Voice assistant demo (browser speech only, no AI)
11. Administration and moderation — complete
12. Testing, hardening and release — complete
