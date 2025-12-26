"""Tests for file schemas validation."""
import pytest
from pydantic import ValidationError

from app.files.schemas import CreateFolder, CreateFile, UpdateNode


class TestCreateFolderValidation:
    """Tests for folder creation validation."""
    
    def test_valid_folder(self):
        """Test valid folder creation."""
        folder = CreateFolder(name="Documents")
        assert folder.name == "Documents"
        assert folder.parent_id is None
    
    def test_valid_folder_with_parent(self):
        """Test valid folder with parent."""
        folder = CreateFolder(name="Subfolder", parent_id="507f1f77bcf86cd799439011")
        assert folder.name == "Subfolder"
        assert folder.parent_id == "507f1f77bcf86cd799439011"
    
    def test_empty_name(self):
        """Test empty folder name."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFolder(name="")
        assert "required" in str(exc_info.value).lower()
    
    def test_name_path_traversal(self):
        """Test path traversal in folder name."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFolder(name="../etc")
        assert ".." in str(exc_info.value)
    
    def test_name_forbidden_chars(self):
        """Test forbidden characters in folder name."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFolder(name="folder/name")
        assert "/" in str(exc_info.value) or "cannot contain" in str(exc_info.value).lower()
    
    def test_invalid_parent_id(self):
        """Test invalid parent ID format."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFolder(name="Documents", parent_id="invalid-id")
        assert "invalid" in str(exc_info.value).lower()


class TestCreateFileValidation:
    """Tests for file creation validation."""
    
    def test_valid_file(self):
        """Test valid file creation."""
        file = CreateFile(name="document.txt")
        assert file.name == "document.txt"
        assert file.content == ""
        assert file.mime_type == "text/plain"
    
    def test_valid_file_with_content(self):
        """Test valid file with content."""
        file = CreateFile(name="notes.md", content="# Hello", mime_type="text/markdown")
        assert file.name == "notes.md"
        assert file.content == "# Hello"
        assert file.mime_type == "text/markdown"
    
    def test_empty_name(self):
        """Test empty file name."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFile(name="")
        assert "required" in str(exc_info.value).lower()
    
    def test_name_path_traversal(self):
        """Test path traversal in file name."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFile(name="../../../etc/passwd")
        assert ".." in str(exc_info.value)
    
    def test_invalid_mime_type(self):
        """Test invalid MIME type format."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFile(name="file.txt", mime_type="invalid")
        assert "mime" in str(exc_info.value).lower() or "invalid" in str(exc_info.value).lower()
    
    def test_reserved_name(self):
        """Test Windows reserved name."""
        with pytest.raises(ValidationError) as exc_info:
            CreateFile(name="CON")
        assert "reserved" in str(exc_info.value).lower()


class TestUpdateNodeValidation:
    """Tests for node update validation."""
    
    def test_valid_update_name(self):
        """Test valid name update."""
        update = UpdateNode(name="new_name.txt")
        assert update.name == "new_name.txt"
    
    def test_valid_update_content(self):
        """Test valid content update."""
        update = UpdateNode(content="New content here")
        assert update.content == "New content here"
    
    def test_valid_update_parent(self):
        """Test valid parent update."""
        update = UpdateNode(parent_id="507f1f77bcf86cd799439011")
        assert update.parent_id == "507f1f77bcf86cd799439011"
    
    def test_invalid_name_path_traversal(self):
        """Test path traversal in name update."""
        with pytest.raises(ValidationError) as exc_info:
            UpdateNode(name="../secret")
        assert ".." in str(exc_info.value)
    
    def test_invalid_parent_id(self):
        """Test invalid parent ID in update."""
        with pytest.raises(ValidationError) as exc_info:
            UpdateNode(parent_id="not-valid-oid")
        assert "invalid" in str(exc_info.value).lower()
    
    def test_empty_update_allowed(self):
        """Test that empty update is allowed."""
        update = UpdateNode()
        assert update.name is None
        assert update.parent_id is None
        assert update.content is None
