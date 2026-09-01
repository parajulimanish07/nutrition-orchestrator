from typing import Literal, List
from pydantic import BaseModel, Field


MacroStatus = Literal["deficit", "surplus", "met"]


class UserMacros(BaseModel):
    """User daily macro targets and current consumption state."""
    target_calories: int = Field(default=2400, description="Daily calorie target", gt=0)
    target_protein: int = Field(default=155, description="Daily protein target in grams", gt=0)
    current_calories: int = Field(..., description="Calories consumed so far today", ge=0)
    current_protein: int = Field(..., description="Protein consumed so far today in grams", ge=0)


class MacroCalculationResult(BaseModel):
    """Result of macro deficit/surplus computation."""
    remaining_calories: int = Field(..., description="Target calories minus current calories")
    remaining_protein_g: int = Field(..., description="Target protein minus current protein in grams")
    status: MacroStatus = Field(..., description="Deficit, surplus, or exactly met")
    message: str = Field(..., description="Human and LLM-readable summary")


class MenuItem(BaseModel):
    """Nutritional and pricing details for a single menu item."""
    id: str = Field(..., description="Unique identifier for the menu item")
    restaurant: str = Field(..., description="Name of the restaurant or vendor")
    name: str = Field(..., description="Item name")
    portion_size: str = Field(..., description="Portion or serving description")
    calories: int = Field(..., description="Calories per serving", ge=0)
    protein_g: int = Field(..., description="Protein content in grams", ge=0)
    carbs_g: int = Field(default=0, description="Carbohydrates in grams", ge=0)
    fat_g: int = Field(default=0, description="Fat in grams", ge=0)
    price: float = Field(default=0.0, description="Price in local currency", ge=0.0)


class ProposedMealItem(BaseModel):
    """An item selected as part of a proposed meal plan with quantity."""
    menu_item: MenuItem
    quantity: int = Field(default=1, ge=1, description="Quantity of servings")


class MealValidationResult(BaseModel):
    """Validation report evaluating proposed meals against remaining macros."""
    fits_macros: bool = Field(..., description="True if proposed meal fits within calorie budget")
    total_calories: int = Field(..., description="Total calories of proposed meal combination", ge=0)
    total_protein_g: int = Field(..., description="Total protein in grams of proposed meal combination", ge=0)
    remaining_calories_after_meal: int = Field(..., description="Remaining calories after proposed meal")
    remaining_protein_after_meal: int = Field(..., description="Remaining protein after proposed meal")
    is_protein_target_met: bool = Field(..., description="True if protein goal is satisfied or exceeded")
    feedback: str = Field(..., description="Detailed feedback and routing signal for LangGraph agent")
