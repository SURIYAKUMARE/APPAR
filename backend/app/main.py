import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.config import settings
from app.database import engine, SessionLocal, Base
from app.seed_data import seed_database
from app.routes import (
    auth_routes,
    institution_routes,
    student_routes,
    validation_routes,
    sync_routes,
    verification_routes,
    analytics_routes,
    audit_routes,
    agent_routes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed initial national dataset
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    # APAAR ONE: National Student Data Management, Verification & Intelligence Platform
    **AICTE SIH 2026 - Problem Statement 26263**  
    *Regulation Bureau | Smart Automation Theme*  

    This enterprise platform provides centralized student lifecycle management, Luhn/Verhoeff-validated APAAR synchronization, cross-institution duplicate detection, intake compliance enforcement, scikit-learn anomaly scoring, offline-first sync engine, and student consent-governed credential verification.
    """,
    version=settings.AICTE_PORTAL_VERSION,
    lifespan=lifespan
)

# Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route modules
app.include_router(auth_routes.router)
app.include_router(institution_routes.router)
app.include_router(student_routes.router)
app.include_router(validation_routes.router)
app.include_router(sync_routes.router)
app.include_router(verification_routes.router)
app.include_router(analytics_routes.router)
app.include_router(audit_routes.router)
app.include_router(agent_routes.router)
app.include_router(agent_routes.simulation_router)

@app.get("/api/health", tags=["System Status"])
def health_check():
    return {
        "status": "HEALTHY",
        "platform": settings.PROJECT_NAME,
        "version": settings.AICTE_PORTAL_VERSION,
        "regulatory_bureau": "AICTE New Delhi",
        "demo_mode": settings.DEMO_MODE,
        "database": "CONNECTED",
        "validation_engine": "ACTIVE",
        "timestamp": "2026-10-30T23:25:00Z"
    }

# Check if production build of frontend exists to mount static files
current_dir = os.path.dirname(os.path.abspath(__file__))
dist_path = os.path.abspath(os.path.join(current_dir, "../../frontend/dist"))

if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Serve static file if exists (e.g. logo.svg, manifest.json, sw.js)
        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for SPA client-side routing
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/", tags=["System Status"])
    def root():
        return {
            "platform": "APAAR ONE National Educational Data Gateway",
            "documentation": "/docs",
            "api_prefix": "/api"
        }
