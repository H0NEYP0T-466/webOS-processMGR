"""Host process routes."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, HTTPException, status, Depends, Path

from ..auth.service import get_current_user, get_admin_user
from ..auth.schemas import TokenData
from .schemas import HostProcess, HostProcessList, SystemMetrics, TerminateResult
from . import service
from .service import TerminationDenied

router = APIRouter(prefix="/hproc", tags=["host_processes"])

# Thread pool for CPU-bound psutil operations
_executor = ThreadPoolExecutor(max_workers=2)


# Maximum PID value (typically 2^31-1 on most systems)
MAX_PID_VALUE = 2**31 - 1


def validate_pid(pid: int) -> int:
    """Validate PID parameter."""
    if pid < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PID must be a non-negative integer"
        )
    if pid > MAX_PID_VALUE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PID value"
        )
    return pid


def dict_to_process(data: dict) -> HostProcess:
    """Convert process dict to HostProcess schema."""
    return HostProcess(
        pid=data.get("pid", 0),
        name=data.get("name", "unknown"),
        username=data.get("username"),
        cpu_percent=data.get("cpu_percent", 0.0),
        memory_percent=data.get("memory_percent", 0.0),
        status=data.get("status", "running"),
        create_time=data.get("create_time"),
        cmdline=data.get("cmdline"),
        num_threads=data.get("num_threads", 0)
    )


@router.get("/list", response_model=HostProcessList)
async def list_processes(current_user: TokenData = Depends(get_current_user)):
    """List all host system processes (runs in thread pool to avoid blocking)."""
    loop = asyncio.get_event_loop()
    procs = await loop.run_in_executor(_executor, service.list_processes)
    return HostProcessList(processes=[dict_to_process(p) for p in procs])


@router.get("/metrics", response_model=SystemMetrics)
async def get_metrics(current_user: TokenData = Depends(get_current_user)):
    """Get system-wide metrics and top processes (runs in thread pool to avoid blocking)."""
    loop = asyncio.get_event_loop()
    metrics = await loop.run_in_executor(_executor, service.get_system_metrics)
    return SystemMetrics(
        cpu_percent=metrics["cpu_percent"],
        memory_percent=metrics["memory_percent"],
        top_processes=[dict_to_process(p) for p in metrics["top_processes"]]
    )


@router.get("/details/{pid}")
async def get_process_details(
    pid: int,
    current_user: TokenData = Depends(get_current_user)
):
    """Get detailed information about a specific process (runs in thread pool)."""
    validate_pid(pid)
    loop = asyncio.get_event_loop()
    details = await loop.run_in_executor(_executor, service.get_process_details, pid)
    
    if details is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found or access denied"
        )
    
    return details


@router.post("/terminate/{pid}", response_model=TerminateResult)
async def terminate_process(
    pid: int,
    admin_user: TokenData = Depends(get_admin_user)
):
    """
    Terminate a host system process.
    
    Requires admin role.
    """
    validate_pid(pid)
    try:
        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(
            _executor, 
            service.terminate_process, 
            pid, 
            admin_user.username
        )
        return TerminateResult(
            pid=pid,
            success=success,
            message="Process terminated successfully"
        )
    except TerminationDenied as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
