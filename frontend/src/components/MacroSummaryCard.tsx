"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Flame, Dumbbell, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { NutritionSummary } from "@/types/nutrition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const totalDayCalories = currentCalories + summary.total_calories;
  const totalDayProtein = currentProtein + summary.total_protein_g;

  const calPercentage = Math.min(100, Math.round((totalDayCalories / targetCalories) * 100));
  const proteinPercentage = Math.min(100, Math.round((totalDayProtein / targetProtein) * 100));

  const isApproved = status === "APPROVED" && summary.fits_calorie_budget;

  return (
    <Card className="border border-slate-200/90 shadow-sm overflow-hidden bg-white">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
              isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Macro Verification Analysis
                </CardTitle>
                <Badge variant={isApproved ? "success" : "warning"} className="text-[10px] font-semibold">
                  {isApproved ? "Optimal Fit" : "Approximation"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Mathematical evaluation against daily macronutrient thresholds
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <Badge variant="secondary" className="font-mono text-[11px] gap-1 px-2.5 py-1 text-slate-700">
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>{iterationsUsed} {iterationsUsed === 1 ? "cycle" : "cycles"}</span>
            </Badge>
            <Badge variant="secondary" className="font-mono text-[11px] gap-1 px-2.5 py-1 text-slate-700">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{executionTimeMs} ms</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Visual Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Calorie Meter */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-800 font-semibold text-xs">
                <Flame className="w-4 h-4 text-amber-600" />
                <span className="uppercase tracking-wider">Calories</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-300 bg-amber-50 text-amber-800">
                {calPercentage}% of Goal
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary.total_calories}
                </span>
                <span className="text-xs text-slate-500 ml-1">kcal in meal</span>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span>Daily total: </span>
                <span className="text-slate-900 font-bold">{totalDayCalories} / {targetCalories}</span>
              </div>
            </div>

            <Progress
              value={calPercentage}
              indicatorClassName={
                totalDayCalories > targetCalories
                  ? "bg-rose-500"
                  : "bg-amber-500"
              }
            />

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Buffer after meal:</span>
              <Badge
                variant={summary.remaining_calories_after_meal >= 0 ? "success" : "destructive"}
                className="text-[10px] font-mono font-bold"
              >
                {summary.remaining_calories_after_meal >= 0
                  ? `+${summary.remaining_calories_after_meal} kcal buffer`
                  : `${summary.remaining_calories_after_meal} kcal deficit`}
              </Badge>
            </div>
          </div>

          {/* Protein Meter */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-indigo-800 font-semibold text-xs">
                <Dumbbell className="w-4 h-4 text-indigo-600" />
                <span className="uppercase tracking-wider">Protein</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 bg-indigo-50 text-indigo-800">
                {proteinPercentage}% of Goal
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary.total_protein_g}
                </span>
                <span className="text-xs text-slate-500 ml-1">grams in meal</span>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span>Daily total: </span>
                <span className="text-slate-900 font-bold">{totalDayProtein}g / {targetProtein}g</span>
              </div>
            </div>

            <Progress
              value={proteinPercentage}
              indicatorClassName="bg-indigo-600"
            />

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Goal fulfillment:</span>
              <Badge
                variant={summary.meets_protein_target ? "success" : "cyan"}
                className="text-[10px] font-mono font-bold"
              >
                {summary.meets_protein_target
                  ? "✓ Target Met Today"
                  : `${summary.remaining_protein_after_meal}g needed today`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Verification Status Callout */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isApproved
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : "bg-amber-50/80 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {isApproved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold">
                {isApproved
                  ? "Deterministic Macro Fit Confirmed"
                  : "Approximation: Boundary Constraints Met"}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isApproved
                  ? "Every item's nutrition profile was deterministically summed by the Math Worker without generative hallucination."
                  : "Items adjusted within available restaurant catalog boundaries."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
