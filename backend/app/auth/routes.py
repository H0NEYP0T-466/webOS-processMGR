"""Auth routes."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from ..deps import get_database
from ..logging_config import info_emoji, warning_emoji
from .schemas import UserRegister, UserLogin, Token, UserResponse, TokenData
from .service import (
    hash_password, 
    verify_password, 
    create_access_token, 
    get_current_user,
    get_user_by_username
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user."""
    db = get_database()
    
    # Check if user already exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create user document
    user_doc = {
        "username": user_data.username,
        "password_hash": hash_password(user_data.password),
        "roles": [],
        "created_at": datetime.now(timezone.utc)
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    info_emoji("👤", f"User registered: username={user_data.username}")
    
    # Create access token
    token = create_access_token({
        "sub": user_id,
        "username": user_data.username,
        "roles": []
    })
    
    # Initialize desktop state for new user
    await db.desktop_state.insert_one({
        "owner_id": user_id,
        "wallpaper": "/wallpapers/default.jpg",
        "icons": [],
        "windows": [],
        "settings": {}
    })
    
    # Create root folder for user
    await db.fs_nodes.insert_one({
        "owner_id": user_id,
        "type": "folder",
        "name": "/",
        "parent_id": None,
        "path": "/",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })
    
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login with username and password."""
    user = await get_user_by_username(user_data.username)
    
    if user is None or not verify_password(user_data.password, user.password_hash):
        warning_emoji("⚠️", f"Login failed: username={user_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    info_emoji("🔐", f"Login success: username={user_data.username}")
    
    # Create access token
    token = create_access_token({
        "sub": user.id,
        "username": user.username,
        "roles": user.roles
    })
    
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user)):
    """Get current user info."""
    db = get_database()
    user_doc = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        roles=user_doc.get("roles", []),
        created_at=user_doc["created_at"]
    )
