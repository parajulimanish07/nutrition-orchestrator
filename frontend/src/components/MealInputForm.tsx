"use client";

import React, { useState } from "react";
import { Zap, UtensilsCrossed, Flame, Dumbbell, Sparkles, SlidersHorizontal } from "lucide-react";
import { MealRecommendationRequest } from "@/types/nutrition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MealInputFormProps {
  onSubmit: (data: MealRecommendationRequest) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: "🍜 Thai High-Protein",
    badge: "Yum Yai Thai",
    prompt: "I want a high protein dinner from Yum Yai Thai under 1000 calories",
    targetCalories: 2400,
    targetProtein: 155,
    currentCalories: 1400,
    currentProtein: 75,
    cuisine: "Yum Yai Thai",
  },
  {
    label: "🥟 Steamed Momo Set",
    badge: "Tapari Momo",
    prompt: "Recommend delicious steamed dumplings from Tapari Momo",
    targetCalories: 2200,
    targetProtein: 140,
    currentCalories: 800,
    currentProtein: 40,
    cuisine: "Tapari Momo",
  },
  {
    label: "🍗 Post-Workout KFC",
    badge: "KFC",
    prompt: "Recommend a high protein post-workout meal from KFC with at least 40g protein",
    targetCalories: 2500,
    targetProtein: 160,
    currentCalories: 1100,
    currentProtein: 50,
    cuisine: "KFC",
  },
];

export function MealInputForm({ onSubmit, isLoading }: MealInputFormProps) {
  const [prompt, setPrompt] = useState(
    "I want a high protein dinner from Yum Yai Thai under 1000 calories"
  );
  const [targetCalories, setTargetCalories] = useState(2400);
  const [targetProtein, setTargetProtein] = useState(155);
  const [currentCalories, setCurrentCalories] = useState(1400);
  const [currentProtein, setCurrentProtein] = useState(75);
  const [cuisinePreference, setCuisinePreference] = useState<string>("Yum Yai Thai");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    await onSubmit({
      prompt,
      target_calories: Number(targetCalories),
      target_protein: Number(targetProtein),
      current_calories: Number(currentCalories),
      current_protein: Number(currentProtein),
      cuisine_preference: cuisinePreference || null,
    });
  };

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setPrompt(preset.prompt);
    setTargetCalories(preset.targetCalories);
    setTargetProtein(preset.targetProtein);
    setCurrentCalories(preset.currentCalories);
    setCurrentProtein(preset.currentProtein);
    setCuisinePreference(preset.cuisine);
  };

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/60 shadow-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Orchestrator Command</CardTitle>
              <CardDescription>Input craving and numerical targets for verification</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
            Deterministic Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Preset chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              Quick Scenarios
            </span>
            <span className="text-[10px] text-zinc-500">Click to fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-left p-2.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/70 border border-zinc-800 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-white transition-all flex flex-col justify-between group"
              >
                <span className="font-medium text-[11px] group-hover:text-emerald-400 transition-colors">
                  {preset.label}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">{preset.targetCalories} kcal • {preset.targetProtein}g P</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prompt textarea */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Meal Craving or User Directive</span>
              <span className="text-[10px] text-zinc-500 font-mono">natural language prompt</span>
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/80 transition-all resize-none shadow-inner"
                placeholder="e.g. Recommend high protein dinner from Yum Yai Thai under 1000 calories..."
                required
              />
            </div>
          </div>

          {/* Target Restaurant Segmented selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Vendor Preference</span>
              <span className="text-[10px] text-zinc-500">Local Menu Search</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              {[
                { id: "", label: "All Vendors" },
                { id: "Yum Yai Thai", label: "🍜 Yum Yai" },
                { id: "Tapari Momo", label: "🥟 Tapari" },
                { id: "KFC", label: "🍗 KFC" },
              ].map((vendor) => (
                <button
                  key={vendor.id}
                  type="button"
                  onClick={() => setCuisinePreference(vendor.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all ${
                    cuisinePreference === vendor.id
                      ? "bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {vendor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Macro controls with slider + input */}
          <div className="pt-2 border-t border-zinc-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                Macro Numerical Constraints
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Target Calories */}
              <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-amber-400 text-[10px] font-semibold uppercase mb-1">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> Target</span>
                  <span className="text-zinc-500">kcal</span>
                </div>
                <input
                  type="number"
                  min="500"
                  max="5000"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-bold text-sm focus:outline-none"
                />
                <input
                  type="range"
                  min="1200"
                  max="4000"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-1"
                />
              </div>

              {/* Target Protein */}
              <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-cyan-400 text-[10px] font-semibold uppercase mb-1">
                  <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> Target</span>
                  <span className="text-zinc-500">grams</span>
                </div>
                <input
                  type="number"
                  min="20"
                  max="400"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-bold text-sm focus:outline-none"
                />
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-1"
                />
              </div>

              {/* Current Calories */}
              <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] font-medium uppercase mb-1">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-zinc-500" /> Consumed</span>
                  <span className="text-zinc-500">kcal</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={currentCalories}
                  onChange={(e) => setCurrentCalories(Number(e.target.value))}
                  className="w-full bg-transparent text-zinc-200 font-bold text-sm focus:outline-none"
                />
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={currentCalories}
                  onChange={(e) => setCurrentCalories(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500 mt-1"
                />
              </div>

              {/* Current Protein */}
              <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between text-zinc-400 text-[10px] font-medium uppercase mb-1">
                  <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3 text-zinc-500" /> Consumed</span>
                  <span className="text-zinc-500">grams</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={currentProtein}
                  onChange={(e) => setCurrentProtein(Number(e.target.value))}
                  className="w-full bg-transparent text-zinc-200 font-bold text-sm focus:outline-none"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={currentProtein}
                  onChange={(e) => setCurrentProtein(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>LangGraph Agents Orchestrating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify & Orchestrate Meal Plan</span>
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
