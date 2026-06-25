"""
Resume Analysis Specialist Agent.
Uses resume_parser_tool and jd_match_tool.
"""

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.llm.openai_client import get_llm
from app.tools.jd_match_tool import match_job_description
from app.tools.resume_parser_tool import parse_resume
from app.utils.logger import get_logger

logger = get_logger(__name__)

RESUME_AGENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a Resume Analysis Specialist Agent.
Your expertise is in:
1. Analyzing resumes for skills, strengths, and weaknesses
2. Calculating ATS compatibility scores
3. Matching resumes against job descriptions
4. Providing actionable improvement suggestions

Use your tools to analyze resumes and match them against job descriptions.
Be specific, data-driven, and constructive in your analysis.
Always provide the ATS score and specific skill gaps."""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])


def create_resume_agent() -> AgentExecutor:
    """Create the resume analysis agent with tools."""
    llm = get_llm(temperature=0.3)
    tools = [parse_resume, match_job_description]

    agent = create_openai_tools_agent(llm, tools, RESUME_AGENT_PROMPT)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
    )
