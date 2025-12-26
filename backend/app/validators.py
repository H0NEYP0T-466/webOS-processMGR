"""Common validators for input validation across the application."""
import re
from bson import ObjectId
from bson.errors import InvalidId


# Username constraints
USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 32
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')

# Password constraints
PASSWORD_MIN_LENGTH = 6
PASSWORD_MAX_LENGTH = 128

# File/folder name constraints
FILENAME_MAX_LENGTH = 255
# Characters that are not allowed in file/folder names
FILENAME_FORBIDDEN_CHARS = {'/', '\\', '\0', ':', '*', '?', '"', '<', '>', '|'}
# Reserved names that cannot be used (case-insensitive)
RESERVED_NAMES = {'..', '.', 'con', 'prn', 'aux', 'nul'} | {
    f'{name}{i}' for name in ['com', 'lpt'] for i in range(1, 10)
}

# App name constraints for virtual processes
APP_NAME_MAX_LENGTH = 64
APP_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')


def validate_username(username: str) -> tuple[bool, str]:
    """
    Validate username format.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < USERNAME_MIN_LENGTH:
        return False, f"Username must be at least {USERNAME_MIN_LENGTH} characters"
    
    if len(username) > USERNAME_MAX_LENGTH:
        return False, f"Username must be at most {USERNAME_MAX_LENGTH} characters"
    
    if not USERNAME_PATTERN.match(username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"
    
    return True, ""


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password format.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters"
    
    if len(password) > PASSWORD_MAX_LENGTH:
        return False, f"Password must be at most {PASSWORD_MAX_LENGTH} characters"
    
    return True, ""


def validate_filename(name: str) -> tuple[bool, str]:
    """
    Validate file/folder name.
    
    Checks for:
    - Empty names
    - Path traversal attempts
    - Forbidden characters
    - Reserved names
    - Length limits
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not name:
        return False, "Name is required"
    
    if len(name) > FILENAME_MAX_LENGTH:
        return False, f"Name must be at most {FILENAME_MAX_LENGTH} characters"
    
    # Check for forbidden characters
    for char in FILENAME_FORBIDDEN_CHARS:
        if char in name:
            return False, f"Name cannot contain '{char}'"
    
    # Check for path traversal
    if '..' in name:
        return False, "Name cannot contain '..'"
    
    # Check for reserved names (Windows compatibility)
    name_lower = name.lower().split('.')[0]  # Get base name without extension
    if name_lower in RESERVED_NAMES:
        return False, f"'{name}' is a reserved name"
    
    # Check for leading/trailing whitespace
    if name != name.strip():
        return False, "Name cannot have leading or trailing whitespace"
    
    # Check for hidden files starting with .
    # Allow but we could restrict if needed
    
    return True, ""


def validate_app_name(app: str) -> tuple[bool, str]:
    """
    Validate virtual process app name.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not app:
        return False, "App name is required"
    
    if len(app) > APP_NAME_MAX_LENGTH:
        return False, f"App name must be at most {APP_NAME_MAX_LENGTH} characters"
    
    if not APP_NAME_PATTERN.match(app):
        return False, "App name can only contain letters, numbers, underscores, and hyphens"
    
    return True, ""


def validate_object_id(oid: str) -> tuple[bool, str]:
    """
    Validate MongoDB ObjectId format.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not oid:
        return False, "ID is required"
    
    try:
        ObjectId(oid)
        return True, ""
    except InvalidId:
        return False, "Invalid ID format"


def sanitize_path(path: str) -> str:
    """
    Sanitize a file path to prevent path traversal.
    
    This normalizes the path and removes any dangerous components.
    """
    if not path:
        return "/"
    
    # Remove any null bytes
    path = path.replace('\0', '')
    
    # Split path and filter out dangerous components
    parts = path.split('/')
    safe_parts = []
    
    for part in parts:
        if not part:
            continue
        if part == '..':
            continue  # Ignore parent directory traversal
        if part == '.':
            continue  # Ignore current directory
        safe_parts.append(part)
    
    if not safe_parts:
        return "/"
    
    return '/' + '/'.join(safe_parts)
