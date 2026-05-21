"""
ai_services/chatbot.py - Teacher AI Chatbot with RAG support

Maintains conversation history and uses uploaded documents as context.
"""

import uuid
from typing import List, Optional
from datetime import datetime
import logging

from langchain_core.messages import HumanMessage, AIMessage
from database.connection import get_database
from prompts.chatbot_prompt import rag_chat_prompt
from ai_services.gemini_client import get_llm
from vector_store.chroma_client import get_rag_context

logger = logging.getLogger(__name__)

# In-memory session store for conversation history
# In production, use Redis or MongoDB for persistence
_sessions: dict = {}


def _get_or_create_session(session_id: Optional[str]) -> tuple[str, list]:
    """Get existing session or create a new one."""
    if not session_id or session_id not in _sessions:
        session_id = str(uuid.uuid4())
        _sessions[session_id] = []
    return session_id, _sessions[session_id]


async def chat_with_teacher_bot(
    user_id: str,
    message: str,
    session_id: Optional[str] = None,
    use_rag: bool = True,
) -> dict:
    """
    Process a chat message and return an AI response.
    
    Args:
        user_id: Teacher's user ID (for RAG document lookup)
        message: The teacher's question/message
        session_id: Conversation session ID (for history)
        use_rag: Whether to use uploaded documents as context
    
    Returns:
        Dict with session_id, AI message, and sources
    """
    # Get or create conversation session
    session_id, history = _get_or_create_session(session_id)

    # Get RAG context from uploaded documents
    context = ""
    sources = []
    if use_rag:
        context = await get_rag_context(user_id, message, n_results=4)
        # Extract source filenames
        if "Source" in context:
            import re
            sources = re.findall(r"\[Source \d+: (.+?)\]", context)

    # Build LangChain message history
    chat_history = []
    for msg in history[-10:]:  # Keep last 10 messages for context window
        if msg["role"] == "user":
            chat_history.append(HumanMessage(content=msg["content"]))
        else:
            chat_history.append(AIMessage(content=msg["content"]))

    # Format the prompt with context and history
    formatted_messages = rag_chat_prompt.format_messages(
        context=context or "No documents uploaded yet.",
        chat_history=chat_history,
        question=message,
    )

    # Call Gemini
    llm = get_llm(temperature=0.7)
    logger.info(f"Chatbot processing message for user {user_id}")
    response = await llm.ainvoke(formatted_messages)
    ai_response = response.content

    # Update session history
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": ai_response})
    _sessions[session_id] = history

    # Save to MongoDB for persistence
    db = get_database()
    await db.chat_history.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "user_message": message,
        "ai_response": ai_response,
        "sources": sources,
        "created_at": datetime.utcnow(),
    })

    return {
        "session_id": session_id,
        "message": ai_response,
        "sources": sources,
    }


async def get_chat_history(user_id: str, session_id: Optional[str] = None, limit: int = 50) -> list:
    """Retrieve chat history from MongoDB."""
    db = get_database()
    query = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id

    cursor = db.chat_history.find(
        query,
        sort=[("created_at", -1)],
        limit=limit,
    )
    history = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        history.append(doc)
    return list(reversed(history))  # Return in chronological order


async def get_chat_sessions(user_id: str) -> list:
    """Get all unique chat sessions for a user."""
    db = get_database()
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$session_id",
            "last_message": {"$last": "$user_message"},
            "last_activity": {"$max": "$created_at"},
            "message_count": {"$sum": 1},
        }},
        {"$sort": {"last_activity": -1}},
        {"$limit": 20},
    ]
    sessions = []
    async for doc in db.chat_history.aggregate(pipeline):
        sessions.append({
            "session_id": doc["_id"],
            "last_message": doc["last_message"],
            "last_activity": doc["last_activity"],
            "message_count": doc["message_count"],
        })
    return sessions
