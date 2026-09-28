import {
  MealRecommendationRequest,
  MealRecommendationResponse,
  HealthCheckResponse,
  MenuItemCatalog,
} from "@/types/nutrition";

// Use same-origin proxy in browser to guarantee zero CORS or privacy extension blocks
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://nutrition-orchestrator.onrender.com"
  );
};

export async function checkBackendHealth(): Promise<HealthCheckResponse | null> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/health`);
    if (res.ok) return await res.json();
  } catch (error) {
    console.warn("Primary health check failed, retrying once...", error);
  }

  // Fallback: If proxy failed or during cold start, try direct URL or retry once
  try {
    const directUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://nutrition-orchestrator.onrender.com";
    const res = await fetch(`${directUrl}/health`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Health check error:", e);
  }

  return null;
}

export async function fetchMenuCatalog(filters?: {
  restaurant?: string;
  min_protein?: number;
  max_calories?: number;
}): Promise<MenuItemCatalog[]> {
  const baseUrl = getBaseUrl();
  try {
    const url = new URL(`${baseUrl}/api/v1/menu`, typeof window !== "undefined" ? window.location.origin : undefined);
    if (filters?.restaurant) url.searchParams.set("restaurant", filters.restaurant);
    if (filters?.min_protein !== undefined) url.searchParams.set("min_protein", String(filters.min_protein));
    if (filters?.max_calories !== undefined) url.searchParams.set("max_calories", String(filters.max_calories));

    const res = await fetch(url.toString());
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
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/recommend-meal`, {
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
