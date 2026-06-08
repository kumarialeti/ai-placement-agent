"""
LangChain ChatGroq wrapper with configuration.
(Kept filename as openai_client.py for backward compatibility with imports)
"""

from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings

from app.utils.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


def get_llm(temperature: float = 0.7, max_tokens: int = 4096):
    """Get configured ChatGroq instance with a fallback model."""
    primary_llm = ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=temperature,
        max_tokens=max_tokens,
        max_retries=0,  # Fail fast so fallback kicks in
    )
    
    # Fallback to a smaller, faster model with higher rate limits
    fallback_llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=settings.GROQ_API_KEY,
        temperature=temperature,
        max_tokens=max_tokens,
        max_retries=0,
    )
    
    return primary_llm.with_fallbacks([fallback_llm])


def get_structured_llm(output_schema, temperature: float = 0.3):
    """Get LLM with structured output and fallback."""
    primary_llm = ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=temperature,
        max_retries=0,
    ).with_structured_output(output_schema)
    
    fallback_llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=settings.GROQ_API_KEY,
        temperature=temperature,
        max_retries=0,
    ).with_structured_output(output_schema)
    
    return primary_llm.with_fallbacks([fallback_llm])


def get_embeddings() -> HuggingFaceEmbeddings:
    """Get HuggingFace embeddings model."""
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
    )
