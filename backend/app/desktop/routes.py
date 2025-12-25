"""Desktop state routes."""
from fastapi import APIRouter, Depends

from ..auth.service import get_current_user
from ..auth.schemas import TokenData
from ..deps import get_database
from ..logging_config import info_emoji
from .schemas import DesktopState, DesktopStateResponse

router = APIRouter(prefix="/desktop", tags=["desktop"])


@router.get("/state", response_model=DesktopStateResponse)
async def get_desktop_state(current_user: TokenData = Depends(get_current_user)):
    """Get current user's desktop state."""
    db = get_database()
    
    state = await db.desktop_state.find_one({"owner_id": current_user.user_id})
    
    if state is None:
        # Create default state
        state = {
            "owner_id": current_user.user_id,
            "wallpaper": "/wallpapers/default.jpg",
            "icons": [],
            "windows": [],
            "settings": {}
        }
        result = await db.desktop_state.insert_one(state)
        state["_id"] = result.inserted_id
    
    return DesktopStateResponse(
        id=str(state["_id"]),
        owner_id=state["owner_id"],
        wallpaper=state.get("wallpaper", "/wallpapers/default.jpg"),
        icons=state.get("icons", []),
        windows=state.get("windows", []),
        settings=state.get("settings", {})
    )


@router.put("/state", response_model=DesktopStateResponse)
async def update_desktop_state(
    data: DesktopState,
    current_user: TokenData = Depends(get_current_user)
):
    """Update current user's desktop state."""
    db = get_database()
    
    result = await db.desktop_state.find_one_and_update(
        {"owner_id": current_user.user_id},
        {"$set": {
            "wallpaper": data.wallpaper,
            "icons": [icon.model_dump() for icon in data.icons],
            "windows": [win.model_dump() for win in data.windows],
            "settings": data.settings
        }},
        upsert=True,
        return_document=True
    )
    
    info_emoji(
        "📦", 
        f"Desktop state saved: windows={len(data.windows)} icons={len(data.icons)} user={current_user.username}"
    )
    
    return DesktopStateResponse(
        id=str(result["_id"]),
        owner_id=result["owner_id"],
        wallpaper=result.get("wallpaper", "/wallpapers/default.jpg"),
        icons=result.get("icons", []),
        windows=result.get("windows", []),
        settings=result.get("settings", {})
    )
