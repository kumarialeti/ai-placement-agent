"""
Embedding generation wrapper.
"""

from app.llm.openai_client import get_embeddings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def get_embedding_function():
    """Get the embedding function for ChromaDB."""
    return get_embeddings()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts."""
    embeddings_model = get_embeddings()
    embeddings = embeddings_model.embed_documents(texts)
    logger.info(f"Generated embeddings for {len(texts)} texts (dim={len(embeddings[0])})")
    return embeddings


def embed_query(query: str) -> list[float]:
    """Generate embedding for a single query."""
    embeddings_model = get_embeddings()
    return embeddings_model.embed_query(query)
