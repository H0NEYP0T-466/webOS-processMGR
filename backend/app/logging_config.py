"""Logging configuration with emoji-rich messages."""
import logging
import sys


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Set up logging with emoji-rich format."""
    logger = logging.getLogger("webos")
    
    # Clear existing handlers
    logger.handlers.clear()
    
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    logger.addHandler(handler)
    
    return logger


logger = setup_logging()


def info_emoji(emoji: str, msg: str) -> None:
    """Log an info message with an emoji prefix."""
    logger.info(f"{emoji} {msg}")


def error_emoji(emoji: str, msg: str) -> None:
    """Log an error message with an emoji prefix."""
    logger.error(f"{emoji} {msg}")


def warning_emoji(emoji: str, msg: str) -> None:
    """Log a warning message with an emoji prefix."""
    logger.warning(f"{emoji} {msg}")
