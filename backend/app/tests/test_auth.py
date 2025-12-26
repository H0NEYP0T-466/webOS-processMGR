"""Tests for auth schemas validation."""
import pytest
from pydantic import ValidationError

from app.auth.schemas import UserRegister, UserLogin


class TestUserRegisterValidation:
    """Tests for user registration validation."""
    
    def test_valid_registration(self):
        """Test valid registration data."""
        user = UserRegister(username="john_doe", password="password123")
        assert user.username == "john_doe"
        assert user.password == "password123"
    
    def test_username_too_short(self):
        """Test username too short."""
        with pytest.raises(ValidationError) as exc_info:
            UserRegister(username="ab", password="password123")
        assert "at least 3 characters" in str(exc_info.value)
    
    def test_username_too_long(self):
        """Test username too long."""
        with pytest.raises(ValidationError) as exc_info:
            UserRegister(username="a" * 33, password="password123")
        assert "at most 32 characters" in str(exc_info.value)
    
    def test_username_invalid_chars(self):
        """Test username with invalid characters."""
        with pytest.raises(ValidationError) as exc_info:
            UserRegister(username="john@doe", password="password123")
        assert "only contain letters" in str(exc_info.value)
    
    def test_password_too_short(self):
        """Test password too short."""
        with pytest.raises(ValidationError) as exc_info:
            UserRegister(username="john_doe", password="12345")
        assert "at least 6 characters" in str(exc_info.value)
    
    def test_password_too_long(self):
        """Test password too long."""
        with pytest.raises(ValidationError) as exc_info:
            UserRegister(username="john_doe", password="a" * 129)
        assert "at most 128 characters" in str(exc_info.value)
    
    def test_empty_username(self):
        """Test empty username."""
        with pytest.raises(ValidationError):
            UserRegister(username="", password="password123")
    
    def test_empty_password(self):
        """Test empty password."""
        with pytest.raises(ValidationError):
            UserRegister(username="john_doe", password="")


class TestUserLoginValidation:
    """Tests for user login validation."""
    
    def test_valid_login(self):
        """Test valid login data."""
        user = UserLogin(username="john_doe", password="password123")
        assert user.username == "john_doe"
        assert user.password == "password123"
    
    def test_username_whitespace_trimmed(self):
        """Test username whitespace is trimmed."""
        user = UserLogin(username="  john_doe  ", password="password123")
        assert user.username == "john_doe"
    
    def test_empty_username(self):
        """Test empty username."""
        with pytest.raises(ValidationError) as exc_info:
            UserLogin(username="", password="password123")
        assert "required" in str(exc_info.value).lower()
    
    def test_whitespace_only_username(self):
        """Test whitespace-only username."""
        with pytest.raises(ValidationError) as exc_info:
            UserLogin(username="   ", password="password123")
        assert "required" in str(exc_info.value).lower()
    
    def test_empty_password(self):
        """Test empty password."""
        with pytest.raises(ValidationError) as exc_info:
            UserLogin(username="john_doe", password="")
        assert "required" in str(exc_info.value).lower()
