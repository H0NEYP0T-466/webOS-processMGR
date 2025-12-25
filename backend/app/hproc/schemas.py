"""Host process schemas."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HostProcess(BaseModel):
    """Host system process info."""
    pid: int
    name: str
    username: Optional[str] = None
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    status: str = "running"
    create_time: Optional[datetime] = None
    cmdline: Optional[str] = None
    num_threads: int = 0


class HostProcessList(BaseModel):
    """List of host processes."""
    processes: List[HostProcess]


class SystemMetrics(BaseModel):
    """System-wide metrics."""
    cpu_percent: float
    memory_percent: float
    top_processes: List[HostProcess]


class TerminateResult(BaseModel):
    """Result of process termination."""
    pid: int
    success: bool
    message: str
