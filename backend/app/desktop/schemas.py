"""Desktop state schemas."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class IconPosition(BaseModel):
    """Icon position on desktop."""
    node_id: str
    x: int
    y: int


class WindowState(BaseModel):
    """Window state."""
    window_id: str
    app: str
    x: int
    y: int
    w: int
    h: int
    minimized: bool = False
    maximized: bool = False
    z: int = 0


class DesktopState(BaseModel):
    """Full desktop state."""
    wallpaper: str = "/wallpapers/default.jpg"
    icons: List[IconPosition] = []
    windows: List[WindowState] = []
    settings: Dict[str, Any] = {}


class DesktopStateResponse(DesktopState):
    """Desktop state response with ID."""
    id: str
    owner_id: str
