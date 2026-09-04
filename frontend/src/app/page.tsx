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
import {
  Utensils,
  AlertCircle,
  ShoppingBag,
  Flame,
  Dumbbell,
  Cpu,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

  const totalMealCost =
    result?.proposed_meals.reduce((sum, item) => sum + item.price, 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Bento Top Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tile 1 */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Calorie Target</p>
              <p className="text-sm sm:text-base font-extrabold text-white">
                {currentRequest ? `${currentRequest.target_calories} kcal` : "2,400 kcal"}
              </p>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Protein Target</p>
              <p className="text-sm sm:text-base font-extrabold text-white">
                {currentRequest ? `${currentRequest.target_protein}g` : "155g"}
              </p>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Verification</p>
              <p className="text-sm sm:text-base font-extrabold text-emerald-400">Zero Hallucinations</p>
            </div>
          </div>

          {/* Tile 4 */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Multi-Agent State</p>
              <p className="text-sm sm:text-base font-extrabold text-white">
                {result ? `Verified (${result.iterations_used}c)` : "Awaiting Input"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="text-xs">
              <span className="font-bold">FastAPI Connection Error: </span>
              <span>{error}</span>
              <p className="text-zinc-400 mt-0.5">
                Verify that Uvicorn is active on <code className="text-zinc-200">http://localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* Bento Grid Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Bento Cell 1: Command & Control Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <MealInputForm onSubmit={handleGenerateMealPlan} isLoading={loading} />
          </div>

          {/* Bento Cell 2: Dashboard Results & Visualization (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Loading State with Skeletons */}
            {loading && (
              <div className="space-y-6">
                <Card className="border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl" />
                </Card>

                <Card className="border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                  </div>
                </Card>
              </div>
            )}

            {/* Idle / Empty State */}
            {!loading && !result && (
              <Card className="border-dashed border-zinc-800/80 bg-zinc-900/40 text-center p-8 sm:p-12 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  Multi-Agent Orchestrator Ready
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
                  Enter your craving on the left or select a pre-configured test scenario to have our Supervisor, Menu Worker, and Math Worker compute an exact plan.
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    🍜 Yum Yai Thai
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    🥟 Tapari Momo
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    🍗 KFC
                  </Badge>
                </div>
              </Card>
            )}

            {/* Verified Result State */}
            {!loading && result && currentRequest && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                {/* 1. Macro Visual Progress Section */}
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

                {/* 2. Recommended Meals Bento Showcase */}
                <Card className="border-zinc-800/80 bg-zinc-900/60 shadow-2xl overflow-hidden">
                  <CardHeader className="pb-4 border-b border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <CardTitle className="text-base">
                          Recommended Dishes ({result.proposed_meals.length})
                        </CardTitle>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Total Meal Cost:{" "}
                        <span className="font-bold text-emerald-400 text-sm ml-1 font-mono">
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

                {/* 3. Agent Transparency Collapsible Disclosure */}
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
                    className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-800/50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Plan & Run New Search</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modern Minimalist Footer */}
      <footer className="border-t border-zinc-800/60 py-6 mt-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Precision Nutrition Orchestrator</span>
          </div>
          <div>LangGraph • AWS Bedrock • FastAPI • Next.js Bento Dashboard</div>
        </div>
      </footer>
    </div>
  );
}
