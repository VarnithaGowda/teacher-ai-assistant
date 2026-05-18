"""
ai_services/gemini_client.py - Gemini LLM client using LangChain
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_llm(temperature: float = 0.7) -> ChatGoogleGenerativeAI:
    """
    Return a cached Gemini 1.5 Flash LLM instance.
    
    Args:
        temperature: Creativity level (0=deterministic, 1=creative)
    
    Note: lru_cache caches by args, so different temperatures get different instances.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in environment variables")

    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        convert_system_message_to_human=True,  # Gemini compatibility
    )


async def generate_text(prompt: str, temperature: float = 0.7) -> str:
    """
    Simple text generation using Gemini.
    
    Args:
        prompt: The full prompt string
        temperature: Creativity level
    
    Returns:
        Generated text string
    """
    try:
        llm = get_llm(temperature)
        response = await llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        logger.error(f"Gemini generation error: {e}")
        raise
