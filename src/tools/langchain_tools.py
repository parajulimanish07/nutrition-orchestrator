from typing import List, Optional
from langchain_core.tools import tool
from src.models.schemas import UserMacros, MenuItem
from src.tools.macro_math import calculate_remaining_macros, evaluate_meal_selection
from src.tools.menu_search import local_menu_search, get_menu_item_by_id


@tool
def search_local_menu_tool(
    query: Optional[str] = None,
    restaurant: Optional[str] = None,
    max_calories: Optional[int] = None,
    min_protein: Optional[int] = None,
) -> str:
    """
    Search and filter local restaurant menus (Yum Yai Thai, Tapari Momo, KFC).
    
    Args:
        query: Food item name or keyword (e.g. 'Pad See Ew', 'Dumplings', 'Zinger').
        restaurant: Restaurant name ('Yum Yai Thai', 'Tapari Momo', or 'KFC').
        max_calories: Maximum calories per item.
        min_protein: Minimum protein in grams per item.
        
    Returns:
        Formatted list of matching menu items with full nutritional breakdown and item IDs.
    """
    items = local_menu_search(
        query=query,
        restaurant=restaurant,
        max_calories=max_calories,
        min_protein=min_protein,
    )
    if not items:
        return "No menu items found matching the given criteria."
    
    lines = []
    for item in items:
        lines.append(
            f"ID: {item.id} | {item.restaurant} - {item.name} | "
            f"Serving: {item.portion_size} | {item.calories} kcal | "
            f"Protein: {item.protein_g}g | Carbs: {item.carbs_g}g | Fat: {item.fat_g}g | Price: ${item.price:.2f}"
        )
    return "\n".join(lines)


@tool
def calculate_macros_tool(
    current_calories: int,
    current_protein: int,
    target_calories: int = 2400,
    target_protein: int = 155,
) -> dict:
    """
    Deterministically computes remaining calories and protein deficit/surplus.
    
    Args:
        current_calories: Total calories consumed so far today.
        current_protein: Total protein consumed so far today (in grams).
        target_calories: Target daily calories (default: 2400).
        target_protein: Target daily protein in grams (default: 155).
        
    Returns:
        Dictionary with remaining_calories, remaining_protein_g, status, and summary message.
    """
    macros = UserMacros(
        target_calories=target_calories,
        target_protein=target_protein,
        current_calories=current_calories,
        current_protein=current_protein,
    )
    result = calculate_remaining_macros(macros)
    return result.model_dump()


@tool
def validate_meal_plan_tool(
    item_ids: List[str],
    current_calories: int,
    current_protein: int,
    target_calories: int = 2400,
    target_protein: int = 155,
) -> dict:
    """
    Deterministically evaluates a combination of menu items against the user's remaining macro targets.
    
    Args:
        item_ids: List of menu item IDs to evaluate (e.g. ['tm_001', 'yyt_004']).
        current_calories: Calories consumed before this meal.
        current_protein: Protein consumed before this meal.
        target_calories: Target daily calories.
        target_protein: Target daily protein.
        
    Returns:
        Dictionary with fits_macros, total_calories, total_protein_g, remaining buffers, and routing feedback.
    """
    macros = UserMacros(
        target_calories=target_calories,
        target_protein=target_protein,
        current_calories=current_calories,
        current_protein=current_protein,
    )
    
    items: List[MenuItem] = []
    for item_id in item_ids:
        item = get_menu_item_by_id(item_id)
        if not item:
            return {"error": f"Menu item ID '{item_id}' not found in database."}
        items.append(item)
        
    result = evaluate_meal_selection(macros, items)
    return result.model_dump()
