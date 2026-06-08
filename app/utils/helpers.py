"""
Utility helper functions.
"""

import os
from pathlib import Path


def ensure_directory(path: str) -> Path:
    """Create directory if it doesn't exist and return Path object."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase."""
    return os.path.splitext(filename)[1].lower()


def truncate_text(text: str, max_length: int = 500) -> str:
    """Truncate text to max_length with ellipsis."""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."
