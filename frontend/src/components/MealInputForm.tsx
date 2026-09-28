"use client";

import React, { useState } from "react";
import {
  UtensilsCrossed,
  Flame,
  Dumbbell,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from "lucide-react";
import { MealRecommendationRequest } from "@/types/nutrition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MealInputFormProps {
  onSubmit: (data: MealRecommendationRequest) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    title: "Thai High-Protein Dinner",
    vendor: "Yum Yai Thai",
    tag: "High Protein",
    prompt: "I want a high protein dinner from Yum Yai Thai under 1000 calories",
    targetCalories: 2400,
    targetProtein: 155,
    currentCalories: 1400,
    currentProtein: 75,
    cuisine: "Yum Yai Thai",
  },
  {
    title: "Steamed Momo Post-Run",
    vendor: "Tapari Momo",
    tag: "Clean Carbs",
    prompt: "Recommend delicious steamed dumplings from Tapari Momo with balanced macros",
    targetCalories: 2200,
    targetProtein: 140,
    currentCalories: 800,
    currentProtein: 40,
    cuisine: "Tapari Momo",
  },
  {
    title: "KFC Muscle Recovery",
    vendor: "KFC",
    tag: "Bulking",
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

  const remainingCalsBudget = Math.max(0, targetCalories - currentCalories);
  const remainingProteinBudget = Math.max(0, targetProtein - currentProtein);

  return (
    <Card className="border border-slate-200/90 shadow-sm overflow-hidden bg-white">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Plan Meal Parameters
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Specify constraints and target nutrient thresholds
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] font-medium text-slate-600">
            Precision Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Curated Quick Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Quick Scenarios
            </span>
            <span className="text-[11px] text-slate-400">Click to autofill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all text-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors">
                      {preset.vendor}
                    </span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                      {preset.tag}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {preset.title}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{preset.targetCalories} kcal</span>
                  <span>{preset.targetProtein}g P</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal Request Directive */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Meal Directive or Specific Craving</span>
              <span className="text-[11px] font-normal text-slate-400">
                Natural text instructions
              </span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs resize-none"
              placeholder="e.g. Recommend a high protein dinner from Yum Yai Thai under 1000 calories..."
              required
            />
          </div>

          {/* Restaurant Filter Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Restaurant Preference</span>
              <span className="text-[11px] font-normal text-slate-400">
                Vendor catalog
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              {[
                { id: "", label: "All Menus" },
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
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/70 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {vendor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Macro Numerical Sliders and Fields */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                Macro Budget Constraints
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-0.5">
                  <span className="font-semibold text-slate-700">{remainingCalsBudget}</span> kcal left
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <span className="font-semibold text-slate-700">{remainingProteinBudget}g</span> P needed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Calories */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1 text-amber-700">
                    <Flame className="w-3.5 h-3.5" /> Target Calories
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="800"
                      max="4500"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-right font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 font-normal">kcal</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="3800"
                  step="50"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Target Protein */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <Dumbbell className="w-3.5 h-3.5" /> Target Protein
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="30"
                      max="350"
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(Number(e.target.value))}
                      className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-right font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-slate-500 font-normal">g</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="280"
                  step="5"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Already Consumed Calories */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-slate-400" /> Consumed Calories
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="4000"
                      value={currentCalories}
                      onChange={(e) => setCurrentCalories(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-right font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <span className="text-[11px] text-slate-500 font-normal">kcal</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={currentCalories}
                  onChange={(e) => setCurrentCalories(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>

              {/* Already Consumed Protein */}
              <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-slate-400" /> Consumed Protein
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={currentProtein}
                      onChange={(e) => setCurrentProtein(Number(e.target.value))}
                      className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-right font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <span className="text-[11px] text-slate-500 font-normal">g</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={currentProtein}
                  onChange={(e) => setCurrentProtein(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Orchestrating Multi-Agent Workflow...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Verified Meal Recommendation</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
