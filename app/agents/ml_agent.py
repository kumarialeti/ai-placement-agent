"""
ML/NLP/Deep Learning Specialist Agent.
Covers machine learning, NLP, transformers, and LLM concepts.
"""

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.llm.openai_client import get_llm
from app.tools.interview_tool import generate_interview_questions
from app.tools.search_tool import search_knowledge_base
from app.utils.logger import get_logger

logger = get_logger(__name__)

ML_AGENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an ML/NLP/Deep Learning Specialist Agent.
Your expertise covers:
1. Machine Learning — supervised, unsupervised, reinforcement learning
2. Natural Language Processing — text processing, sentiment analysis, NER
3. Deep Learning — neural networks, CNNs, RNNs, LSTMs
4. Transformers — attention mechanism, BERT, GPT, fine-tuning
5. LLMs — prompt engineering, RAG, embeddings, vector databases

When explaining concepts:
- Start with intuition, then get technical
- Use analogies and real-world examples
- Include mathematical formulations where helpful
- Mention practical applications and use cases
- Reference relevant papers or resources"""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])


def create_ml_agent() -> AgentExecutor:
    """Create the ML/NLP specialist agent with tools."""
    llm = get_llm(temperature=0.5)
    tools = [generate_interview_questions, search_knowledge_base]

    agent = create_openai_tools_agent(llm, tools, ML_AGENT_PROMPT)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
    )
