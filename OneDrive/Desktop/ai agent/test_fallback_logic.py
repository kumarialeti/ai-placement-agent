import os
from langchain_groq import ChatGroq
from app.llm.output_parsers import AnswerEvaluationOutput
from dotenv import load_dotenv

load_dotenv()

primary_llm = ChatGroq(model="llama-3.3-70b-versatile", max_retries=0).with_structured_output(AnswerEvaluationOutput)
fallback_llm = ChatGroq(model="llama-3.1-8b-instant", max_retries=0).with_structured_output(AnswerEvaluationOutput)

llm_with_fallback = primary_llm.with_fallbacks([fallback_llm])

try:
    res = llm_with_fallback.invoke("Evaluate this answer: 'I used RAG'. Score it out of 10. Assume the question was 'What is RAG?'")
    print(f"Success: {res}")
except Exception as e:
    print(f"Failed: {type(e).__name__} - {e}")
