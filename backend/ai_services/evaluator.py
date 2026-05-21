"""
ai_services/evaluator.py - AI Student Answer Evaluation Service

Evaluates student answers against rubrics and generates detailed feedback.
"""

import json
import re
from typing import Optional
from datetime import datetime
from bson import ObjectId
import logging

from database.connection import get_database
from prompts.evaluation_prompt import evaluation_prompt
from ai_services.gemini_client import get_llm

logger = logging.getLogger(__name__)


def _extract_json_from_response(text: str) -> dict:
    """
    Extract the JSON block from the AI response.
    The evaluation prompt asks the AI to include a JSON block at the end.
    """
    # Look for ```json ... ``` block
    json_match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Fallback: try to find any JSON-like structure
    json_match = re.search(r"\{[^{}]*\"marks_obtained\"[^{}]*\}", text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            pass

    # Default fallback values
    return {
        "marks_obtained": 0,
        "total_marks": 50,
        "percentage": 0,
        "grade": "N/A",
        "strengths": [],
        "improvements": [],
    }


def _calculate_grade(percentage: float) -> str:
    """Convert percentage to letter grade."""
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 75:
        return "B+"
    elif percentage >= 65:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 50:
        return "D"
    else:
        return "F"


async def evaluate_student_answer(
    user_id: str,
    student_name: str,
    assignment_title: str,
    student_answer: str,
    rubric_text: str,
    total_marks: int = 50,
    model_answer: Optional[str] = None,
    rubric_id: Optional[str] = None,
) -> dict:
    """
    Evaluate a student's answer using AI.
    
    Args:
        user_id: Teacher's user ID
        student_name: Name of the student
        assignment_title: Title of the assignment
        student_answer: The student's submitted answer text
        rubric_text: The grading rubric
        total_marks: Maximum marks
        model_answer: Optional ideal answer for comparison
        rubric_id: Optional reference to saved rubric
    
    Returns:
        Dict with evaluation results including marks, grade, and feedback
    """
    # Format the evaluation prompt
    formatted_prompt = evaluation_prompt.format(
        assignment_title=assignment_title,
        student_name=student_name,
        rubric=rubric_text,
        model_answer=model_answer or "Not provided",
        student_answer=student_answer,
        total_marks=total_marks,
    )

    llm = get_llm(temperature=0.3)  # Low temperature for consistent evaluation
    logger.info(f"Evaluating answer for student: {student_name}")
    response = await llm.ainvoke(formatted_prompt)
    full_feedback = response.content

    # Extract structured data from the response
    eval_data = _extract_json_from_response(full_feedback)

    marks_obtained = float(eval_data.get("marks_obtained", 0))
    percentage = (marks_obtained / total_marks * 100) if total_marks > 0 else 0
    grade = _calculate_grade(percentage)

    # Save to MongoDB
    db = get_database()
    doc = {
        "user_id": user_id,
        "student_name": student_name,
        "assignment_title": assignment_title,
        "rubric_id": rubric_id,
        "marks_obtained": marks_obtained,
        "total_marks": total_marks,
        "percentage": round(percentage, 2),
        "grade": grade,
        "feedback": full_feedback,
        "strengths": eval_data.get("strengths", []),
        "improvements": eval_data.get("improvements", []),
        "created_at": datetime.utcnow(),
    }
    result = await db.evaluations.insert_one(doc)

    return {
        "id": str(result.inserted_id),
        "student_name": student_name,
        "assignment_title": assignment_title,
        "marks_obtained": marks_obtained,
        "total_marks": total_marks,
        "percentage": round(percentage, 2),
        "grade": grade,
        "feedback": full_feedback,
        "strengths": eval_data.get("strengths", []),
        "improvements": eval_data.get("improvements", []),
        "created_at": doc["created_at"],
    }


async def get_evaluations(user_id: str, limit: int = 50) -> list:
    """Retrieve all evaluations for a teacher."""
    db = get_database()
    cursor = db.evaluations.find(
        {"user_id": user_id},
        sort=[("created_at", -1)],
        limit=limit,
    )
    evals = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        evals.append(doc)
    return evals
