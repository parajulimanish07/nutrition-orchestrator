"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Flame, Dumbbell, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { NutritionSummary } from "@/types/nutrition";

interface MacroSummaryCardProps {
  summary: NutritionSummary;
  status: string;
  iterationsUsed: number;
  executionTimeMs: number;
  targetCalories: number;
  targetProtein: number;
  currentCalories: number;
  currentProtein: number;
}

export function MacroSummaryCard({
  summary,
  status,
  iterationsUsed,
  executionTimeMs,
  targetCalories,
  targetProtein,
  currentCalories,
  currentProtein,
}: MacroSummaryCardProps) {
  // Total consumed today including this proposed meal
  const totalDayCalories = currentCalories + summary.total_calories;
  const totalDayProtein = currentProtein + summary.total_protein_g;

  const calPercentage = Math.min(100, Math.round((totalDayCalories / targetCalories) * 100));
  const proteinPercentage = Math.min(100, Math.round((totalDayProtein / targetProtein) * 100));

  const isApproved = status === "APPROVED" && summary.fits_calorie_budget;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 shadow-xl shadow-black/40 backdrop-blur-sm">
      {/* Header with Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-white">Macro Verification Report</h2>
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Hallucination Math</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400">Deterministic check by Math Worker engine</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>{iterationsUsed} {iterationsUsed === 1 ? "cycle" : "cycles"}</span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{executionTimeMs} ms</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Calorie Card */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-amber-400">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Meal Calories</span>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {calPercentage}% of day
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {summary.total_calories}
            </span>
            <span className="text-xs text-zinc-500">kcal</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalDayCalories > targetCalories
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-amber-500 to-amber-400"
              }`}
              style={{ width: `${calPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>After meal: {summary.remaining_calories_after_meal} kcal buffer</span>
            <span>Target: {targetCalories}</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <Dumbbell className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Meal Protein</span>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {proteinPercentage}% of day
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mb-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {summary.total_protein_g}
            </span>
            <span className="text-xs text-zinc-500">grams</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
              style={{ width: `${proteinPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>
              {summary.remaining_protein_after_meal <= 0
                ? "Target achieved!"
                : `${summary.remaining_protein_after_meal}g needed today`}
            </span>
            <span>Target: {targetProtein}g</span>
          </div>
        </div>
      </div>

      {/* Verification Status Pill */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between ${
          isApproved
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {isApproved ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs font-semibold">
              {isApproved
                ? "Optimal Meal Combination Verified"
                : "Approximation: Boundary Constraints Met"}
            </p>
            <p className="text-[11px] opacity-80">
              {isApproved
                ? "Selection strictly fits within your daily calorie limit."
                : "Calorie buffer adjusted to prevent nutritional overshoot."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
