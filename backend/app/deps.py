"""Database connection and dependencies."""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

from .config import settings
from .logging_config import info_emoji

# Global database client
_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_database() -> None:
    """Connect to MongoDB."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGO_URI)
    _db = _client[settings.MONGO_DB_NAME]
    
    # Verify connection
    await _client.admin.command("ping")
    
    # Redact sensitive info from URI for logging
    uri_parts = settings.MONGO_URI.split("@")
    if len(uri_parts) > 1:
        uri_redacted = f"***@{uri_parts[-1]}"
    else:
        uri_redacted = settings.MONGO_URI.replace("mongodb://", "mongodb://***")
    
    info_emoji("✅", f"MongoDB connected: {uri_redacted}")
    
    # Create indexes
    await create_indexes()


async def create_indexes() -> None:
    """Create database indexes."""
    global _db
    if _db is None:
        return
    
    # Users collection
    await _db.users.create_index("username", unique=True)
    
    # File system nodes collection
    await _db.fs_nodes.create_index([("owner_id", 1), ("path", 1)], unique=True)
    await _db.fs_nodes.create_index("parent_id")
    
    # Virtual processes collection
    await _db.virtual_processes.create_index("owner_id")
    
    # Desktop state collection
    await _db.desktop_state.create_index("owner_id", unique=True)
    
    # Audit logs collection
    await _db.audit_logs.create_index("created_at")


async def close_database_connection() -> None:
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        info_emoji("📴", "MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if _db is None:
        raise RuntimeError("Database not connected")
    return _db
