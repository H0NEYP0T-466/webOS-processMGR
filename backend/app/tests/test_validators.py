"""Tests for validators module."""
import pytest
from app.validators import (
    validate_username,
    validate_password,
    validate_filename,
    validate_app_name,
    validate_object_id,
    sanitize_path,
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    FILENAME_MAX_LENGTH,
    APP_NAME_MAX_LENGTH
)


class TestUsernameValidation:
    """Tests for username validation."""
    
    def test_valid_username(self):
        """Test valid usernames."""
        valid_usernames = ["john", "john_doe", "john-doe", "John123", "a" * USERNAME_MAX_LENGTH]
        for username in valid_usernames:
            is_valid, error = validate_username(username)
            assert is_valid, f"Username '{username}' should be valid: {error}"
    
    def test_empty_username(self):
        """Test empty username."""
        is_valid, error = validate_username("")
        assert not is_valid
        assert "required" in error.lower()
    
    def test_username_too_short(self):
        """Test username too short."""
        is_valid, error = validate_username("ab")
        assert not is_valid
        assert str(USERNAME_MIN_LENGTH) in error
    
    def test_username_too_long(self):
        """Test username too long."""
        is_valid, error = validate_username("a" * (USERNAME_MAX_LENGTH + 1))
        assert not is_valid
        assert str(USERNAME_MAX_LENGTH) in error
    
    def test_username_invalid_chars(self):
        """Test username with invalid characters."""
        invalid_usernames = ["john doe", "john@doe", "john.doe", "john/doe", "john<script>"]
        for username in invalid_usernames:
            is_valid, error = validate_username(username)
            assert not is_valid, f"Username '{username}' should be invalid"


class TestPasswordValidation:
    """Tests for password validation."""
    
    def test_valid_password(self):
        """Test valid passwords."""
        valid_passwords = ["password123", "P@ssw0rd!", "a" * PASSWORD_MIN_LENGTH, "a" * PASSWORD_MAX_LENGTH]
        for password in valid_passwords:
            is_valid, error = validate_password(password)
            assert is_valid, f"Password should be valid: {error}"
    
    def test_empty_password(self):
        """Test empty password."""
        is_valid, error = validate_password("")
        assert not is_valid
        assert "required" in error.lower()
    
    def test_password_too_short(self):
        """Test password too short."""
        is_valid, error = validate_password("a" * (PASSWORD_MIN_LENGTH - 1))
        assert not is_valid
        assert str(PASSWORD_MIN_LENGTH) in error
    
    def test_password_too_long(self):
        """Test password too long."""
        is_valid, error = validate_password("a" * (PASSWORD_MAX_LENGTH + 1))
        assert not is_valid
        assert str(PASSWORD_MAX_LENGTH) in error


class TestFilenameValidation:
    """Tests for filename validation."""
    
    def test_valid_filenames(self):
        """Test valid filenames."""
        valid_names = ["document.txt", "my_file", "file-name", "report.2024.pdf", ".hidden"]
        for name in valid_names:
            is_valid, error = validate_filename(name)
            assert is_valid, f"Filename '{name}' should be valid: {error}"
    
    def test_empty_filename(self):
        """Test empty filename."""
        is_valid, error = validate_filename("")
        assert not is_valid
        assert "required" in error.lower()
    
    def test_filename_too_long(self):
        """Test filename too long."""
        is_valid, error = validate_filename("a" * (FILENAME_MAX_LENGTH + 1))
        assert not is_valid
        assert str(FILENAME_MAX_LENGTH) in error
    
    def test_path_traversal(self):
        """Test path traversal attempts."""
        dangerous_names = ["../etc/passwd", "..\\windows", "foo/../bar"]
        for name in dangerous_names:
            is_valid, error = validate_filename(name)
            assert not is_valid, f"Filename '{name}' should be invalid (path traversal)"
    
    def test_forbidden_chars(self):
        """Test forbidden characters."""
        forbidden_names = ["file/name", "file\\name", "file:name", "file*name", "file?name",
                          'file"name', "file<name", "file>name", "file|name"]
        for name in forbidden_names:
            is_valid, error = validate_filename(name)
            assert not is_valid, f"Filename '{name}' should be invalid (forbidden char)"
    
    def test_reserved_names_windows(self):
        """Test Windows reserved names."""
        reserved_names = ["CON", "PRN", "AUX", "NUL", "COM1", "LPT1", "con.txt", "prn.doc"]
        for name in reserved_names:
            is_valid, error = validate_filename(name)
            assert not is_valid, f"Filename '{name}' should be invalid (reserved)"
    
    def test_whitespace_trim(self):
        """Test leading/trailing whitespace."""
        is_valid, error = validate_filename(" file.txt")
        assert not is_valid
        assert "whitespace" in error.lower()
        
        is_valid, error = validate_filename("file.txt ")
        assert not is_valid
        assert "whitespace" in error.lower()


class TestAppNameValidation:
    """Tests for app name validation."""
    
    def test_valid_app_names(self):
        """Test valid app names."""
        valid_names = ["editor", "file-manager", "task_manager", "App123"]
        for name in valid_names:
            is_valid, error = validate_app_name(name)
            assert is_valid, f"App name '{name}' should be valid: {error}"
    
    def test_empty_app_name(self):
        """Test empty app name."""
        is_valid, error = validate_app_name("")
        assert not is_valid
        assert "required" in error.lower()
    
    def test_app_name_too_long(self):
        """Test app name too long."""
        is_valid, error = validate_app_name("a" * (APP_NAME_MAX_LENGTH + 1))
        assert not is_valid
        assert str(APP_NAME_MAX_LENGTH) in error
    
    def test_app_name_invalid_chars(self):
        """Test app name with invalid characters."""
        invalid_names = ["app name", "app.name", "app@name", "app/name", "<script>"]
        for name in invalid_names:
            is_valid, error = validate_app_name(name)
            assert not is_valid, f"App name '{name}' should be invalid"


class TestObjectIdValidation:
    """Tests for MongoDB ObjectId validation."""
    
    def test_valid_object_id(self):
        """Test valid ObjectId."""
        valid_ids = ["507f1f77bcf86cd799439011", "60d5ec49f8d1a8004f5b0000"]
        for oid in valid_ids:
            is_valid, error = validate_object_id(oid)
            assert is_valid, f"ObjectId '{oid}' should be valid: {error}"
    
    def test_empty_object_id(self):
        """Test empty ObjectId."""
        is_valid, error = validate_object_id("")
        assert not is_valid
        assert "required" in error.lower()
    
    def test_invalid_object_id(self):
        """Test invalid ObjectId formats."""
        invalid_ids = ["not-an-id", "12345", "507f1f77bcf86cd79943901", 
                       "507f1f77bcf86cd7994390111", "<script>alert(1)</script>"]
        for oid in invalid_ids:
            is_valid, error = validate_object_id(oid)
            assert not is_valid, f"ObjectId '{oid}' should be invalid"


class TestSanitizePath:
    """Tests for path sanitization."""
    
    def test_normal_paths(self):
        """Test normal path sanitization."""
        assert sanitize_path("/documents/file.txt") == "/documents/file.txt"
        assert sanitize_path("/a/b/c") == "/a/b/c"
    
    def test_path_traversal_removal(self):
        """Test path traversal removal."""
        assert sanitize_path("/../etc/passwd") == "/etc/passwd"
        assert sanitize_path("/foo/../bar") == "/foo/bar"
        assert sanitize_path("/../../../etc/passwd") == "/etc/passwd"
    
    def test_current_dir_removal(self):
        """Test current directory removal."""
        assert sanitize_path("/./foo/./bar") == "/foo/bar"
    
    def test_empty_path(self):
        """Test empty path."""
        assert sanitize_path("") == "/"
        assert sanitize_path(None) == "/"
    
    def test_null_byte_removal(self):
        """Test null byte removal."""
        assert sanitize_path("/foo\0bar") == "/foobar"
    
    def test_double_slashes(self):
        """Test double slash handling."""
        assert sanitize_path("//foo//bar//") == "/foo/bar"
