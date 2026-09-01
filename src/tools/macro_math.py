from typing import List, Union
from src.models.schemas import (
    UserMacros,
    MacroStatus,
    MacroCalculationResult,
    MenuItem,
    ProposedMealItem,
    MealValidationResult,
)


def calculate_remaining_macros(macros: UserMacros) -> MacroCalculationResult:
    """
    Calculates the exact remaining nutritional deficit or surplus.
    The LangGraph agent calls this deterministic tool to verify remaining budget.
    """
    remaining_cals = macros.target_calories - macros.current_calories
    remaining_protein = macros.target_protein - macros.current_protein

    if remaining_cals > 0:
        status: MacroStatus = "deficit"
        status_msg = f"Deficit: You have {remaining_cals} kcal and {max(0, remaining_protein)}g protein remaining."
    elif remaining_cals < 0:
        status = "surplus"
        status_msg = f"Surplus: You have exceeded calorie target by {abs(remaining_cals)} kcal."
    else:
        status = "met"
        status_msg = f"Target met: Exact calorie target reached."

    return MacroCalculationResult(
        remaining_calories=remaining_cals,
        remaining_protein_g=remaining_protein,
        status=status,
        message=status_msg,
    )


def evaluate_meal_selection(
    macros: UserMacros,
    proposed_items: List[Union[ProposedMealItem, MenuItem]],
) -> MealValidationResult:
    """
    Deterministically evaluates a proposed list of meal items against the user's remaining macro targets.
    
    Args:
        macros: Current user macro target and consumption state.
        proposed_items: List of MenuItem or ProposedMealItem objects to validate.
        
    Returns:
        MealValidationResult with exact numerical calculations and routing feedback for the agent.
    """
    # Normalize items to have quantities
    normalized_items: List[ProposedMealItem] = []
    for item in proposed_items:
        if isinstance(item, MenuItem):
            normalized_items.append(ProposedMealItem(menu_item=item, quantity=1))
        elif isinstance(item, ProposedMealItem):
            normalized_items.append(item)
        elif isinstance(item, dict):
            # Support raw dict inputs from LLM tool calls
            if "menu_item" in item:
                normalized_items.append(ProposedMealItem(**item))
            else:
                normalized_items.append(ProposedMealItem(menu_item=MenuItem(**item), quantity=item.get("quantity", 1)))
        else:
            raise ValueError(f"Unsupported meal item format: {type(item)}")

    total_calories = sum(p.menu_item.calories * p.quantity for p in normalized_items)
    total_protein = sum(p.menu_item.protein_g * p.quantity for p in normalized_items)

    remaining_budget_cals = macros.target_calories - macros.current_calories
    remaining_budget_protein = macros.target_protein - macros.current_protein

    remaining_after_cals = remaining_budget_cals - total_calories
    remaining_after_protein = remaining_budget_protein - total_protein

    fits_macros = total_calories <= remaining_budget_cals
    is_protein_met = total_protein >= remaining_budget_protein

    # Construct actionable feedback for the LangGraph routing agent
    feedback_parts = []
    if fits_macros:
        feedback_parts.append(
            f"Calorie budget met: Proposed meal total is {total_calories} kcal (under/equal to remaining {remaining_budget_cals} kcal budget, {remaining_after_cals} kcal buffer remaining)."
        )
    else:
        overshoot = total_calories - remaining_budget_cals
        feedback_parts.append(
            f"Calorie overshoot: Proposed meal total is {total_calories} kcal, exceeding remaining budget by {overshoot} kcal. Choose lower calorie options or reduce portions."
        )

    if is_protein_met:
        feedback_parts.append(
            f"Protein target achieved: Proposed meal provides {total_protein}g protein (meets or exceeds required {remaining_budget_protein}g)."
        )
    else:
        shortfall = remaining_budget_protein - total_protein
        feedback_parts.append(
            f"Protein shortfall: Proposed meal provides {total_protein}g protein ({shortfall}g short of {remaining_budget_protein}g target)."
        )

    return MealValidationResult(
        fits_macros=fits_macros,
        total_calories=total_calories,
        total_protein_g=total_protein,
        remaining_calories_after_meal=remaining_after_cals,
        remaining_protein_after_meal=remaining_after_protein,
        is_protein_target_met=is_protein_met,
        feedback=" ".join(feedback_parts),
    )
