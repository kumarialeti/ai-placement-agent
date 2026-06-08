"""
FAISS vector store management — persistent storage with serialization.
Replaces ChromaDB to avoid C++ build tool dependency on Windows.
"""

import json
import os
import pickle

import faiss
import numpy as np

from app.utils.config import get_settings
from app.utils.helpers import ensure_directory
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

# In-memory stores
_faiss_index = None
_documents: list[str] = []
_metadatas: list[dict] = []
_doc_ids: list[str] = []


def _get_store_path() -> str:
    """Get the path for persisting the FAISS index."""
    path = os.path.join(settings.CHROMA_PERSIST_DIR, "faiss_store")
    ensure_directory(path)
    return path


def _load_index():
    """Load FAISS index and metadata from disk if available."""
    global _faiss_index, _documents, _metadatas, _doc_ids

    store_path = _get_store_path()
    index_path = os.path.join(store_path, "index.faiss")
    meta_path = os.path.join(store_path, "metadata.pkl")

    if os.path.exists(index_path) and os.path.exists(meta_path):
        _faiss_index = faiss.read_index(index_path)
        with open(meta_path, "rb") as f:
            data = pickle.load(f)
            _documents = data["documents"]
            _metadatas = data["metadatas"]
            _doc_ids = data["doc_ids"]
        logger.info(f"Loaded FAISS index with {_faiss_index.ntotal} vectors")
    else:
        logger.info("No existing FAISS index found — starting fresh")


def _save_index():
    """Persist FAISS index and metadata to disk."""
    if _faiss_index is None:
        return

    store_path = _get_store_path()
    index_path = os.path.join(store_path, "index.faiss")
    meta_path = os.path.join(store_path, "metadata.pkl")

    faiss.write_index(_faiss_index, index_path)
    with open(meta_path, "wb") as f:
        pickle.dump(
            {"documents": _documents, "metadatas": _metadatas, "doc_ids": _doc_ids}, f
        )
    logger.info(f"Saved FAISS index with {_faiss_index.ntotal} vectors")


def get_or_create_collection(collection_name: str | None = None):
    """Initialize FAISS index if not already loaded."""
    global _faiss_index
    if _faiss_index is None:
        _load_index()
    return True  # Compatibility return


def add_documents(
    texts: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict],
    ids: list[str],
    collection_name: str | None = None,
):
    """Add documents with embeddings to the FAISS index."""
    global _faiss_index, _documents, _metadatas, _doc_ids

    vectors = np.array(embeddings, dtype=np.float32)
    dim = vectors.shape[1]

    # Create index if doesn't exist
    if _faiss_index is None:
        _faiss_index = faiss.IndexFlatIP(dim)  # Inner product (cosine sim with normalized vectors)
        logger.info(f"Created new FAISS index with dimension {dim}")

    # Normalize for cosine similarity
    faiss.normalize_L2(vectors)

    # Add to index
    _faiss_index.add(vectors)

    # Store metadata
    _documents.extend(texts)
    _metadatas.extend(metadatas)
    _doc_ids.extend(ids)

    # Persist
    _save_index()

    logger.info(f"Added {len(texts)} documents — Total: {_faiss_index.ntotal}")


def search_documents(
    query_embedding: list[float],
    top_k: int = 5,
    collection_name: str | None = None,
    where: dict | None = None,
) -> dict:
    """Search for similar documents using FAISS."""
    global _faiss_index

    if _faiss_index is None:
        _load_index()

    if _faiss_index is None or _faiss_index.ntotal == 0:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    # Prepare query vector
    query_vec = np.array([query_embedding], dtype=np.float32)
    faiss.normalize_L2(query_vec)

    # Search
    k = min(top_k, _faiss_index.ntotal)
    distances, indices = _faiss_index.search(query_vec, k)

    # Filter by metadata if 'where' is specified
    result_docs = []
    result_metas = []
    result_dists = []

    for i, idx in enumerate(indices[0]):
        if idx == -1:
            continue

        meta = _metadatas[idx] if idx < len(_metadatas) else {}

        # Apply metadata filter
        if where:
            match = all(meta.get(k) == v for k, v in where.items())
            if not match:
                continue

        result_docs.append(_documents[idx] if idx < len(_documents) else "")
        result_metas.append(meta)
        result_dists.append(float(1 - distances[0][i]))  # Convert similarity to distance

    return {
        "documents": [result_docs],
        "metadatas": [result_metas],
        "distances": [result_dists],
    }


def delete_collection(collection_name: str):
    """Reset the FAISS index."""
    global _faiss_index, _documents, _metadatas, _doc_ids
    _faiss_index = None
    _documents = []
    _metadatas = []
    _doc_ids = []

    store_path = _get_store_path()
    for f in ["index.faiss", "metadata.pkl"]:
        path = os.path.join(store_path, f)
        if os.path.exists(path):
            os.remove(path)

    logger.info(f"Deleted collection: {collection_name}")


def get_collection_stats(collection_name: str | None = None) -> dict:
    """Get index statistics."""
    global _faiss_index
    if _faiss_index is None:
        _load_index()

    return {
        "name": collection_name or settings.CHROMA_COLLECTION_NAME,
        "count": _faiss_index.ntotal if _faiss_index else 0,
    }
