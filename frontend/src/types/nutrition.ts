export interface MealRecommendationRequest {
  prompt: string;
  target_calories: number;
  target_protein: number;
  current_calories: number;
  current_protein: number;
  cuisine_preference?: string | null;
}

export interface MealItem {
  restaurant: string;
  name: string;
  calories: number;
  protein_g: number;
  price: number;
}

export interface NutritionSummary {
  total_calories: number;
  total_protein_g: number;
  remaining_calories_after_meal: number;
  remaining_protein_after_meal: number;
  fits_calorie_budget: boolean;
  meets_protein_target: boolean;
}

export interface MealRecommendationResponse {
  status: "APPROVED" | "APPROXIMATION_MAX_ITERATIONS" | "ERROR";
  proposed_meals: MealItem[];
  nutrition_summary: NutritionSummary;
  feedback: string;
  iterations_used: number;
  execution_time_ms: number;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export interface MenuItemCatalog {
  id: string;
  restaurant: string;
  name: string;
  portion_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  price: number;
}
