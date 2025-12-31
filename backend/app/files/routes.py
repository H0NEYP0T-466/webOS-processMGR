"""File system routes."""
from fastapi import APIRouter, HTTPException, status, Depends

from ..auth.service import get_current_user
from ..auth.schemas import TokenData
from ..validators import validate_object_id
from .schemas import CreateFolder, CreateFile, UpdateNode, FSNode, FSTree
from . import service
from .service import NodeAlreadyExistsError

router = APIRouter(prefix="/files", tags=["files"])


def validate_node_id(node_id: str) -> str:
    """Validate node_id path parameter."""
    is_valid, error = validate_object_id(node_id)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    return node_id


def doc_to_node(doc: dict) -> FSNode:
    """Convert MongoDB document to FSNode."""
    return FSNode(
        id=str(doc["_id"]),
        owner_id=doc["owner_id"],
        type=doc["type"],
        name=doc["name"],
        parent_id=doc.get("parent_id"),
        path=doc["path"],
        content=doc.get("content"),
        mime_type=doc.get("mime_type"),
        size=doc.get("size"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"]
    )


@router.post("/folder", response_model=FSNode)
async def create_folder(
    data: CreateFolder,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new folder."""
    try:
        folder = await service.create_folder(
            name=data.name,
            parent_id=data.parent_id,
            owner_id=current_user.user_id
        )
        return doc_to_node(folder)
    except NodeAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.post("/file", response_model=FSNode)
async def create_file(
    data: CreateFile,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new file."""
    try:
        file = await service.create_file(
            name=data.name,
            parent_id=data.parent_id,
            owner_id=current_user.user_id,
            content=data.content,
            mime_type=data.mime_type
        )
        return doc_to_node(file)
    except NodeAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.get("/tree", response_model=FSTree)
async def get_tree(current_user: TokenData = Depends(get_current_user)):
    """Get all files and folders for current user."""
    nodes = await service.get_tree(current_user.user_id)
    return FSTree(nodes=[doc_to_node(n) for n in nodes])


@router.get("/node/{node_id}", response_model=FSNode)
async def get_node(
    node_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Get a single file or folder."""
    validate_node_id(node_id)
    node = await service.get_node(node_id, current_user.user_id)
    
    if node is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    return doc_to_node(node)


@router.patch("/node/{node_id}", response_model=FSNode)
async def update_node(
    node_id: str,
    data: UpdateNode,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a file or folder."""
    validate_node_id(node_id)
    try:
        node = await service.update_node(
            node_id=node_id,
            owner_id=current_user.user_id,
            name=data.name,
            parent_id=data.parent_id,
            content=data.content
        )
    except NodeAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    
    if node is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    return doc_to_node(node)


@router.delete("/node/{node_id}")
async def delete_node(
    node_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a file or folder."""
    validate_node_id(node_id)
    success = await service.delete_node(node_id, current_user.user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    
    return {"message": "Node deleted"}
