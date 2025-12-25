"""Auth service - JWT and password handling."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..config import settings
from ..deps import get_database
from .schemas import TokenData, UserInDB

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        username: str = payload.get("username")
        roles: list = payload.get("roles", [])
        
        if user_id is None or username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return TokenData(user_id=user_id, username=username, roles=roles)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
) -> TokenData:
    """Get current user from JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return decode_token(credentials.credentials)


async def get_admin_user(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Require admin role for endpoint."""
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def get_user_by_username(username: str) -> Optional[UserInDB]:
    """Get user from database by username."""
    db = get_database()
    user_doc = await db.users.find_one({"username": username})
    
    if user_doc is None:
        return None
    
    return UserInDB(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        password_hash=user_doc["password_hash"],
        roles=user_doc.get("roles", []),
        created_at=user_doc["created_at"]
    )


async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """Get user from database by ID."""
    from bson import ObjectId
    
    db = get_database()
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if user_doc is None:
        return None
    
    return UserInDB(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        password_hash=user_doc["password_hash"],
        roles=user_doc.get("roles", []),
        created_at=user_doc["created_at"]
    )
