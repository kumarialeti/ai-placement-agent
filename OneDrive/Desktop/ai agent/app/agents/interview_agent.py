"""
Interview Preparation Specialist Agent.
Generates questions and conducts mock interviews.
"""

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.llm.openai_client import get_llm
from app.tools.interview_tool import generate_interview_questions
from app.tools.search_tool import search_knowledge_base
from app.utils.logger import get_logger

logger = get_logger(__name__)

INTERVIEW_AGENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an Interview Preparation Specialist Agent.
Your expertise is in:
1. Generating topic-specific interview questions at various difficulty levels
2. Conducting mock interviews
3. Evaluating candidate answers
4. Providing preparation strategies and tips

When generating questions, cover both theoretical and practical aspects.
When conducting mock interviews, be encouraging but honest in feedback.
Use the knowledge base search tool for topic-specific information."""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])


def create_interview_agent() -> AgentExecutor:
    """Create the interview preparation agent with tools."""
    llm = get_llm(temperature=0.5)
    tools = [generate_interview_questions, search_knowledge_base]

    agent = create_openai_tools_agent(llm, tools, INTERVIEW_AGENT_PROMPT)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
    )
