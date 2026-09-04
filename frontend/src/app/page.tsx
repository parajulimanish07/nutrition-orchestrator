"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { MealInputForm } from "@/components/MealInputForm";
import { MacroSummaryCard } from "@/components/MacroSummaryCard";
import { MealCard } from "@/components/MealCard";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { recommendMeal } from "@/lib/api";
import {
  MealRecommendationRequest,
  MealRecommendationResponse,
} from "@/types/nutrition";
import { Sparkles, Utensils, AlertCircle, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
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
    } catch (err: any) {
      setError(err.message || "Could not connect to FastAPI orchestrator.");
    } finally {
      setLoading(false);
    }
  };

  const totalMealCost = result?.proposed_meals.reduce((sum, item) => sum + item.price, 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro banner */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Precision Nutrition & Body Recomposition
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            An autonomous multi-agent system executing exact mathematical checks on local menus without nutritional hallucinations.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="text-xs">
              <span className="font-semibold">Backend Connection Issue: </span>
              <span>{error}</span>
              <p className="text-zinc-400 mt-0.5">
                Ensure the FastAPI backend is active on <code className="text-zinc-200">http://localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <MealInputForm onSubmit={handleGenerateMealPlan} isLoading={loading} />
          </div>

          {/* Right Column: Output Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {loading && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-12 text-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  LangGraph Agents in Execution
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                  Supervisor analyzing craving → Menu Worker filtering local items → Math Worker verifying exact deficits...
                </p>
                <div className="w-48 bg-zinc-800 rounded-full h-1.5 mx-auto overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full w-2/3 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-200 mb-1">
                  Ready to Orchestrate Your Meal
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mb-4">
                  Select a test scenario on the left or enter custom calorie & protein targets to generate a mathematically guaranteed meal plan.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-[11px] text-zinc-500">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                    🍜 Yum Yai Thai
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                    🥟 Tapari Momo
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                    🍗 KFC
                  </span>
                </div>
              </div>
            )}

            {!loading && result && currentRequest && (
              <div className="space-y-6">
                {/* Macro Progress Card */}
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

                {/* Proposed Meals Grid */}
                <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 shadow-xl shadow-black/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Recommended Menu Items ({result.proposed_meals.length})
                      </h3>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Total Meal Cost:{" "}
                      <span className="font-semibold text-emerald-400">
                        {formatCurrency(totalMealCost)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.proposed_meals.map((item, idx) => (
                      <MealCard key={idx} item={item} index={idx} />
                    ))}
                  </div>
                </div>

                {/* Agent Reasoning & Feedback */}
                <FeedbackBanner
                  feedback={result.feedback}
                  iterations={result.iterations_used}
                  status={result.status}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 mt-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-500">
          Precision Nutrition Orchestrator • LangGraph + AWS Bedrock + FastAPI + Next.js
        </div>
      </footer>
    </div>
  );
}
