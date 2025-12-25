"""Auth schemas (Pydantic models)."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserRegister(BaseModel):
    """User registration request."""
    username: str
    password: str


class UserLogin(BaseModel):
    """User login request."""
    username: str
    password: str


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
