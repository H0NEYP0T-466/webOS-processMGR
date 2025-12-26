"""Virtual process schemas."""
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any, List, Literal
from datetime import datetime

from ..validators import validate_app_name


class StartProcess(BaseModel):
    """Start virtual process request."""
    app: str
    metadata: Dict[str, Any] = {}
    
    @field_validator('app')
    @classmethod
    def validate_app_field(cls, v: str) -> str:
        is_valid, error = validate_app_name(v)
        if not is_valid:
            raise ValueError(error)
        return v


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
