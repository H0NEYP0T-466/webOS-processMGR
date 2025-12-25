"""Virtual process service."""
from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
import random

from ..deps import get_database
from ..logging_config import info_emoji


async def start_process(app: str, owner_id: str, metadata: dict = None) -> dict:
    """Start a new virtual process."""
    db = get_database()
    
    now = datetime.now(timezone.utc)
    
    proc_doc = {
        "owner_id": owner_id,
        "app": app,
        "status": "running",
        "cpu": round(random.uniform(0.1, 5.0), 1),
        "mem": round(random.uniform(10, 100), 1),
        "started_at": now,
        "updated_at": now,
        "metadata": metadata or {}
    }
    
    result = await db.virtual_processes.insert_one(proc_doc)
    proc_doc["_id"] = result.inserted_id
    
    info_emoji("🧰", f"Virtual process started: id={result.inserted_id} app={app} user={owner_id}")
    
    return proc_doc


async def list_processes(owner_id: str, running_only: bool = True) -> List[dict]:
    """List virtual processes for a user.
    
    Args:
        owner_id: The user's ID
        running_only: If True, only return running processes (default)
    """
    db = get_database()
    
    query = {"owner_id": owner_id}
    if running_only:
        query["status"] = "running"
    
    cursor = db.virtual_processes.find(query)
    processes = await cursor.to_list(length=100)
    
    return processes


async def get_process(process_id: str, owner_id: str) -> Optional[dict]:
    """Get a single virtual process."""
    db = get_database()
    
    process = await db.virtual_processes.find_one({
        "_id": ObjectId(process_id),
        "owner_id": owner_id
    })
    
    return process


async def stop_process(process_id: str, owner_id: str) -> bool:
    """Stop a virtual process."""
    db = get_database()
    
    process = await get_process(process_id, owner_id)
    if process is None:
        return False
    
    result = await db.virtual_processes.update_one(
        {"_id": ObjectId(process_id), "owner_id": owner_id},
        {"$set": {
            "status": "stopped",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.modified_count > 0:
        info_emoji("🧰", f"Virtual process stopped: id={process_id} app={process['app']} user={owner_id}")
        return True
    
    return False


async def delete_process(process_id: str, owner_id: str) -> bool:
    """Delete a virtual process."""
    db = get_database()
    
    result = await db.virtual_processes.delete_one({
        "_id": ObjectId(process_id),
        "owner_id": owner_id
    })
    
    return result.deleted_count > 0


async def update_process_stats(owner_id: str) -> None:
    """Update CPU/memory stats for running processes (simulated)."""
    db = get_database()
    
    cursor = db.virtual_processes.find({
        "owner_id": owner_id,
        "status": "running"
    })
    
    async for process in cursor:
        await db.virtual_processes.update_one(
            {"_id": process["_id"]},
            {"$set": {
                "cpu": round(random.uniform(0.1, 10.0), 1),
                "mem": round(random.uniform(10, 150), 1),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
