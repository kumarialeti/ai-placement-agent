"""
Text chunking for RAG pipeline using LangChain's text splitters.
"""

from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.utils.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


def get_text_splitter(
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> RecursiveCharacterTextSplitter:
    """Create a configured text splitter."""
    final_chunk_size = chunk_size or settings.CHUNK_SIZE
    final_chunk_overlap = chunk_overlap if chunk_overlap is not None else settings.CHUNK_OVERLAP
    
    if final_chunk_overlap >= final_chunk_size:
        final_chunk_overlap = final_chunk_size // 2
        
    return RecursiveCharacterTextSplitter(
        chunk_size=final_chunk_size,
        chunk_overlap=final_chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


def chunk_text(text: str, chunk_size: int | None = None, chunk_overlap: int | None = None) -> list[str]:
    """Split text into chunks for embedding."""
    splitter = get_text_splitter(chunk_size, chunk_overlap)
    chunks = splitter.split_text(text)
    logger.info(f"Split text into {len(chunks)} chunks (avg {sum(len(c) for c in chunks) // max(len(chunks), 1)} chars)")
    return chunks


def chunk_document_with_metadata(
    text: str,
    metadata: dict,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[dict]:
    """Split text into chunks and attach metadata to each chunk."""
    splitter = get_text_splitter(chunk_size, chunk_overlap)
    chunks = splitter.split_text(text)

    return [
        {
            "text": chunk,
            "metadata": {**metadata, "chunk_index": i, "total_chunks": len(chunks)},
        }
        for i, chunk in enumerate(chunks)
    ]
