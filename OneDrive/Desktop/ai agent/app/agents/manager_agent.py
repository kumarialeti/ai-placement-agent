"""
Manager Agent — Routes to specialist agents based on intent.
This is the orchestrator of the multi-agent system.
"""

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool

from app.agents.dsa_agent import create_dsa_agent
from app.agents.interview_agent import create_interview_agent
from app.agents.ml_agent import create_ml_agent
from app.agents.resume_agent import create_resume_agent
from app.agents.job_agent import create_job_agent
from app.llm.openai_client import get_llm
from app.tools.search_tool import search_knowledge_base
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Lazy-loaded agent instances
_agents = {}


def _get_agent(name: str) -> AgentExecutor:
    """Get or create a specialist agent by name."""
    if name not in _agents:
        creators = {
            "resume": create_resume_agent,
            "interview": create_interview_agent,
            "dsa": create_dsa_agent,
            "ml": create_ml_agent,
            "job": create_job_agent,
        }
        if name in creators:
            _agents[name] = creators[name]()
    return _agents[name]


@tool
def delegate_to_resume_agent(query: str) -> str:
    """Delegate to Resume Agent for resume analysis, ATS scoring, and skill extraction.
    
    Args:
        query: The user's query about resume analysis.
    
    Returns:
        The resume agent's response.
    """
    agent = _get_agent("resume")
    result = agent.invoke({"input": query})
    return result["output"]


@tool
def delegate_to_interview_agent(query: str) -> str:
    """Delegate to Interview Agent for question generation and mock interviews.
    
    Args:
        query: The user's query about interview preparation.
    
    Returns:
        The interview agent's response.
    """
    agent = _get_agent("interview")
    result = agent.invoke({"input": query})
    return result["output"]


@tool
def delegate_to_dsa_agent(query: str) -> str:
    """Delegate to DSA Agent for data structure, algorithm, and coding problems.
    
    Args:
        query: The user's query about DSA topics.
    
    Returns:
        The DSA agent's response.
    """
    agent = _get_agent("dsa")
    result = agent.invoke({"input": query})
    return result["output"]


@tool
def delegate_to_ml_agent(query: str) -> str:
    """Delegate to ML/NLP Agent for machine learning, NLP, deep learning, and transformer concepts.
    
    Args:
        query: The user's query about ML/NLP topics.
    
    Returns:
        The ML agent's response.
    """
    agent = _get_agent("ml")
    result = agent.invoke({"input": query})
    return result["output"]


@tool
def delegate_to_job_agent(query: str) -> str:
    """Delegate to Job Agent for job description analysis, career advice, and study roadmaps.
    
    Args:
        query: The user's query about job matching or career planning.
    
    Returns:
        The job agent's response.
    """
    agent = _get_agent("job")
    result = agent.invoke({"input": query})
    return result["output"]


MANAGER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are the Manager Agent of an AI Placement Preparation system.
Your role is to understand what the user needs and delegate to the right specialist:

1. **Resume Agent** — Resume analysis, ATS scoring, skill extraction, resume improvements
2. **Interview Agent** — Interview questions, mock interviews, answer practice
3. **DSA Agent** — Data structures, algorithms, coding problems, complexity
4. **ML Agent** — Machine learning, NLP, deep learning, transformers, LLMs
5. **Job Agent** — Job description analysis, career advice, study roadmaps
6. **Knowledge Search** — Search uploaded study materials for specific concepts

Choose the most appropriate specialist based on the user's question.
If the query is a simple greeting or general question, respond directly.
For complex queries, you may delegate to multiple agents sequentially."""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])


def create_manager_agent() -> AgentExecutor:
    """Create the manager agent that orchestrates specialist agents."""
    llm = get_llm(temperature=0.3)
    tools = [
        delegate_to_resume_agent,
        delegate_to_interview_agent,
        delegate_to_dsa_agent,
        delegate_to_ml_agent,
        delegate_to_job_agent,
        search_knowledge_base,
    ]

    agent = create_openai_tools_agent(llm, tools, MANAGER_PROMPT)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=10,
        return_intermediate_steps=True,
    )
