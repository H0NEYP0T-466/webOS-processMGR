"""Auth schemas (Pydantic models)."""
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

from ..validators import (
    validate_username, 
    validate_password,
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH
)


class UserRegister(BaseModel):
    """User registration request."""
    username: str
    password: str
    
    @field_validator('username')
    @classmethod
    def validate_username_field(cls, v: str) -> str:
        is_valid, error = validate_username(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        is_valid, error = validate_password(v)
        if not is_valid:
            raise ValueError(error)
        return v


class UserLogin(BaseModel):
    """User login request."""
    username: str
    password: str
    
    @field_validator('username')
    @classmethod
    def validate_username_field(cls, v: str) -> str:
        # For login, be more lenient - just check it's not empty
        if not v or not v.strip():
            raise ValueError("Username is required")
        return v.strip()
    
    @field_validator('password')
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        if not v:
            raise ValueError("Password is required")
        return v


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data encoded in JWT token."""
    user_id: str
    username: str
    roles: List[str] = []


class UserResponse(BaseModel):
    """User information response."""
    id: str
    username: str
    roles: List[str]
    created_at: datetime


class UserInDB(BaseModel):
    """User document from database."""
    id: str
    username: str
    password_hash: str
    roles: List[str] = []
    created_at: datetime
