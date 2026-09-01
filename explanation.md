# Precision Nutrition Orchestrator: Phase 1 Explained in Plain English

Welcome to the project! This guide breaks down what we built in **Phase 1**, why each part exists, and how everything works together under the hood in plain, easy-to-understand language.

---

## 1. What Problem Are We Solving?

Large Language Models (like ChatGPT, Claude, or Llama) are great at writing and conversation, but they are **notoriously bad at accurate math**. If you ask an AI to create a meal plan for 2,400 calories and 155g of protein, it will often "hallucinate" numbers, miscalculate portions, or recommend meals that exceed your targets without realizing it.

### Our Solution:
Instead of letting the AI guess the math, we build a **deterministic system**:
- The AI acts as the planner and communicator.
- **Python code and strict mathematical tools** do the exact calculations and menu lookups.
- Before any meal plan reaches the user, it is mathematically verified.

---

## 2. The Big Picture of Phase 1

In Phase 1, we built the **core tools and data foundations** that our AI agents will use in Phase 2.

```
+-------------------------------------------------------------+
|                       Phase 1 Foundation                    |
+-------------------------------------------------------------+
|                                                             |
|  1. Data Schemas (Pydantic)                                 |
|     - Rules & guarantees for user macros and menu items     |
|                                                             |
|  2. Mock Restaurant Database (JSON)                         |
|     - Real items: Yum Yai Thai, Tapari Momo, KFC            |
|                                                             |
|  3. Local Menu Search Tool                                  |
|     - Search food by restaurant, keyword, calories, protein |
|                                                             |
|  4. Macro Math Engine                                       |
|     - Calculates deficits, surpluses, and validates meals   |
|                                                             |
|  5. Automated Test Suite (11 Tests)                         |
|     - Proves everything calculates 100% accurately          |
+-------------------------------------------------------------+
```

---

## 3. Detailed Walkthrough of Each Component

### A. Data Schemas (`src/models/schemas.py`)
Think of schemas as **strict digital forms or contracts**. If someone tries to enter invalid data (for example, negative calories or missing targets), Python stops it immediately.

We created four main schemas using **Pydantic**:

1. **`UserMacros`**: Holds the user's daily goals and what they've eaten so far.
   - **Default Target:** 2,400 calories & 155g protein per day.
   - **Current Consumed:** e.g., 800 calories & 45g protein so far today.
2. **`MenuItem`**: Represents a single dish on a restaurant menu.
   - Holds: restaurant name, dish name, portion size, calories, protein, carbs, fat, and price.
3. **`MacroCalculationResult`**: The result of our deficit/surplus math.
   - Tells you how many calories and protein grams are left, and whether you are in a **deficit**, **surplus**, or **met** status.
4. **`MealValidationResult`**: The report card for a proposed meal.
   - Checks: Does this meal fit inside the remaining calories? Did it meet the protein goal? What is the exact numerical buffer left?

---

### B. Mock Restaurant Database (`data/mock_menus.json`)
To test real-world meal recommendations without relying on live web scraping, we created a local database of real menu items with verified nutritional values:

1. **Yum Yai Thai**:
   - Pad See Ew (Chicken) — 680 kcal, 38g protein
   - Spicy Fried Rice (Chicken & Basil) — 620 kcal, 34g protein
   - Vegetable Spring Rolls — 290 kcal, 6g protein
   - Tom Yum Soup with Prawns — 210 kcal, 24g protein
   - Thai Green Curry with Chicken Breast — 710 kcal, 42g protein
2. **Tapari Momo**:
   - Steamed Chicken Dumplings (10 pcs) — 480 kcal, 36g protein
   - Steamed Buff Dumplings (10 pcs) — 520 kcal, 40g protein
   - Fried Chicken Momo (10 pcs) — 640 kcal, 35g protein
   - Chilli C-Momo Chicken — 560 kcal, 37g protein
3. **KFC**:
   - Zinger Burger — 515 kcal, 31g protein
   - Original Recipe Chicken (1 Piece Breast) — 390 kcal, 39g protein
   - Original Recipe Chicken (2 Pieces Thigh & Drumstick) — 540 kcal, 42g protein
   - Wicked Wings (3 Pieces) — 420 kcal, 27g protein
   - Coleslaw — 150 kcal, 1g protein

---

### C. Local Menu Search Tool (`src/tools/menu_search.py`)
This tool acts as our digital waiter. It looks up food items in the database without guessing.

**What it can do:**
- **Filter by Restaurant:** Find all items from *"Yum Yai Thai"*.
- **Filter by Keyword:** Search for dishes containing *"Zinger"* or *"Dumplings"*.
- **Filter by Nutrition:** Find items that have **at least 35g of protein** and are **under 600 calories**.

---

### D. Macro Math Engine (`src/tools/macro_math.py`)
This is the **heart of the precision system**. It performs two critical jobs:

#### 1. Calculating Remaining Budget (`calculate_remaining_macros`)
If your daily target is `2400 kcal` and `155g protein`, and you already ate `800 kcal` and `45g protein`:
- Remaining Calories = `2400 - 800 = 1600 kcal`
- Remaining Protein = `155 - 45 = 110g protein`
- Status = `"deficit"` (you still have food budget left to eat)

#### 2. Evaluating Proposed Meals (`evaluate_meal_selection`)
When a meal is proposed (e.g. Steamed Dumplings + Tom Yum Soup = 690 kcal, 60g protein):
- It subtracts the meal from the remaining budget: `1600 - 690 = 910 kcal left`.
- It checks if `total_calories <= remaining_budget`: `690 <= 1600` -> **Fits: True**.
- It checks if the protein goal was achieved: `60g vs 110g needed` -> **Protein Shortfall: 50g**.
- It creates clear, actionable feedback for the AI agent (e.g. *"Calorie budget met, but 50g protein still needed for the day"*).

---

### E. Automated Tests & Verification (`tests/test_phase1.py`)
We wrote 11 automated unit tests to prove that our code works flawlessly under every scenario:
- Correct deficit and surplus calculations.
- Error handling when negative calories are entered.
- Menu searching and filtering by restaurant and protein thresholds.
- Validation checks when meals exceed the calorie budget.

All 11 tests pass with 100% accuracy.

---

## 4. How Phase 1 Connects to Phase 2 (LangGraph Multi-Agent)

In **Phase 2**, we will introduce AI agents using **LangGraph**:
1. **Supervisor Agent:** Understands what the user wants to eat.
2. **Menu Worker Agent:** Uses our `local_menu_search` tool to pick dishes.
3. **Math Worker Agent:** Uses our `MacroMathEngine` to check if the food fits the budget.
4. **Smart Loopback:** If the Menu Worker picks food with too many calories, the Math Worker rejects it and tells the Menu Worker to pick something lighter.

Because we built Phase 1 cleanly, our AI agents won't have to guess or do math in their heads—they will simply call our reliable Python tools!
