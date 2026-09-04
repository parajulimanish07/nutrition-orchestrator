import time
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Optional, List

from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage

from src.models import (
    UserMacros,
    MealRecommendationRequest,
    MealRecommendationResponse,
    MealItemResponse,
    NutritionSummaryResponse,
    HealthResponse,
)
from src.tools.menu_search import load_menu_database, local_menu_search
from src.graph.builder import build_nutrition_graph
from src.api.logging_config import RequestLoggingMiddleware, logger


def get_graph():
    """Retrieve or lazily initialize the compiled LangGraph workflow."""
    if not hasattr(app.state, "graph") or app.state.graph is None:
        app.state.graph = build_nutrition_graph()
    return app.state.graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes the multi-agent LangGraph engine on application startup."""
    logger.info("Initializing Precision Nutrition LangGraph Engine...")
    app.state.graph = get_graph()
    logger.info("LangGraph engine compiled successfully and ready for inference.")
    yield
    logger.info("Shutting down Precision Nutrition API Gateway.")


app = FastAPI(
    title="Precision Nutrition & Body Recomposition Orchestrator API",
    description="API-first, multi-agent AI system delivering mathematically verified, macro-exact meal recommendations.",
    version="1.0.0",
    lifespan=lifespan,
)

# 1. Attach Custom Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# 2. Attach CORS Middleware for Frontend Clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    tags=["System"],
)
async def health_check() -> HealthResponse:
    """Returns the operational status and service metadata."""
    return HealthResponse(
        status="healthy",
        service="precision-nutrition-orchestrator",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.get(
    "/api/v1/menu",
    summary="Browse Local Menus",
    tags=["Catalog"],
)
async def get_menu_catalog(
    restaurant: Optional[str] = Query(None, description="Filter by restaurant name"),
    min_protein: Optional[int] = Query(None, description="Filter by minimum protein in grams"),
    max_calories: Optional[int] = Query(None, description="Filter by maximum calories"),
) -> List[dict]:
    """Retrieve available dishes and raw nutritional data from local mock restaurant database."""
    items = local_menu_search(
        restaurant=restaurant,
        min_protein=min_protein,
        max_calories=max_calories,
    )
    return [item.model_dump() for item in items]


@app.post(
    "/api/v1/recommend-meal",
    response_model=MealRecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Precision Meal Recommendation",
    tags=["Orchestration"],
)
async def recommend_meal(request: MealRecommendationRequest) -> MealRecommendationResponse:
    """
    Executes the multi-agent LangGraph workflow to produce a mathematically verified meal plan.
    - Validates daily macro budget
    - Delegates to Menu Worker and Math Worker
    - Enforces numeric constraints without LLM hallucinations
    """
    start_time = time.perf_counter()

    try:
        user_macros = UserMacros(
            target_calories=request.target_calories,
            target_protein=request.target_protein,
            current_calories=request.current_calories,
            current_protein=request.current_protein,
        )

        initial_state = {
            "messages": [HumanMessage(content=request.prompt)],
            "user_macros": user_macros,
            "remaining_macros": None,
            "cuisine_preference": request.cuisine_preference,
            "meal_request": request.prompt,
            "proposed_meals": [],
            "math_validation": None,
            "iteration_count": 0,
            "max_iterations": 3,
            "feedback_history": [],
            "final_plan": None,
            "status": "INITIALIZED",
        }

        # Execute compiled LangGraph state machine
        graph = get_graph()
        final_state = await graph.ainvoke(initial_state)

        final_plan = final_state.get("final_plan")
        if not final_plan:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Graph execution completed without producing a valid meal plan."
            )

        execution_duration_ms = (time.perf_counter() - start_time) * 1000

        # Transform to strict Pydantic response
        proposed_meals = [
            MealItemResponse(**item) for item in final_plan.get("proposed_meals", [])
        ]
        nutrition_summary = NutritionSummaryResponse(
            **final_plan.get("nutrition_summary", {})
        )

        return MealRecommendationResponse(
            status=final_plan.get("status", "APPROVED"),
            proposed_meals=proposed_meals,
            nutrition_summary=nutrition_summary,
            feedback=final_plan.get("feedback", ""),
            iterations_used=final_plan.get("iterations_used", 1),
            execution_time_ms=round(execution_duration_ms, 2),
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Failed to generate meal recommendation: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Orchestrator error: {str(exc)}"
        )
