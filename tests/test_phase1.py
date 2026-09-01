import unittest
from pydantic import ValidationError
from src.models.schemas import UserMacros, MenuItem, ProposedMealItem
from src.tools.macro_math import calculate_remaining_macros, evaluate_meal_selection
from src.tools.menu_search import local_menu_search, get_menu_item_by_id, load_menu_database


class TestUserMacros(unittest.TestCase):
    def test_default_values(self):
        macros = UserMacros(current_calories=500, current_protein=30)
        self.assertEqual(macros.target_calories, 2400)
        self.assertEqual(macros.target_protein, 155)
        self.assertEqual(macros.current_calories, 500)
        self.assertEqual(macros.current_protein, 30)

    def test_validation_errors(self):
        # Target calories cannot be <= 0
        with self.assertRaises(ValidationError):
            UserMacros(target_calories=0, current_calories=100, current_protein=10)

        # Current calories cannot be negative
        with self.assertRaises(ValidationError):
            UserMacros(current_calories=-50, current_protein=10)


class TestMacroMathEngine(unittest.TestCase):
    def test_deficit_calculation(self):
        macros = UserMacros(
            target_calories=2400,
            target_protein=155,
            current_calories=800,
            current_protein=45,
        )
        result = calculate_remaining_macros(macros)
        self.assertEqual(result.remaining_calories, 1600)
        self.assertEqual(result.remaining_protein_g, 110)
        self.assertEqual(result.status, "deficit")
        self.assertIn("1600 kcal", result.message)

    def test_surplus_calculation(self):
        macros = UserMacros(
            target_calories=2000,
            target_protein=140,
            current_calories=2250,
            current_protein=150,
        )
        result = calculate_remaining_macros(macros)
        self.assertEqual(result.remaining_calories, -250)
        self.assertEqual(result.remaining_protein_g, -10)
        self.assertEqual(result.status, "surplus")

    def test_meal_evaluation_within_budget(self):
        macros = UserMacros(
            target_calories=2400,
            target_protein=155,
            current_calories=800,
            current_protein=45,
        )
        item1 = MenuItem(
            id="test1",
            restaurant="Yum Yai Thai",
            name="Pad See Ew",
            portion_size="1 plate",
            calories=680,
            protein_g=38,
        )
        item2 = MenuItem(
            id="test2",
            restaurant="Tapari Momo",
            name="Steamed Chicken Dumplings",
            portion_size="10 pcs",
            calories=480,
            protein_g=36,
        )

        result = evaluate_meal_selection(macros, [item1, item2])
        self.assertTrue(result.fits_macros)
        self.assertEqual(result.total_calories, 1160)
        self.assertEqual(result.total_protein_g, 74)
        self.assertEqual(result.remaining_calories_after_meal, 440)  # 1600 - 1160
        self.assertEqual(result.remaining_protein_after_meal, 36)    # 110 - 74
        self.assertFalse(result.is_protein_target_met)  # Still 36g needed

    def test_meal_evaluation_exceeds_budget(self):
        macros = UserMacros(
            target_calories=2000,
            target_protein=150,
            current_calories=1600,
            current_protein=100,
        )  # Budget: 400 kcal remaining
        item = MenuItem(
            id="test_large",
            restaurant="KFC",
            name="Double Meal",
            portion_size="1 set",
            calories=950,
            protein_g=60,
        )

        result = evaluate_meal_selection(macros, [item])
        self.assertFalse(result.fits_macros)
        self.assertEqual(result.remaining_calories_after_meal, -550)
        self.assertTrue(result.is_protein_target_met)
        self.assertIn("Calorie overshoot", result.feedback)


class TestLocalMenuSearch(unittest.TestCase):
    def test_database_loads_all_required_restaurants(self):
        items = load_menu_database()
        self.assertGreater(len(items), 0)
        restaurants = {item.restaurant for item in items}
        self.assertIn("Yum Yai Thai", restaurants)
        self.assertIn("Tapari Momo", restaurants)
        self.assertIn("KFC", restaurants)

    def test_search_by_restaurant(self):
        results = local_menu_search(restaurant="Tapari Momo")
        self.assertTrue(len(results) >= 4)
        for item in results:
            self.assertEqual(item.restaurant, "Tapari Momo")

    def test_search_by_query(self):
        results = local_menu_search(query="Zinger")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].name, "Zinger Burger")
        self.assertEqual(results[0].restaurant, "KFC")

    def test_search_with_calorie_and_protein_filters(self):
        # Items with at least 35g protein and under 600 calories
        results = local_menu_search(min_protein=35, max_calories=600)
        self.assertGreater(len(results), 0)
        for item in results:
            self.assertGreaterEqual(item.protein_g, 35)
            self.assertLessEqual(item.calories, 600)

    def test_get_by_id(self):
        item = get_menu_item_by_id("tm_001")
        self.assertIsNotNone(item)
        self.assertEqual(item.name, "Steamed Chicken Dumplings (10 pcs)")


if __name__ == "__main__":
    unittest.main()
