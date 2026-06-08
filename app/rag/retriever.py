"""
RAG retriever — combines embedding search with context formatting.
"""

from app.rag.embeddings import embed_query
from app.rag.vector_store import search_documents
from app.utils.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


def retrieve(
    query: str,
    top_k: int | None = None,
    collection_name: str | None = None,
    category: str | None = None,
) -> list[dict]:
    """
    Retrieve relevant documents for a query.

    Returns list of dicts with 'text', 'metadata', and 'score' keys.
    """
    # Check if the FAISS index is empty first to avoid running the slow PyTorch model
    from app.rag.vector_store import get_collection_stats
    stats = get_collection_stats(collection_name)
    if stats.get("count", 0) == 0:
        logger.info("FAISS index is empty — skipping embedding generation for query")
        return []

    # Generate query embedding
    query_vector = embed_query(query)

    # Build filter
    where = None
    if category:
        where = {"category": category}

    # Search
    results = search_documents(
        query_embedding=query_vector,
        top_k=k,
        collection_name=collection_name,
        where=where,
    )

    # Format results
    documents = []
    if results and results.get("documents") and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            distance = results["distances"][0][i] if results.get("distances") else 0
            metadata = results["metadatas"][0][i] if results.get("metadatas") else {}
            documents.append({
                "text": doc,
                "metadata": metadata,
                "score": round(1 - distance, 4),  # Convert distance to similarity
            })

    logger.info(f"Retrieved {len(documents)} documents for query: '{query[:50]}...'")
    return documents


def retrieve_as_context(
    query: str,
    top_k: int | None = None,
    collection_name: str | None = None,
    category: str | None = None,
) -> str:
    """Retrieve documents and format them as a context string for the LLM."""
    docs = retrieve(query, top_k, collection_name, category)

    if not docs:
        return "No relevant documents found in the knowledge base."

    context_parts = []
    for i, doc in enumerate(docs):
        source = doc["metadata"].get("filename", "Unknown")
        score = doc["score"]
        context_parts.append(
            f"[Source {i + 1}: {source} (relevance: {score:.2f})]\n{doc['text']}"
        )

    return "\n\n---\n\n".join(context_parts)
