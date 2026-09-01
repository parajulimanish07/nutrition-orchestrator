from typing import List, Optional, Annotated, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from src.models.schemas import (
    UserMacros,
    MacroCalculationResult,
    MenuItem,
    MealValidationResult,
)


class AgentState(TypedDict):
    """
    Shared multi-agent execution state for the Precision Nutrition Orchestrator.
    """
    messages: Annotated[List[BaseMessage], add_messages]
    user_macros: UserMacros
    remaining_macros: Optional[MacroCalculationResult]
    cuisine_preference: Optional[str]
    meal_request: Optional[str]
    proposed_meals: List[MenuItem]
    math_validation: Optional[MealValidationResult]
    iteration_count: int
    max_iterations: int
    feedback_history: List[str]
    final_plan: Optional[dict]
    status: str
