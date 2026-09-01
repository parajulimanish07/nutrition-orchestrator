"""
Precision Nutrition & Body Recomposition Orchestrator - Phase 2 Demonstration
Demonstrates:
- Supervisor-Worker multi-agent LangGraph workflow
- Autonomous cuisine preference detection and delegation
- Menu Worker item discovery
- Math Worker deterministic verification and feedback loops
- Supervisor final synthesis
"""
import json
from langchain_core.messages import HumanMessage
from src.models.schemas import UserMacros
from src.graph.builder import build_nutrition_graph


def run_orchestrator_demo(user_query: str, current_cals: int = 800, current_protein: int = 45):
    print("=" * 65)
    print("   LANGGRAPH MULTI-AGENT PRECISION NUTRITION ORCHESTRATOR")
    print("=" * 65)
    print(f"\n[Prompt]: \"{user_query}\"")

    user_state = UserMacros(
        target_calories=2400,
        target_protein=155,
        current_calories=current_cals,
        current_protein=current_protein,
    )
    print(f"[Current State]: {current_cals} kcal / 2400 kcal | {current_protein}g protein / 155g protein")
    print(f"[Remaining Budget]: {2400 - current_cals} kcal | {155 - current_protein}g protein")
    print("\n--- Executing Multi-Agent State Machine ---")

    graph = build_nutrition_graph()

    initial_input = {
        "messages": [HumanMessage(content=user_query)],
        "user_macros": user_state,
        "remaining_macros": None,
        "cuisine_preference": None,
        "meal_request": user_query,
        "proposed_meals": [],
        "math_validation": None,
        "iteration_count": 0,
        "max_iterations": 3,
        "feedback_history": [],
        "final_plan": None,
        "status": "INITIALIZED",
    }

    # Stream graph events to show node-by-node collaboration
    for event in graph.stream(initial_input):
        for node_name, node_output in event.items():
            print(f"\n>> Node Activated: [{node_name.upper()}]")
            if "messages" in node_output and node_output["messages"]:
                last_msg = node_output["messages"][-1]
                print(f"   {last_msg.content}")

    # Final result
    final_output = graph.invoke(initial_input)
    print("\n" + "=" * 65)
    print("                 FINAL VERIFIED MEAL PLAN")
    print("=" * 65)
    print(json.dumps(final_output["final_plan"], indent=2))
    print("=" * 65)


if __name__ == "__main__":
    # Test case 1: Thai craving with specific macros
    run_orchestrator_demo(
        user_query="I want a delicious dinner from Yum Yai Thai that fits my remaining calorie budget.",
        current_cals=1200,
        current_protein=60,
    )
