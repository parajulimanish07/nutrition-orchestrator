from typing import Literal
from src.graph.state import AgentState


def route_from_supervisor(state: AgentState) -> Literal["menu_worker", "__end__"]:
    """
    Determines next step after Supervisor node runs.
    - If a final verified plan exists or task is complete -> End workflow.
    - Otherwise -> Delegate to Menu Worker.
    """
    if state.get("final_plan") is not None or state.get("status") == "COMPLETED":
        return "__end__"
    return "menu_worker"


def route_from_math_worker(state: AgentState) -> Literal["menu_worker", "supervisor"]:
    """
    Conditional routing edge after Math Worker validates meal macros.
    - If proposed meals fit calorie budget -> Route to Supervisor to finalize.
    - If meals overshoot and iteration_count < max_iterations -> Loop back to Menu Worker for error correction.
    - If max_iterations reached -> Route to Supervisor to assemble best effort response.
    """
    math_val = state.get("math_validation")
    iteration = state.get("iteration_count", 0)
    max_iterations = state.get("max_iterations", 3)

    if math_val and math_val.fits_macros:
        return "supervisor"

    if iteration < max_iterations:
        return "menu_worker"

    return "supervisor"
