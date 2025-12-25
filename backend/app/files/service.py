"""File system service."""
from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId

from ..deps import get_database
from ..logging_config import info_emoji


async def get_parent_path(parent_id: Optional[str], owner_id: str) -> str:
    """Get the path of parent folder."""
    if parent_id is None:
        return "/"
    
    db = get_database()
    parent = await db.fs_nodes.find_one({
        "_id": ObjectId(parent_id),
        "owner_id": owner_id
    })
    
    if parent is None:
        return "/"
    
    return parent["path"]


async def build_path(name: str, parent_id: Optional[str], owner_id: str) -> str:
    """Build full path for a node."""
    parent_path = await get_parent_path(parent_id, owner_id)
    
    if parent_path == "/":
        return f"/{name}"
    
    return f"{parent_path}/{name}"


async def create_folder(name: str, parent_id: Optional[str], owner_id: str) -> dict:
    """Create a new folder."""
    db = get_database()
    
    path = await build_path(name, parent_id, owner_id)
    now = datetime.now(timezone.utc)
    
    folder_doc = {
        "owner_id": owner_id,
        "type": "folder",
        "name": name,
        "parent_id": parent_id,
        "path": path,
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.fs_nodes.insert_one(folder_doc)
    folder_doc["_id"] = result.inserted_id
    
    info_emoji("🗂️", f"Folder created: path={path} owner={owner_id}")
    
    return folder_doc


async def create_file(
    name: str, 
    parent_id: Optional[str], 
    owner_id: str, 
    content: str = "",
    mime_type: str = "text/plain"
) -> dict:
    """Create a new file."""
    db = get_database()
    
    path = await build_path(name, parent_id, owner_id)
    now = datetime.now(timezone.utc)
    
    file_doc = {
        "owner_id": owner_id,
        "type": "file",
        "name": name,
        "parent_id": parent_id,
        "path": path,
        "content": content,
        "mime_type": mime_type,
        "size": len(content.encode("utf-8")),
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.fs_nodes.insert_one(file_doc)
    file_doc["_id"] = result.inserted_id
    
    info_emoji("📄", f"File created: path={path} owner={owner_id}")
    
    return file_doc


async def get_tree(owner_id: str) -> List[dict]:
    """Get all file system nodes for a user."""
    db = get_database()
    
    cursor = db.fs_nodes.find({"owner_id": owner_id})
    nodes = await cursor.to_list(length=1000)
    
    return nodes


async def get_node(node_id: str, owner_id: str) -> Optional[dict]:
    """Get a single node by ID."""
    db = get_database()
    
    node = await db.fs_nodes.find_one({
        "_id": ObjectId(node_id),
        "owner_id": owner_id
    })
    
    return node


async def update_node(
    node_id: str, 
    owner_id: str, 
    name: Optional[str] = None,
    parent_id: Optional[str] = None,
    content: Optional[str] = None
) -> Optional[dict]:
    """Update a node."""
    db = get_database()
    
    update_fields = {"updated_at": datetime.now(timezone.utc)}
    
    if name is not None:
        update_fields["name"] = name
    
    if parent_id is not None:
        update_fields["parent_id"] = parent_id
        # Rebuild path
        update_fields["path"] = await build_path(
            name or (await get_node(node_id, owner_id))["name"],
            parent_id,
            owner_id
        )
    
    if content is not None:
        update_fields["content"] = content
        update_fields["size"] = len(content.encode("utf-8"))
    
    result = await db.fs_nodes.find_one_and_update(
        {"_id": ObjectId(node_id), "owner_id": owner_id},
        {"$set": update_fields},
        return_document=True
    )
    
    if result and content is not None:
        info_emoji("✍️", f"File updated: path={result['path']} bytes={update_fields['size']} owner={owner_id}")
    
    return result


async def delete_node(node_id: str, owner_id: str) -> bool:
    """Delete a node and its children."""
    db = get_database()
    
    node = await get_node(node_id, owner_id)
    if node is None:
        return False
    
    # If folder, delete all children first
    if node["type"] == "folder":
        await db.fs_nodes.delete_many({
            "owner_id": owner_id,
            "path": {"$regex": f"^{node['path']}/"}
        })
    
    result = await db.fs_nodes.delete_one({
        "_id": ObjectId(node_id),
        "owner_id": owner_id
    })
    
    info_emoji("🗑️", f"Node deleted: path={node['path']} owner={owner_id}")
    
    return result.deleted_count > 0
