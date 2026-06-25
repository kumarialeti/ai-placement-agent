"""
LangChain Tool — RAG Knowledge Search.
Searches the uploaded knowledge base for answers.
"""

from langchain_core.tools import tool

from app.llm.openai_client import get_llm
from app.rag.prompt import RAG_QA_PROMPT
from app.rag.retriever import retrieve_as_context
from app.utils.logger import get_logger

logger = get_logger(__name__)


@tool
def search_knowledge_base(query: str, category: str = "") -> str:
    """Search the uploaded study materials and knowledge base to answer a question.
    
    Args:
        query: The question or search query.
        category: Optional category filter — 'dsa', 'ml', 'interview', 'aptitude', or empty for all.
    
    Returns:
        An answer based on the retrieved documents.
    """
    logger.info(f"RAG search: '{query[:50]}...' (category: {category or 'all'})")

    # Retrieve context
    context = retrieve_as_context(
        query=query,
        category=category if category else None,
    )

    # Generate answer
    llm = get_llm(temperature=0.3)
    chain = RAG_QA_PROMPT | llm

    response = chain.invoke({
        "context": context,
        "question": query,
    })

    return response.content
