"""WebSocket connection manager."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Set
from fastapi import WebSocket

from ..hproc import service as hproc_service
from ..logging_config import info_emoji
from .topics import METRICS_HOST

# Thread pool for CPU-bound psutil operations
_executor = ThreadPoolExecutor(max_workers=1)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""
    
    def __init__(self):
        # Active connections per user
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Topics each connection is subscribed to
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        # Background task for metrics
        self._metrics_task = None
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        self.subscriptions[websocket] = set()
        
        info_emoji("🔌", f"WebSocket connected: user={user_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        
        info_emoji("📴", f"WebSocket disconnected: user={user_id}")
    
    def subscribe(self, websocket: WebSocket, topic: str):
        """Subscribe a connection to a topic."""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].add(topic)
    
    def unsubscribe(self, websocket: WebSocket, topic: str):
        """Unsubscribe a connection from a topic."""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].discard(topic)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific connection."""
        try:
            await websocket.send_json(message)
        except Exception:
            pass
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        """Broadcast a message to all connections of a user."""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass
    
    async def broadcast_to_topic(self, topic: str, message: dict):
        """Broadcast a message to all connections subscribed to a topic."""
        for websocket, topics in self.subscriptions.items():
            if topic in topics:
                try:
                    await websocket.send_json(message)
                except Exception:
                    pass
    
    async def broadcast_all(self, message: dict):
        """Broadcast a message to all connections."""
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass
    
    async def start_metrics_broadcast(self):
        """Start background task to broadcast metrics."""
        self._metrics_task = asyncio.create_task(self._metrics_loop())
    
    async def stop_metrics_broadcast(self):
        """Stop the metrics broadcast task."""
        if self._metrics_task:
            self._metrics_task.cancel()
            try:
                await self._metrics_task
            except asyncio.CancelledError:
                pass
    
    async def _metrics_loop(self):
        """Background loop to broadcast system metrics (non-blocking)."""
        loop = asyncio.get_event_loop()
        
        while True:
            try:
                await asyncio.sleep(2)  # Broadcast every 2 seconds (reduced from 1s)
                
                # Get metrics only if there are subscribed connections
                has_subscribers = any(
                    METRICS_HOST in topics 
                    for topics in self.subscriptions.values()
                )
                
                if has_subscribers:
                    # Run psutil call in executor to avoid blocking
                    metrics = await loop.run_in_executor(
                        _executor, 
                        hproc_service.get_system_metrics
                    )
                    
                    # Convert to serializable format
                    message = {
                        "topic": METRICS_HOST,
                        "data": {
                            "cpu_percent": metrics["cpu_percent"],
                            "memory_percent": metrics["memory_percent"],
                            "top_processes": [
                                {
                                    "pid": p.get("pid"),
                                    "name": p.get("name"),
                                    "cpu_percent": p.get("cpu_percent", 0),
                                    "memory_percent": p.get("memory_percent", 0)
                                }
                                for p in metrics["top_processes"]
                            ]
                        }
                    }
                    
                    await self.broadcast_to_topic(METRICS_HOST, message)
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                # Log error but continue
                pass


# Global connection manager instance
manager = ConnectionManager()
