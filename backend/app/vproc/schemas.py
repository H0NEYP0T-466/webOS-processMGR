"""Virtual process schemas."""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Literal
from datetime import datetime


class StartProcess(BaseModel):
    """Start virtual process request."""
    app: str
    metadata: Dict[str, Any] = {}


class VirtualProcess(BaseModel):
    """Virtual process response."""
    id: str
    owner_id: str
    app: str
    status: Literal["running", "stopped", "suspended"]
    cpu: float = 0.0
    mem: float = 0.0
    started_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}


class VirtualProcessList(BaseModel):
    """List of virtual processes."""
    processes: List[VirtualProcess]
