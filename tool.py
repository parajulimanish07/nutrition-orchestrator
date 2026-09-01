"""
Phase 1 Entry Point & Demonstration
Showcases:
1. Pydantic UserMacros definition & validation
2. Deterministic MacroMathEngine deficit calculation
3. LocalMenuSearch for Yum Yai Thai, Tapari Momo, and KFC
4. Meal validation against user macro budget
"""
from src.models import UserMacros
from src.tools import (
    calculate_remaining_macros,
    local_menu_search,
    evaluate_meal_selection,
)


def run_phase1_demo():
    print("==================================================")
    print("  PRECISION NUTRITION ORCHESTRATOR - PHASE 1 DEMO")
    print("==================================================")

    # 1. Macro State (Target: 2400 kcal, 155g protein; Consumed: 800 kcal, 45g protein)
    user_state = UserMacros(
        target_calories=2400,
        target_protein=155,
        current_calories=800,
        current_protein=45,
    )
    print(f"\n[1] User Macro State:")
    print(f"    Target:  {user_state.target_calories} kcal | {user_state.target_protein}g protein")
    print(f"    Current: {user_state.current_calories} kcal | {user_state.current_protein}g protein")

    # 2. Deficit calculation via MacroMathEngine
    deficit = calculate_remaining_macros(user_state)
    print(f"\n[2] Remaining Budget:")
    print(f"    Remaining Calories: {deficit.remaining_calories} kcal")
    print(f"    Remaining Protein:  {deficit.remaining_protein_g}g")
    print(f"    Status:             {deficit.status.upper()}")
    print(f"    Message:            {deficit.message}")

    # 3. Search Menus
    print("\n[3] Local Menu Searches:")
    
    # Yum Yai Thai
    thai_items = local_menu_search(restaurant="Yum Yai Thai")
    print(f"    -> Yum Yai Thai items found: {len(thai_items)}")
    for item in thai_items[:2]:
        print(f"       - {item.name}: {item.calories} kcal, {item.protein_g}g protein (${item.price:.2f})")

    # Tapari Momo
    momo_items = local_menu_search(restaurant="Tapari Momo")
    print(f"    -> Tapari Momo items found: {len(momo_items)}")
    for item in momo_items[:2]:
        print(f"       - {item.name}: {item.calories} kcal, {item.protein_g}g protein (${item.price:.2f})")

    # KFC
    kfc_items = local_menu_search(restaurant="KFC", min_protein=30)
    print(f"    -> KFC high protein (>=30g) items found: {len(kfc_items)}")
    for item in kfc_items:
        print(f"       - {item.name}: {item.calories} kcal, {item.protein_g}g protein (${item.price:.2f})")

    # 4. Meal Selection Validation
    print("\n[4] Deterministic Meal Plan Evaluation:")
    # Selecting Steamed Momo + Tom Yum Soup
    selected_items = [
        momo_items[0],  # Steamed Chicken Dumplings (480 kcal, 36g protein)
        thai_items[3],  # Tom Yum Soup with Prawns (210 kcal, 24g protein)
    ]
    
    validation = evaluate_meal_selection(user_state, selected_items)
    print(f"    Proposed Items:")
    for item in selected_items:
        print(f"       * {item.restaurant} - {item.name} ({item.calories} kcal, {item.protein_g}g protein)")
    print(f"    Total Meal:           {validation.total_calories} kcal | {validation.total_protein_g}g protein")
    print(f"    Fits Macro Budget:    {validation.fits_macros}")
    print(f"    Remaining Afterwards: {validation.remaining_calories_after_meal} kcal | {validation.remaining_protein_after_meal}g protein")
    print(f"    Feedback:             {validation.feedback}")
    print("\n==================================================")


if __name__ == "__main__":
    run_phase1_demo()
