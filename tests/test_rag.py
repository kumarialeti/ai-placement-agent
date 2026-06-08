"""
RAG pipeline tests.
"""

import pytest

from app.rag.chunking import chunk_text, chunk_document_with_metadata


def test_chunk_text_basic():
    """Test basic text chunking."""
    text = "Hello world. " * 200  # Long text
    chunks = chunk_text(text, chunk_size=100, chunk_overlap=20)
    assert len(chunks) > 1
    assert all(len(c) <= 150 for c in chunks)  # Allow some overflow


def test_chunk_text_short():
    """Test chunking short text."""
    text = "Short text."
    chunks = chunk_text(text, chunk_size=100)
    assert len(chunks) == 1
    assert chunks[0] == "Short text."


def test_chunk_text_empty():
    """Test chunking empty text."""
    chunks = chunk_text("", chunk_size=100)
    assert len(chunks) == 0 or chunks == [""]


def test_chunk_document_with_metadata():
    """Test chunking with metadata."""
    text = "Hello world. " * 200
    metadata = {"filename": "test.pdf", "category": "dsa"}
    result = chunk_document_with_metadata(text, metadata, chunk_size=100, chunk_overlap=20)
    assert len(result) > 1
    for item in result:
        assert "text" in item
        assert "metadata" in item
        assert item["metadata"]["filename"] == "test.pdf"
        assert item["metadata"]["category"] == "dsa"
        assert "chunk_index" in item["metadata"]


def test_chunk_consistency():
    """Test that chunking is deterministic."""
    text = "Python is a great programming language. " * 100
    chunks1 = chunk_text(text, chunk_size=200, chunk_overlap=50)
    chunks2 = chunk_text(text, chunk_size=200, chunk_overlap=50)
    assert chunks1 == chunks2
