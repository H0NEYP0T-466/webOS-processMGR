"""Host process routes."""
from fastapi import APIRouter, HTTPException, status, Depends

from ..auth.service import get_current_user, get_admin_user
from ..auth.schemas import TokenData
from .schemas import HostProcess, HostProcessList, SystemMetrics, TerminateResult
from . import service
from .service import TerminationDenied

router = APIRouter(prefix="/hproc", tags=["host_processes"])


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
    """List all host system processes."""
    procs = service.list_processes()
    return HostProcessList(processes=[dict_to_process(p) for p in procs])


@router.get("/metrics", response_model=SystemMetrics)
async def get_metrics(current_user: TokenData = Depends(get_current_user)):
    """Get system-wide metrics and top processes."""
    metrics = service.get_system_metrics()
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
    """Get detailed information about a specific process."""
    details = service.get_process_details(pid)
    
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
    try:
        success = service.terminate_process(pid, admin_user.username)
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
