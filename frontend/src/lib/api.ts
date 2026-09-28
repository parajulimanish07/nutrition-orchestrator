import {
  MealRecommendationRequest,
  MealRecommendationResponse,
  HealthCheckResponse,
  MenuItemCatalog,
} from "@/types/nutrition";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkBackendHealth(): Promise<HealthCheckResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return null;
  }
}

export async function fetchMenuCatalog(filters?: {
  restaurant?: string;
  min_protein?: number;
  max_calories?: number;
}): Promise<MenuItemCatalog[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/menu`);
    if (filters?.restaurant) url.searchParams.set("restaurant", filters.restaurant);
    if (filters?.min_protein !== undefined) url.searchParams.set("min_protein", String(filters.min_protein));
    if (filters?.max_calories !== undefined) url.searchParams.set("max_calories", String(filters.max_calories));
    
    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch menu catalog:", error);
    return [];
  }
}

export async function recommendMeal(
  payload: MealRecommendationRequest
): Promise<MealRecommendationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/recommend-meal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = "Failed to generate meal plan";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}
