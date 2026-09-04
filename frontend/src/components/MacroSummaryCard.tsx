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
    <Card className="border-zinc-800/80 bg-zinc-900/60 shadow-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Macro Verification Report
                <Badge variant={isApproved ? "success" : "warning"} className="text-[10px] font-semibold">
                  {isApproved ? "Zero Hallucination Math" : "Approximation"}
                </Badge>
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="font-mono text-[11px] gap-1 px-2.5 py-1">
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>{iterationsUsed} {iterationsUsed === 1 ? "cycle" : "cycles"}</span>
            </Badge>
            <Badge variant="secondary" className="font-mono text-[11px] gap-1 px-2.5 py-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{executionTimeMs} ms</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Visual Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Calorie Meter */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Calories</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-400">
                {calPercentage}% Target
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {summary.total_calories}
                </span>
                <span className="text-xs text-zinc-400 ml-1">kcal in meal</span>
              </div>
              <div className="text-right text-[11px] text-zinc-400">
                <span>Day total: </span>
                <span className="text-zinc-200 font-semibold">{totalDayCalories} / {targetCalories}</span>
              </div>
            </div>

            <Progress
              value={calPercentage}
              indicatorClassName={
                totalDayCalories > targetCalories
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-amber-500 to-amber-300"
              }
            />

            {/* Dynamic remaining buffer tag */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-zinc-400">Buffer after meal:</span>
              <Badge
                variant={summary.remaining_calories_after_meal >= 0 ? "success" : "destructive"}
                className="text-[10px] font-mono font-bold px-2 py-0.5"
              >
                {summary.remaining_calories_after_meal >= 0
                  ? `+${summary.remaining_calories_after_meal} kcal buffer`
                  : `${summary.remaining_calories_after_meal} kcal deficit overshoot`}
              </Badge>
            </div>
          </div>

          {/* Protein Meter */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-cyan-400">
                <Dumbbell className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Protein</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-400">
                {proteinPercentage}% Target
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {summary.total_protein_g}
                </span>
                <span className="text-xs text-zinc-400 ml-1">grams in meal</span>
              </div>
              <div className="text-right text-[11px] text-zinc-400">
                <span>Day total: </span>
                <span className="text-zinc-200 font-semibold">{totalDayProtein}g / {targetProtein}g</span>
              </div>
            </div>

            <Progress
              value={proteinPercentage}
              indicatorClassName="bg-gradient-to-r from-cyan-500 to-teal-400"
            />

            {/* Dynamic remaining buffer tag */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-zinc-400">Goal fulfillment:</span>
              <Badge
                variant={summary.meets_protein_target ? "success" : "cyan"}
                className="text-[10px] font-mono font-bold px-2 py-0.5"
              >
                {summary.meets_protein_target
                  ? "✓ Target Satisfied"
                  : `${summary.remaining_protein_after_meal}g needed today`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Verification Status Callout */}
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
              <p className="text-xs font-bold tracking-tight">
                {isApproved
                  ? "Optimal Mathematical Solution Confirmed"
                  : "Approximation: Boundary Constraints Met"}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isApproved
                  ? "Calculated deterministically by Math Worker — zero AI numerical hallucinations."
                  : "Selection adjusted to stay within target calorie limits."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
