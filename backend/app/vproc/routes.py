"""Virtual process routes."""
from fastapi import APIRouter, HTTPException, status, Depends

from ..auth.service import get_current_user
from ..auth.schemas import TokenData
from .schemas import StartProcess, VirtualProcess, VirtualProcessList
from . import service

router = APIRouter(prefix="/vproc", tags=["virtual_processes"])


def doc_to_process(doc: dict) -> VirtualProcess:
    """Convert MongoDB document to VirtualProcess."""
    return VirtualProcess(
        id=str(doc["_id"]),
        owner_id=doc["owner_id"],
        app=doc["app"],
        status=doc["status"],
        cpu=doc.get("cpu", 0.0),
        mem=doc.get("mem", 0.0),
        started_at=doc["started_at"],
        updated_at=doc["updated_at"],
        metadata=doc.get("metadata", {})
    )


@router.post("/start", response_model=VirtualProcess)
async def start_process(
    data: StartProcess,
    current_user: TokenData = Depends(get_current_user)
):
    """Start a new virtual process."""
    process = await service.start_process(
        app=data.app,
        owner_id=current_user.user_id,
        metadata=data.metadata
    )
    return doc_to_process(process)


@router.get("/list", response_model=VirtualProcessList)
async def list_processes(
    include_stopped: bool = False,
    current_user: TokenData = Depends(get_current_user)
):
    """List virtual processes. By default only shows running processes."""
    processes = await service.list_processes(
        current_user.user_id,
        running_only=not include_stopped
    )
    return VirtualProcessList(processes=[doc_to_process(p) for p in processes])


@router.post("/stop/{process_id}")
async def stop_process(
    process_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Stop a virtual process."""
    success = await service.stop_process(process_id, current_user.user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found"
        )
    
    return {"message": "Process stopped"}


@router.delete("/{process_id}")
async def delete_process(
    process_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a virtual process."""
    success = await service.delete_process(process_id, current_user.user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found"
        )
    
    return {"message": "Process deleted"}
