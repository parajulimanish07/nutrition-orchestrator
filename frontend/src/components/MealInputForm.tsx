"use client";

import React, { useState } from "react";
import { Send, Zap, UtensilsCrossed, Flame, Dumbbell } from "lucide-react";
import { MealRecommendationRequest } from "@/types/nutrition";

interface MealInputFormProps {
  onSubmit: (data: MealRecommendationRequest) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: "🍜 Thai High Protein",
    prompt: "I want a high protein dinner from Yum Yai Thai under 1000 calories",
    targetCalories: 2400,
    targetProtein: 155,
    currentCalories: 1400,
    currentProtein: 75,
    cuisine: "Yum Yai Thai",
  },
  {
    label: "🥟 Steamed Momo Platter",
    prompt: "Recommend delicious steamed dumplings from Tapari Momo",
    targetCalories: 2200,
    targetProtein: 140,
    currentCalories: 800,
    currentProtein: 40,
    cuisine: "Tapari Momo",
  },
  {
    label: "🍗 Post-Workout KFC",
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
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 shadow-xl shadow-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Meal Request & Targets</h2>
            <p className="text-xs text-zinc-400">Configure your nutritional constraints</p>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Quick Test Scenarios
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left px-3 py-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-white transition-all duration-150 flex items-center justify-between group"
            >
              <span>{preset.label}</span>
              <Zap className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Craving Prompt Input */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Meal Craving or Goal Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
            placeholder="e.g. Recommend high protein dinner from KFC or Tapari Momo..."
            required
          />
        </div>

        {/* Vendor Quick Filter */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Target Restaurant (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "", label: "All Vendors" },
              { id: "Yum Yai Thai", label: "🍜 Yum Yai Thai" },
              { id: "Tapari Momo", label: "🥟 Tapari Momo" },
              { id: "KFC", label: "🍗 KFC" },
            ].map((vendor) => (
              <button
                key={vendor.id}
                type="button"
                onClick={() => setCuisinePreference(vendor.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  cuisinePreference === vendor.id
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {vendor.label}
              </button>
            ))}
          </div>
        </div>

        {/* Macro Targets & Intake Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Target Calories */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center space-x-1.5 text-amber-400 mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Target Cals</span>
            </div>
            <input
              type="number"
              min="500"
              max="5000"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-full bg-transparent text-white font-semibold text-base focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500">kcal / day</span>
          </div>

          {/* Target Protein */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Target Protein</span>
            </div>
            <input
              type="number"
              min="20"
              max="400"
              value={targetProtein}
              onChange={(e) => setTargetProtein(Number(e.target.value))}
              className="w-full bg-transparent text-white font-semibold text-base focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500">grams / day</span>
          </div>

          {/* Current Calories Consumed */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center space-x-1.5 text-zinc-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Eaten Cals</span>
            </div>
            <input
              type="number"
              min="0"
              max="5000"
              value={currentCalories}
              onChange={(e) => setCurrentCalories(Number(e.target.value))}
              className="w-full bg-transparent text-zinc-200 font-semibold text-base focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500">consumed today</span>
          </div>

          {/* Current Protein Consumed */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center space-x-1.5 text-zinc-400 mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Eaten Protein</span>
            </div>
            <input
              type="number"
              min="0"
              max="400"
              value={currentProtein}
              onChange={(e) => setCurrentProtein(Number(e.target.value))}
              className="w-full bg-transparent text-zinc-200 font-semibold text-base focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500">grams today</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Orchestrating Multi-Agent Plan...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Generate Mathematically Verified Meal Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
