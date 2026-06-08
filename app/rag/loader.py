"""
PDF and document loader using PyMuPDF.
"""

from pathlib import Path

import fitz  # PyMuPDF

from app.utils.constants import ALLOWED_EXTENSIONS
from app.utils.logger import get_logger

logger = get_logger(__name__)


def load_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected PDF file, got: {path.suffix}")

    text = ""
    try:
        doc = fitz.open(file_path)
        for page_num, page in enumerate(doc):
            page_text = page.get_text("text")
            text += f"\n--- Page {page_num + 1} ---\n{page_text}"
        doc.close()
        logger.info(f"Loaded PDF: {path.name} ({len(text)} chars)")
    except Exception as e:
        logger.error(f"Error loading PDF {file_path}: {e}")
        raise

    return text.strip()


def load_text_file(file_path: str) -> str:
    """Load a plain text or markdown file."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def load_document(file_path: str) -> str:
    """Load any supported document type."""
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXTENSIONS}")

    if ext == ".pdf":
        return load_pdf(file_path)
    elif ext in {".txt", ".md"}:
        return load_text_file(file_path)
    else:
        raise ValueError(f"Handler not implemented for: {ext}")
