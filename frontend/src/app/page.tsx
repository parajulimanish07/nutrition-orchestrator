"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { MealInputForm } from "@/components/MealInputForm";
import { MacroSummaryCard } from "@/components/MacroSummaryCard";
import { MealCard } from "@/components/MealCard";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { MenuCatalogBrowser } from "@/components/MenuCatalogBrowser";
import { recommendMeal } from "@/lib/api";
import {
  MealRecommendationRequest,
  MealRecommendationResponse,
} from "@/types/nutrition";
import {
  Utensils,
  AlertCircle,
  ShoppingBag,
  Flame,
  Dumbbell,
  Cpu,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"planner" | "catalog">("planner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<MealRecommendationRequest | null>(null);
  const [result, setResult] = useState<MealRecommendationResponse | null>(null);

  const handleGenerateMealPlan = async (request: MealRecommendationRequest) => {
    setLoading(true);
    setError(null);
    setCurrentRequest(request);

    try {
      const response = await recommendMeal(request);
      setResult(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not connect to FastAPI orchestrator.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handleSelectDishForPrompt = (dishName: string, restaurant: string) => {
    setActiveTab("planner");
    handleGenerateMealPlan({
      prompt: `I want to order ${dishName} from ${restaurant} and balance my remaining macros`,
      target_calories: 2400,
      target_protein: 155,
      current_calories: 1200,
      current_protein: 60,
      cuisine_preference: restaurant,
    });
  };

  const totalMealCost =
    result?.proposed_meals.reduce((sum, item) => sum + item.price, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Metric Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tile 1: Calorie Target */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Daily Calorie Goal
              </p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {currentRequest ? `${currentRequest.target_calories} kcal` : "2,400 kcal"}
              </p>
            </div>
          </div>

          {/* Tile 2: Protein Target */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Daily Protein Target
              </p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {currentRequest ? `${currentRequest.target_protein}g` : "155g"}
              </p>
            </div>
          </div>

          {/* Tile 3: Verification */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Math Verification
              </p>
              <p className="text-sm sm:text-base font-extrabold text-emerald-800">
                Zero Hallucinations
              </p>
            </div>
          </div>

          {/* Tile 4: Multi-Agent State */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Agent State
              </p>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                {result ? `Verified (${result.iterations_used}c)` : "Engine Ready"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-rose-950">Backend Connection Error: </span>
              <span>{error}</span>
              <p className="text-rose-700 mt-1">
                Make sure the FastAPI backend is running on <code className="bg-rose-100 px-1 py-0.5 rounded font-mono text-rose-900">http://localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Planner View */}
        {activeTab === "planner" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Control Form (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <MealInputForm onSubmit={handleGenerateMealPlan} isLoading={loading} />
            </div>

            {/* Right Dashboard / Results Area (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Loading Skeleton */}
              {loading && (
                <div className="space-y-6">
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Skeleton className="h-28 rounded-xl" />
                      <Skeleton className="h-28 rounded-xl" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </Card>

                  <Card className="p-6 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                    </div>
                  </Card>
                </div>
              )}

              {/* Idle Empty State */}
              {!loading && !result && (
                <Card className="border-dashed border-slate-300 bg-white text-center p-8 sm:p-12 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    Deterministic Macro Orchestrator
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                    Set your craving and target macronutrients on the left, or choose a quick scenario. The Supervisor, Menu Worker, and Math Worker will calculate an exact, verified combination.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 text-xs">
                      🍜 Yum Yai Thai
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 text-xs">
                      🥟 Tapari Momo
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 text-xs">
                      🍗 KFC
                    </Badge>
                  </div>
                </Card>
              )}

              {/* Verified Result State */}
              {!loading && result && currentRequest && (
                <div className="space-y-6">
                  {/* Macro Progress Summary */}
                  <MacroSummaryCard
                    summary={result.nutrition_summary}
                    status={result.status}
                    iterationsUsed={result.iterations_used}
                    executionTimeMs={result.execution_time_ms}
                    targetCalories={currentRequest.target_calories}
                    targetProtein={currentRequest.target_protein}
                    currentCalories={currentRequest.current_calories}
                    currentProtein={currentRequest.current_protein}
                  />

                  {/* Recommended Dishes Card */}
                  <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          <CardTitle className="text-base font-bold text-slate-900">
                            Recommended Dishes ({result.proposed_meals.length})
                          </CardTitle>
                        </div>
                        <div className="text-xs text-slate-500">
                          Total Meal Cost:{" "}
                          <span className="font-bold text-emerald-800 text-sm ml-1 font-mono">
                            {formatCurrency(totalMealCost)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {result.proposed_meals.map((item, idx) => (
                          <MealCard key={idx} item={item} index={idx} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Agent Audit Ledger */}
                  <FeedbackBanner
                    feedback={result.feedback}
                    iterations={result.iterations_used}
                    status={result.status}
                  />

                  {/* Reset Control */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Plan & Run New Search</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Menu Catalog Explorer */}
        {activeTab === "catalog" && (
          <MenuCatalogBrowser onSelectDishForPrompt={handleSelectDishForPrompt} />
        )}
      </main>

      {/* Clean Light-Theme Footer */}
      <footer className="border-t border-slate-200 py-6 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-slate-700">NutriOrchestrator</span>
            <span>•</span>
            <span>Deterministic Macro Optimization System</span>
          </div>
          <div>LangGraph Multi-Agent • FastAPI Backend • Next.js Bento Architecture</div>
        </div>
      </footer>
    </div>
  );
}
