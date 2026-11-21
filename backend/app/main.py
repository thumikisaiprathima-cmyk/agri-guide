"""FastAPI application entry point.

The API routes are registered before the static frontend is mounted. That
order matters: FastAPI checks routes in order, so `/api/health` is handled by
our API and everything else is served by the frontend files.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import config
from app.db.connection import init_db
from app.routers import admin, assistant, community, equipment, health, marketplace, nasa, profile, schemes, smart_farming, videos, weather


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts. Creates tables if needed.
    init_db()
    yield


app = FastAPI(
    title="AgriGuide API",
    version=config.RELEASE_VERSION,
    description="Backend API for the AgriGuide agricultural platform.",
    lifespan=lifespan,
)

# CORS lets a frontend on a different address call this API during development.
# Only the methods and headers the app actually uses are allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in config.ALLOWED_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-CSRF-Token",
        "X-Owner-Key",
        "X-Farmer-Key",
    ],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    """Add small, boring headers that reduce common browser attacks."""
    response = await call_next(request)
    if config.MODE.strip().lower() != "production" and (
        request.url.path in {"/", "/index.html"}
        or request.url.path.startswith(("/src/", "/css/"))
    ):
        # No build step here: always load the current JS/CSS while developing.
        response.headers["Cache-Control"] = "no-store"
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "microphone=(self), geolocation=(self)")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob:; "
        "media-src 'self' blob:; "
        "connect-src 'self'; "
        "frame-src https://www.youtube-nocookie.com https://www.youtube.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "object-src 'none'",
    )
    return response


app.include_router(health.router, prefix=config.API_PREFIX)
# A second, undocumented alias is handy for hosting platform health probes.
app.include_router(health.router, include_in_schema=False)
app.include_router(weather.router, prefix=config.API_PREFIX)
app.include_router(profile.router, prefix=config.API_PREFIX)
app.include_router(community.router, prefix=config.API_PREFIX)
app.include_router(equipment.router, prefix=config.API_PREFIX)
app.include_router(marketplace.router, prefix=config.API_PREFIX)
app.include_router(smart_farming.router, prefix=config.API_PREFIX)
app.include_router(videos.router, prefix=config.API_PREFIX)
app.include_router(schemes.router, prefix=config.API_PREFIX)
app.include_router(assistant.router, prefix=config.API_PREFIX)
app.include_router(nasa.router, prefix=config.API_PREFIX)
app.include_router(admin.router, prefix=config.API_PREFIX)

# Local community media. This mount must come before the catch-all frontend
# mount below, otherwise the frontend would answer /uploads/... requests.
config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount(
    config.UPLOAD_URL_PREFIX,
    StaticFiles(directory=config.UPLOAD_DIR),
    name="uploads",
)

# Serve the plain HTML/CSS/JS frontend from the same server.
# `html=True` makes `/` return index.html automatically.
frontend_dir = config.BASE_DIR / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
