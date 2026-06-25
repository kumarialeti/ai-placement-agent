"""
LangChain Tool — Calculator for DSA complexity analysis.
"""

import math

from langchain_core.tools import tool


@tool
def calculate_complexity(expression: str) -> str:
    """Calculate mathematical expressions for time/space complexity analysis.
    
    Args:
        expression: A mathematical expression to evaluate (e.g., '2**20', 'math.log2(1000000)').
    
    Returns:
        The result of the calculation as a string.
    """
    # Safe evaluation with math functions
    allowed_names = {
        "abs": abs, "round": round, "min": min, "max": max,
        "pow": pow, "sum": sum, "len": len,
        "math": math, "log": math.log, "log2": math.log2,
        "log10": math.log10, "sqrt": math.sqrt,
        "factorial": math.factorial, "ceil": math.ceil, "floor": math.floor,
    }

    try:
        result = eval(expression, {"__builtins__": {}}, allowed_names)
        return f"Result: {expression} = {result}"
    except Exception as e:
        return f"Error evaluating '{expression}': {str(e)}"
