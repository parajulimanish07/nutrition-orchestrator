import unittest
from langchain_core.messages import HumanMessage
from src.models.schemas import UserMacros, MenuItem, MealValidationResult
from src.tools.langchain_tools import (
    search_local_menu_tool,
    calculate_macros_tool,
    validate_meal_plan_tool,
)
from src.graph.state import AgentState
from src.graph.routing import route_from_supervisor, route_from_math_worker
from src.graph.builder import build_nutrition_graph


class TestLangChainTools(unittest.TestCase):
    def test_search_local_menu_tool(self):
        output = search_local_menu_tool.invoke({"restaurant": "Yum Yai Thai"})
        self.assertIn("Pad See Ew", output)
        self.assertIn("Tom Yum Soup", output)

    def test_calculate_macros_tool(self):
        result = calculate_macros_tool.invoke({
            "current_calories": 1000,
            "current_protein": 50,
            "target_calories": 2400,
            "target_protein": 155,
        })
        self.assertEqual(result["remaining_calories"], 1400)
        self.assertEqual(result["remaining_protein_g"], 105)
        self.assertEqual(result["status"], "deficit")

    def test_validate_meal_plan_tool(self):
        result = validate_meal_plan_tool.invoke({
            "item_ids": ["tm_001", "yyt_004"],
            "current_calories": 800,
            "current_protein": 45,
            "target_calories": 2400,
            "target_protein": 155,
        })
        self.assertTrue(result["fits_macros"])
        self.assertEqual(result["total_calories"], 690)
        self.assertEqual(result["total_protein_g"], 60)


class TestRoutingLogic(unittest.TestCase):
    def test_route_from_supervisor(self):
        initial_state = AgentState(
            messages=[],
            user_macros=UserMacros(current_calories=500, current_protein=30),
            remaining_macros=None,
            cuisine_preference=None,
            meal_request=None,
            proposed_meals=[],
            math_validation=None,
            iteration_count=0,
            max_iterations=3,
            feedback_history=[],
            final_plan=None,
            status="INITIAL",
        )
        self.assertEqual(route_from_supervisor(initial_state), "menu_worker")

        completed_state = dict(initial_state)
        completed_state["status"] = "COMPLETED"
        completed_state["final_plan"] = {"status": "APPROVED"}
        self.assertEqual(route_from_supervisor(completed_state), "__end__")

    def test_route_from_math_worker_success(self):
        val_success = MealValidationResult(
            fits_macros=True,
            total_calories=600,
            total_protein_g=40,
            remaining_calories_after_meal=1000,
            remaining_protein_after_meal=70,
            is_protein_target_met=False,
            feedback="Fits budget",
        )
        state = AgentState(
            messages=[],
            user_macros=UserMacros(current_calories=800, current_protein=45),
            remaining_macros=None,
            cuisine_preference="Tapari Momo",
            meal_request=None,
            proposed_meals=[],
            math_validation=val_success,
            iteration_count=1,
            max_iterations=3,
            feedback_history=["Fits budget"],
            final_plan=None,
            status="VALIDATION_COMPLETE",
        )
        self.assertEqual(route_from_math_worker(state), "supervisor")

    def test_route_from_math_worker_loopback(self):
        val_failed = MealValidationResult(
            fits_macros=False,
            total_calories=1800,
            total_protein_g=40,
            remaining_calories_after_meal=-200,
            remaining_protein_after_meal=70,
            is_protein_target_met=False,
            feedback="Overshoot",
        )
        state = AgentState(
            messages=[],
            user_macros=UserMacros(current_calories=800, current_protein=45),
            remaining_macros=None,
            cuisine_preference="Tapari Momo",
            meal_request=None,
            proposed_meals=[],
            math_validation=val_failed,
            iteration_count=1,
            max_iterations=3,
            feedback_history=["Overshoot"],
            final_plan=None,
            status="VALIDATION_COMPLETE",
        )
        # Should loop back to menu worker
        self.assertEqual(route_from_math_worker(state), "menu_worker")

        # When max iterations reached, should route to supervisor
        state["iteration_count"] = 3
        self.assertEqual(route_from_math_worker(state), "supervisor")


class TestStateGraphExecution(unittest.TestCase):
    def setUp(self):
        self.graph = build_nutrition_graph()

    def test_end_to_end_thai_request(self):
        initial_state = {
            "messages": [HumanMessage(content="I want high protein Thai dinner from Yum Yai Thai under 1000 calories")],
            "user_macros": UserMacros(
                target_calories=2400,
                target_protein=155,
                current_calories=1400,
                current_protein=75,
            ),
            "remaining_macros": None,
            "cuisine_preference": None,
            "meal_request": "high protein dinner",
            "proposed_meals": [],
            "math_validation": None,
            "iteration_count": 0,
            "max_iterations": 3,
            "feedback_history": [],
            "final_plan": None,
            "status": "STARTING",
        }

        final_state = self.graph.invoke(initial_state)
        self.assertEqual(final_state["status"], "COMPLETED")
        self.assertIsNotNone(final_state["final_plan"])
        self.assertTrue(len(final_state["proposed_meals"]) > 0)
        self.assertTrue(final_state["final_plan"]["nutrition_summary"]["fits_calorie_budget"])
        self.assertEqual(final_state["cuisine_preference"], "Yum Yai Thai")

    def test_end_to_end_kfc_request(self):
        initial_state = {
            "messages": [HumanMessage(content="Recommend a quick meal from KFC with good protein")],
            "user_macros": UserMacros(
                target_calories=2400,
                target_protein=155,
                current_calories=800,
                current_protein=40,
            ),
            "remaining_macros": None,
            "cuisine_preference": None,
            "meal_request": "kfc high protein",
            "proposed_meals": [],
            "math_validation": None,
            "iteration_count": 0,
            "max_iterations": 3,
            "feedback_history": [],
            "final_plan": None,
            "status": "STARTING",
        }

        final_state = self.graph.invoke(initial_state)
        self.assertEqual(final_state["status"], "COMPLETED")
        self.assertIsNotNone(final_state["final_plan"])
        self.assertEqual(final_state["cuisine_preference"], "KFC")
        self.assertTrue(final_state["final_plan"]["nutrition_summary"]["fits_calorie_budget"])


if __name__ == "__main__":
    unittest.main()
