"""
Job Description Analysis & Career Advice Agent.
"""

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.llm.openai_client import get_llm
from app.tools.jd_match_tool import match_job_description
from app.tools.roadmap_tool import generate_roadmap
from app.utils.logger import get_logger

logger = get_logger(__name__)

JOB_AGENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a Job Description Analysis & Career Advisor Agent.
Your expertise is in:
1. Analyzing job descriptions for key requirements
2. Matching candidate profiles against job requirements
3. Identifying skill gaps and improvement areas
4. Providing career advice and transition strategies
5. Creating personalized study roadmaps

Be practical and specific in your advice.
Consider industry trends and market demand."""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])


def create_job_agent() -> AgentExecutor:
    """Create the job analysis agent with tools."""
    llm = get_llm(temperature=0.5)
    tools = [match_job_description, generate_roadmap]

    agent = create_openai_tools_agent(llm, tools, JOB_AGENT_PROMPT)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
    )
