"""
Tool for generating highly tailored cover letters.
"""
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from app.llm.openai_client import get_llm
from app.llm.prompts import COVER_LETTER_PROMPT

class CoverLetterInput(BaseModel):
    resume_text: str = Field(description="The full text of the candidate's resume.")
    job_description: str = Field(description="The full text of the job description.")
    company_name: str = Field(description="The name of the company.")
    job_title: str = Field(description="The job title applying for.")

@tool("generate_cover_letter", args_schema=CoverLetterInput)
def generate_cover_letter(resume_text: str, job_description: str, company_name: str, job_title: str) -> str:
    """Generate a highly tailored, professional cover letter based on a resume and job description."""
    llm = get_llm(temperature=0.7)
    chain = COVER_LETTER_PROMPT | llm
    
    result = chain.invoke({
        "resume_text": resume_text[:3000], # Limit to save tokens
        "job_description": job_description[:3000],
        "company_name": company_name,
        "job_title": job_title
    })
    
    return result.content
