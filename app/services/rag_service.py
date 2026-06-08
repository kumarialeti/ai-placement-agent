"""
RAG service — document upload, indexing, and search.
"""

import os
import uuid

import aiofiles
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.tracker import track_rag_search
from app.database.crud import create_document
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed_texts
from app.rag.loader import load_document
from app.rag.retriever import retrieve
from app.rag.vector_store import add_documents, get_collection_stats
from app.utils.config import get_settings
from app.utils.helpers import ensure_directory
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


async def upload_and_index_document(
    db: AsyncSession,
    file_content: bytes,
    filename: str,
    category: str,
) -> dict:
    """Upload a document, chunk it, embed it, and index in ChromaDB."""

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, category)
    ensure_directory(upload_dir)

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(upload_dir, unique_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)

    logger.info(f"Document saved: {file_path}")

    # Extract text
    text = load_document(file_path)

    # Chunk
    chunks = chunk_text(text)

    # Embed
    embeddings = embed_texts(chunks)

    # Prepare metadata and IDs
    doc_id = uuid.uuid4().hex
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {"filename": filename, "category": category, "chunk_index": i, "doc_id": doc_id}
        for i in range(len(chunks))
    ]

    # Index in ChromaDB
    add_documents(
        texts=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
    )

    # Save to DB
    await create_document(db, filename, file_path, category, len(chunks))

    logger.info(f"Indexed {len(chunks)} chunks from {filename} in category '{category}'")

    return {
        "filename": filename,
        "category": category,
        "chunk_count": len(chunks),
        "message": f"Successfully indexed {len(chunks)} chunks from {filename}",
    }


async def search_documents(
    query: str,
    user_id: int,
    category: str | None = None,
    top_k: int = 5,
) -> dict:
    """Search the knowledge base."""
    track_rag_search(user_id, query)

    results = retrieve(query=query, top_k=top_k, category=category)

    return {
        "query": query,
        "results": results,
        "count": len(results),
    }


def get_stats() -> dict:
    """Get vector store statistics."""
    return get_collection_stats()
