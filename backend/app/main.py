"""WebOS Backend - FastAPI Application."""
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .deps import connect_to_database, close_database_connection, get_database
from .logging_config import info_emoji
from .auth.routes import router as auth_router
from .auth.service import hash_password, decode_token
from .files.routes import router as files_router
from .desktop.routes import router as desktop_router
from .vproc.routes import router as vproc_router
from .hproc.routes import router as hproc_router
from .ws.manager import manager
from .ws.topics import ALL_TOPICS


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    # Startup
    await connect_to_database()
    await ensure_admin_user()
    await manager.start_metrics_broadcast()
    info_emoji("🟢", f"Server started: http://0.0.0.0:8000")
    
    yield
    
    # Shutdown
    await manager.stop_metrics_broadcast()
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

# Include routers
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(desktop_router)
app.include_router(vproc_router)
app.include_router(hproc_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


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
        port=8000,
        reload=True
    )
