import unittest
from fastapi.testclient import TestClient
from src.api.main import app
from src.models.api_schemas import (
    HealthResponse,
    MealRecommendationResponse,
)


class TestPhase3FastAPIIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use TestClient with lifespan context
        cls.client = TestClient(app)

    def test_health_check_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "precision-nutrition-orchestrator")
        self.assertIn("version", data)
        self.assertIn("timestamp", data)
        # Validate schema
        health_obj = HealthResponse(**data)
        self.assertEqual(health_obj.status, "healthy")

    def test_response_headers_contain_process_time(self):
        response = self.client.get("/health")
        self.assertIn("x-process-time-ms", response.headers)

    def test_menu_catalog_endpoint(self):
        response = self.client.get("/api/v1/menu")
        self.assertEqual(response.status_code, 200)
        items = response.json()
        self.assertIsInstance(items, list)
        self.assertGreater(len(items), 0)

        # Filter by restaurant
        response_kfc = self.client.get("/api/v1/menu?restaurant=KFC")
        self.assertEqual(response_kfc.status_code, 200)
        kfc_items = response_kfc.json()
        self.assertTrue(all(item["restaurant"] == "KFC" for item in kfc_items))

        # Filter by minimum protein
        response_protein = self.client.get("/api/v1/menu?min_protein=35")
        self.assertEqual(response_protein.status_code, 200)
        for item in response_protein.json():
            self.assertGreaterEqual(item["protein_g"], 35)

    def test_recommend_meal_endpoint_success(self):
        payload = {
            "prompt": "I want a high protein dinner from Yum Yai Thai under 1000 calories",
            "target_calories": 2400,
            "target_protein": 155,
            "current_calories": 1400,
            "current_protein": 75,
            "cuisine_preference": "Yum Yai Thai",
        }
        response = self.client.post("/api/v1/recommend-meal", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Validate with strict Pydantic model
        rec_obj = MealRecommendationResponse(**data)
        self.assertEqual(rec_obj.status, "APPROVED")
        self.assertGreater(len(rec_obj.proposed_meals), 0)
        self.assertTrue(rec_obj.nutrition_summary.fits_calorie_budget)
        self.assertGreater(rec_obj.execution_time_ms, 0)
        self.assertIn("Yum Yai Thai", [m.restaurant for m in rec_obj.proposed_meals])

    def test_recommend_meal_endpoint_momo(self):
        payload = {
            "prompt": "Recommend steamed dumplings from Tapari Momo",
            "target_calories": 2200,
            "target_protein": 140,
            "current_calories": 800,
            "current_protein": 40,
            "cuisine_preference": "Tapari Momo",
        }
        response = self.client.post("/api/v1/recommend-meal", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        rec_obj = MealRecommendationResponse(**data)
        self.assertEqual(rec_obj.status, "APPROVED")
        self.assertTrue(any("Dumplings" in m.name or "Momo" in m.name for m in rec_obj.proposed_meals))

    def test_recommend_meal_endpoint_validation_error(self):
        # Invalid target_calories (<= 0)
        payload = {
            "prompt": "Healthy meal",
            "target_calories": 0,
            "target_protein": 150,
            "current_calories": 500,
            "current_protein": 30,
        }
        response = self.client.post("/api/v1/recommend-meal", json=payload)
        self.assertEqual(response.status_code, 422)

        # Invalid current_calories (< 0)
        payload_neg = {
            "prompt": "Healthy meal",
            "target_calories": 2400,
            "target_protein": 150,
            "current_calories": -100,
            "current_protein": 30,
        }
        response_neg = self.client.post("/api/v1/recommend-meal", json=payload_neg)
        self.assertEqual(response_neg.status_code, 422)


if __name__ == "__main__":
    unittest.main()
