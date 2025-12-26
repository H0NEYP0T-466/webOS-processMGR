"""File system schemas."""
from pydantic import BaseModel, field_validator
from typing import Optional, List, Literal
from datetime import datetime

from ..validators import validate_filename, validate_object_id


class CreateFolder(BaseModel):
    """Create folder request."""
    name: str
    parent_id: Optional[str] = None
    
    @field_validator('name')
    @classmethod
    def validate_name_field(cls, v: str) -> str:
        is_valid, error = validate_filename(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @field_validator('parent_id')
    @classmethod
    def validate_parent_id_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            is_valid, error = validate_object_id(v)
            if not is_valid:
                raise ValueError(error)
        return v


class CreateFile(BaseModel):
    """Create file request."""
    name: str
    parent_id: Optional[str] = None
    content: str = ""
    mime_type: str = "text/plain"
    
    @field_validator('name')
    @classmethod
    def validate_name_field(cls, v: str) -> str:
        is_valid, error = validate_filename(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @field_validator('parent_id')
    @classmethod
    def validate_parent_id_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            is_valid, error = validate_object_id(v)
            if not is_valid:
                raise ValueError(error)
        return v
    
    @field_validator('mime_type')
    @classmethod
    def validate_mime_type_field(cls, v: str) -> str:
        # Basic MIME type validation
        if not v or '/' not in v:
            raise ValueError("Invalid MIME type format")
        return v


class UpdateNode(BaseModel):
    """Update file/folder request."""
    name: Optional[str] = None
    parent_id: Optional[str] = None
    content: Optional[str] = None
    
    @field_validator('name')
    @classmethod
    def validate_name_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            is_valid, error = validate_filename(v)
            if not is_valid:
                raise ValueError(error)
        return v
    
    @field_validator('parent_id')
    @classmethod
    def validate_parent_id_field(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            is_valid, error = validate_object_id(v)
            if not is_valid:
                raise ValueError(error)
        return v


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
