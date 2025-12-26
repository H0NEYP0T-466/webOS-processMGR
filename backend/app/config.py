"""Configuration settings for WebOS backend."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "webos"
    
    # JWT
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Admin
    ADMIN_USER: str = "admin"
    ADMIN_PASS: str = "admin123"
    
    # Server
    CORS_ORIGINS: str = "*"
    LOG_LEVEL: str = "INFO"
    
    # Performance monitoring
    SLOW_REQUEST_THRESHOLD_MS: float = 500.0
    
    # Application info
    APP_VERSION: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
