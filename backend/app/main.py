"""WebOS Backend - FastAPI Application."""
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings
from .deps import connect_to_database, close_database_connection, get_database
from .logging_config import info_emoji, error_emoji, logger
from .auth.routes import router as auth_router
from .auth.service import hash_password, decode_token
from .files.routes import router as files_router
from .desktop.routes import router as desktop_router
from .vproc.routes import router as vproc_router
from .hproc.routes import router as hproc_router
from .ws.manager import manager
from .ws.topics import ALL_TOPICS

# Application start time for uptime tracking
_app_start_time: datetime | None = None


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Middleware to add request timing instrumentation."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
        
        # Add timing header
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        
        # Log slow requests (>500ms)
        if process_time > 500:
            logger.warning(f"⚠️ Slow request: {request.method} {request.url.path} took {process_time:.2f}ms")
        
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    global _app_start_time
    _app_start_time = datetime.now(timezone.utc)
    
    # Startup
    db_connected = False
    try:
        await connect_to_database()
        db_connected = True
        await ensure_admin_user()
    except Exception as e:
        error_emoji("❌", f"Failed to connect to database: {e}")
        error_emoji("⚠️", "Server starting without database connection. Some features may be unavailable.")
    
    await manager.start_metrics_broadcast()
    info_emoji("🟢", f"Server started: http://0.0.0.0:8888")
    
    yield
    
    # Shutdown
    await manager.stop_metrics_broadcast()
    if db_connected:
        await close_database_connection()


async def ensure_admin_user():
    """Ensure admin user exists on startup."""
    db = get_database()
    
    admin = await db.users.find_one({"username": settings.ADMIN_USER})
    
    if admin is None:
        admin_doc = {
            "username": settings.ADMIN_USER,
            "password_hash": hash_password(settings.ADMIN_PASS),
            "roles": ["admin"],
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(admin_doc)
        info_emoji("👤", f"Admin ensured: username={settings.ADMIN_USER}")
    else:
        # Ensure admin has admin role
        if "admin" not in admin.get("roles", []):
            await db.users.update_one(
                {"_id": admin["_id"]},
                {"$addToSet": {"roles": "admin"}}
            )
            info_emoji("👤", f"Admin role ensured: username={settings.ADMIN_USER}")


# Create FastAPI app
app = FastAPI(
    title="WebOS API",
    description="Web-based Operating System with Process Monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.CORS_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request timing middleware
app.add_middleware(RequestTimingMiddleware)

# Exception handler for database connection errors
@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    """Handle RuntimeError exceptions, particularly database connection issues."""
    error_message = str(exc)
    if "Database not connected" in error_message:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": "Database service is unavailable. Please try again later."}
        )
    # Re-raise other RuntimeErrors
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


# Include routers
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(desktop_router)
app.include_router(vproc_router)
app.include_router(hproc_router)


@app.get("/health")
async def health_check():
    """
    Health check endpoint with detailed status.
    
    Returns:
        - status: 'ok' if all services are healthy, 'degraded' if some services are down
        - database: 'connected' or 'disconnected'
        - websocket: active connections count
        - uptime_seconds: server uptime in seconds
        - timestamp: current server time in ISO format
    """
    # Check database
    db_status = "connected"
    db_latency_ms = None
    try:
        db = get_database()
        # Quick ping to measure latency
        start = time.perf_counter()
        await db.command("ping")
        db_latency_ms = round((time.perf_counter() - start) * 1000, 2)
    except RuntimeError:
        db_status = "disconnected"
    except Exception:
        db_status = "error"
    
    # Calculate uptime
    uptime_seconds = None
    if _app_start_time:
        uptime_seconds = (datetime.now(timezone.utc) - _app_start_time).total_seconds()
    
    # Get WebSocket connection count
    ws_connections = sum(len(conns) for conns in manager.active_connections.values())
    
    overall_status = "ok" if db_status == "connected" else "degraded"
    
    return {
        "status": overall_status,
        "database": {
            "status": db_status,
            "latency_ms": db_latency_ms
        },
        "websocket": {
            "active_connections": ws_connections
        },
        "uptime_seconds": round(uptime_seconds, 2) if uptime_seconds else None,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/health/ready")
async def readiness_check():
    """
    Readiness probe for Kubernetes/container orchestration.
    
    Returns 200 if the service is ready to accept traffic.
    Returns 503 if the service is not ready.
    """
    try:
        db = get_database()
        await db.command("ping")
        return {"ready": True}
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"ready": False, "reason": "Database not available"}
        )


@app.get("/health/live")
async def liveness_check():
    """
    Liveness probe for Kubernetes/container orchestration.
    
    Returns 200 if the service is alive (even if degraded).
    """
    return {"alive": True}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """WebSocket endpoint for real-time updates."""
    # Validate token
    if not token:
        await websocket.close(code=4001)
        return
    
    try:
        token_data = decode_token(token)
    except HTTPException:
        await websocket.close(code=4001)
        return
    
    user_id = token_data.user_id
    
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Validate input types
            action = data.get("action") if isinstance(data.get("action"), str) else None
            topic = data.get("topic") if isinstance(data.get("topic"), str) else None
            
            if action == "subscribe" and topic in ALL_TOPICS:
                manager.subscribe(websocket, topic)
                await manager.send_personal_message(
                    {"type": "subscribed", "topic": topic},
                    websocket
                )
            
            elif action == "unsubscribe" and topic in ALL_TOPICS:
                manager.unsubscribe(websocket, topic)
                await manager.send_personal_message(
                    {"type": "unsubscribed", "topic": topic},
                    websocket
                )
            
            elif action == "ping":
                await manager.send_personal_message(
                    {"type": "pong"},
                    websocket
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception:
        manager.disconnect(websocket, user_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8888,
        reload=True
    )
