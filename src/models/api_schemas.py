from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class MealRecommendationRequest(BaseModel):
    """Strict request payload for meal recommendation endpoint."""
    prompt: str = Field(
        ...,
        min_length=2,
        description="Natural language meal craving or request (e.g. 'I want high protein Thai for dinner')",
        examples=["I want high protein Thai food from Yum Yai Thai under 1000 calories"]
    )
    target_calories: int = Field(
        default=2400,
        gt=0,
        description="Daily calorie target",
        examples=[2400]
    )
    target_protein: int = Field(
        default=155,
        gt=0,
        description="Daily protein target in grams",
        examples=[155]
    )
    current_calories: int = Field(
        default=0,
        ge=0,
        description="Calories consumed so far today",
        examples=[1200]
    )
    current_protein: int = Field(
        default=0,
        ge=0,
        description="Protein in grams consumed so far today",
        examples=[60]
    )
    cuisine_preference: Optional[str] = Field(
        default=None,
        description="Explicit vendor preference (e.g. 'Yum Yai Thai', 'Tapari Momo', 'KFC')",
        examples=["Yum Yai Thai"]
    )


class MealItemResponse(BaseModel):
    """Nutritional breakdown for an individual recommended menu item."""
    restaurant: str
    name: str
    calories: int
    protein_g: int
    price: float


class NutritionSummaryResponse(BaseModel):
    """Aggregate nutritional report and budget verification."""
    total_calories: int
    total_protein_g: int
    remaining_calories_after_meal: int
    remaining_protein_after_meal: int
    fits_calorie_budget: bool
    meets_protein_target: bool


class MealRecommendationResponse(BaseModel):
    """Strict response payload returned by the multi-agent API."""
    status: Literal["APPROVED", "APPROXIMATION_MAX_ITERATIONS", "ERROR"]
    proposed_meals: List[MealItemResponse]
    nutrition_summary: NutritionSummaryResponse
    feedback: str
    iterations_used: int
    execution_time_ms: float


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    service: str
    version: str
    timestamp: str
