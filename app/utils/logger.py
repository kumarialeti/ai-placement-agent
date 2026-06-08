"""
Structured logging with rich formatting.
"""

import logging
import sys

from rich.console import Console
from rich.logging import RichHandler

console = Console()


def get_logger(name: str) -> logging.Logger:
    """Create a rich-formatted logger."""
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = RichHandler(
            console=console,
            show_time=True,
            show_path=True,
            markup=True,
            rich_tracebacks=True,
        )
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)

        # Also log to file
        file_handler = logging.FileHandler("app.log", encoding="utf-8")
        file_handler.setFormatter(
            logging.Formatter("%(asctime)s | %(name)s | %(levelname)s | %(message)s")
        )
        logger.addHandler(file_handler)

    return logger
