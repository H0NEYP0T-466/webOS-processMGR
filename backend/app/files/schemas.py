"""File system schemas."""
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime


class CreateFolder(BaseModel):
    """Create folder request."""
    name: str
    parent_id: Optional[str] = None


class CreateFile(BaseModel):
    """Create file request."""
    name: str
    parent_id: Optional[str] = None
    content: str = ""
    mime_type: str = "text/plain"


class UpdateNode(BaseModel):
    """Update file/folder request."""
    name: Optional[str] = None
    parent_id: Optional[str] = None
    content: Optional[str] = None


class FSNode(BaseModel):
    """File system node response."""
    id: str
    owner_id: str
    type: Literal["file", "folder"]
    name: str
    parent_id: Optional[str]
    path: str
    content: Optional[str] = None
    mime_type: Optional[str] = None
    size: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class FSTree(BaseModel):
    """File system tree response."""
    nodes: List[FSNode]
