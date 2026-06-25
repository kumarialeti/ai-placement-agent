"""
DSA & Problem Solving Specialist Agent.
Focuses on data structures, algorithms, and complexity analysis.
"""

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.llm.openai_client import get_llm
from app.tools.calculator_tool import calculate_complexity
from app.tools.interview_tool import generate_interview_questions
from app.tools.search_tool import search_knowledge_base
from app.utils.logger import get_logger

logger = get_logger(__name__)

DSA_AGENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a DSA (Data Structures & Algorithms) Specialist Agent.
Your expertise is in:
1. Explaining data structures and algorithms with examples
2. Solving coding problems with optimal approaches
3. Time and space complexity analysis
4. Generating DSA interview questions
5. Creating problem-solving roadmaps

Always provide:
- Clear explanation of the approach
- Time and space complexity (Big-O notation)
- Code examples in Python when relevant
- Edge cases to consider
- Related problems for practice"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])


def create_dsa_agent() -> AgentExecutor:
    """Create the DSA specialist agent with tools."""
    llm = get_llm(temperature=0.3)
    tools = [generate_interview_questions, search_knowledge_base, calculate_complexity]

    agent = create_openai_tools_agent(llm, tools, DSA_AGENT_PROMPT)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
    )
