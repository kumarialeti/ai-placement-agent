import os
from langchain_groq import ChatGroq
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class TestSchema(BaseModel):
    score: int
    feedback: str

models = [
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
    "llama3-8b-8192"
]

for model in models:
    try:
        print(f"Testing {model}...")
        llm = ChatGroq(model=model, max_retries=0).with_structured_output(TestSchema)
        res = llm.invoke("Evaluate this answer: 'I used RAG'. Score it out of 10.")
        print(f"Success with {model}: {res}")
    except Exception as e:
        print(f"Failed with {model}: {e}")
