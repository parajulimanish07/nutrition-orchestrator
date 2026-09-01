from typing import List, Dict, Any, Optional
from langchain_core.messages import AIMessage, HumanMessage
from src.graph.state import AgentState
from src.tools.macro_math import calculate_remaining_macros, evaluate_meal_selection
from src.tools.menu_search import local_menu_search
from src.models.schemas import MenuItem, MealValidationResult


def supervisor_node(state: AgentState) -> Dict[str, Any]:
    """
    Supervisor Agent node:
    - Calculates initial remaining macro budget.
    - Extracts preferences from user messages.
    - Evaluates if final meal plan is mathematically validated and synthesizes final output.
    """
    # 1. Ensure remaining macros are calculated
    user_macros = state.get("user_macros")
    remaining = calculate_remaining_macros(user_macros)

    # 2. Extract cuisine / vendor preference from user prompt if not already set
    cuisine_pref = state.get("cuisine_preference")
    if not cuisine_pref:
        user_text = ""
        for msg in state.get("messages", []):
            if isinstance(msg, HumanMessage):
                user_text += " " + str(msg.content)
            elif isinstance(msg, dict) and msg.get("role") == "user":
                user_text += " " + str(msg.get("content", ""))

        user_text_lower = user_text.lower()
        if "thai" in user_text_lower or "yum yai" in user_text_lower:
            cuisine_pref = "Yum Yai Thai"
        elif "momo" in user_text_lower or "dumpling" in user_text_lower or "tapari" in user_text_lower:
            cuisine_pref = "Tapari Momo"
        elif "kfc" in user_text_lower or "chicken" in user_text_lower or "burger" in user_text_lower:
            cuisine_pref = "KFC"

    # 3. Check if we have completed math validation
    math_val: Optional[MealValidationResult] = state.get("math_validation")
    proposed: List[MenuItem] = state.get("proposed_meals", [])
    iteration: int = state.get("iteration_count", 0)
    max_iterations: int = state.get("max_iterations", 3)

    if math_val is not None:
        # We are returning from Math Worker
        if math_val.fits_macros or iteration >= max_iterations:
            meal_items_summary = [
                {
                    "restaurant": item.restaurant,
                    "name": item.name,
                    "calories": item.calories,
                    "protein_g": item.protein_g,
                    "price": item.price,
                }
                for item in proposed
            ]
            
            final_plan = {
                "status": "APPROVED" if math_val.fits_macros else "APPROXIMATION_MAX_ITERATIONS",
                "proposed_meals": meal_items_summary,
                "nutrition_summary": {
                    "total_calories": math_val.total_calories,
                    "total_protein_g": math_val.total_protein_g,
                    "remaining_calories_after_meal": math_val.remaining_calories_after_meal,
                    "remaining_protein_after_meal": math_val.remaining_protein_after_meal,
                    "fits_calorie_budget": math_val.fits_macros,
                    "meets_protein_target": math_val.is_protein_target_met,
                },
                "feedback": math_val.feedback,
                "iterations_used": iteration,
            }
            
            summary_text = (
                f"Supervisor: Final meal plan confirmed. Total {math_val.total_calories} kcal, "
                f"{math_val.total_protein_g}g protein across {len(proposed)} items. {math_val.feedback}"
            )
            
            return {
                "remaining_macros": remaining,
                "cuisine_preference": cuisine_pref,
                "final_plan": final_plan,
                "status": "COMPLETED",
                "messages": [AIMessage(content=summary_text)],
            }

    # Initial delegation to Menu Worker
    delegation_msg = (
        f"Supervisor: Delegating to Menu Worker for {cuisine_pref or 'all restaurants'}. "
        f"Target calorie budget: {remaining.remaining_calories} kcal, protein needed: {max(0, remaining.remaining_protein_g)}g."
    )

    return {
        "remaining_macros": remaining,
        "cuisine_preference": cuisine_pref,
        "status": "DELEGATING_TO_MENU_WORKER",
        "messages": [AIMessage(content=delegation_msg)],
    }


def menu_worker_node(state: AgentState) -> Dict[str, Any]:
    """
    Menu Worker Node:
    - Queries local restaurant menus using filters (restaurant, calories, protein).
    - Incorporates error-correction feedback from previous iterations.
    - Proposes a candidate meal combination.
    """
    cuisine_pref = state.get("cuisine_preference")
    remaining = state.get("remaining_macros")
    feedback_history = state.get("feedback_history", [])
    iteration = state.get("iteration_count", 0)

    max_cals = remaining.remaining_calories if remaining else 2400
    min_protein = max(0, remaining.remaining_protein_g) if remaining else 50

    # Error-correction heuristics based on past feedback loops
    if feedback_history:
        latest_feedback = feedback_history[-1]
        if "overshoot" in latest_feedback.lower():
            # Apply tighter calorie restriction per individual item
            max_cals = int(max_cals * 0.7)

    # 1. Search candidate items
    candidates = local_menu_search(restaurant=cuisine_pref)
    if not candidates:
        # Fallback to all restaurants if specific preference gave no results
        candidates = local_menu_search()

    # 2. Select best matching combination
    selected_items: List[MenuItem] = []
    current_selected_cals = 0

    # Sort candidates favoring higher protein-to-calorie ratio
    candidates.sort(key=lambda x: (x.protein_g / max(1, x.calories)), reverse=True)

    for item in candidates:
        if current_selected_cals + item.calories <= max_cals:
            selected_items.append(item)
            current_selected_cals += item.calories
            # Cap at 2 items for a single meal session unless more are needed
            if len(selected_items) >= 2 or current_selected_cals >= (max_cals * 0.8):
                break

    # If still empty (e.g. very strict budget), pick the single lowest calorie item
    if not selected_items and candidates:
        lowest_cal_item = min(candidates, key=lambda x: x.calories)
        selected_items.append(lowest_cal_item)

    items_desc = ", ".join(f"{i.restaurant} - {i.name} ({i.calories} kcal, {i.protein_g}g P)" for i in selected_items)
    worker_msg = f"Menu Worker (Iteration {iteration + 1}): Selected candidate meals: [{items_desc}]. Passing to Math Worker."

    return {
        "proposed_meals": selected_items,
        "status": "MEALS_PROPOSED",
        "messages": [AIMessage(content=worker_msg)],
    }


def math_worker_node(state: AgentState) -> Dict[str, Any]:
    """
    Math Worker Node:
    - Runs exact deterministic calculation on proposed items.
    - Assesses fit against user macro budget.
    - Increments iteration count and generates feedback.
    """
    user_macros = state["user_macros"]
    proposed = state.get("proposed_meals", [])
    current_iteration = state.get("iteration_count", 0) + 1
    feedback_history = list(state.get("feedback_history", []))

    # Deterministic calculation using our Phase 1 tool
    val_result = evaluate_meal_selection(user_macros, proposed)
    feedback_history.append(val_result.feedback)

    worker_msg = (
        f"Math Worker: Validated selection (Iteration {current_iteration}). "
        f"Total: {val_result.total_calories} kcal, {val_result.total_protein_g}g protein. "
        f"Fits budget: {val_result.fits_macros}. Feedback: {val_result.feedback}"
    )

    return {
        "math_validation": val_result,
        "iteration_count": current_iteration,
        "feedback_history": feedback_history,
        "status": "VALIDATION_COMPLETE",
        "messages": [AIMessage(content=worker_msg)],
    }
