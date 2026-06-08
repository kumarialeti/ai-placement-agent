"""
Tool execution tests.
"""

import pytest

from app.tools.calculator_tool import calculate_complexity


def test_calculator_basic():
    """Test basic calculation."""
    result = calculate_complexity.invoke({"expression": "2 + 3"})
    assert "5" in result


def test_calculator_power():
    """Test power calculation."""
    result = calculate_complexity.invoke({"expression": "2**10"})
    assert "1024" in result


def test_calculator_log():
    """Test log calculation."""
    result = calculate_complexity.invoke({"expression": "math.log2(1024)"})
    assert "10" in result


def test_calculator_factorial():
    """Test factorial."""
    result = calculate_complexity.invoke({"expression": "math.factorial(5)"})
    assert "120" in result


def test_calculator_error():
    """Test invalid expression."""
    result = calculate_complexity.invoke({"expression": "import os"})
    assert "Error" in result
