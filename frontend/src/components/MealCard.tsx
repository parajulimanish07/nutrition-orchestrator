"use client";

import React from "react";
import { Flame, Dumbbell, Tag } from "lucide-react";
import { MealItem } from "@/types/nutrition";
import { formatCurrency } from "@/lib/utils";

interface MealCardProps {
  item: MealItem;
  index: number;
}

export function MealCard({ item, index }: MealCardProps) {
  const getRestaurantBadge = (restaurant: string) => {
    switch (restaurant) {
      case "Yum Yai Thai":
        return {
          label: "🍜 Yum Yai Thai",
          classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "Tapari Momo":
        return {
          label: "🥟 Tapari Momo",
          classes: "bg-violet-500/10 text-violet-400 border-violet-500/30",
        };
      case "KFC":
        return {
          label: "🍗 KFC",
          classes: "bg-red-500/10 text-red-400 border-red-500/30",
        };
      default:
        return {
          label: restaurant,
          classes: "bg-zinc-800 text-zinc-300 border-zinc-700",
        };
    }
  };

  const badge = getRestaurantBadge(item.restaurant);

  return (
    <div className="bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/50 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border mb-2 ${badge.classes}`}
          >
            {badge.label}
          </span>
          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
            {item.name}
          </h3>
        </div>
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 flex-shrink-0">
          <Tag className="w-3 h-3 text-emerald-400" />
          <span>{formatCurrency(item.price)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-zinc-200">{item.calories}</span>
          <span className="text-[10px]">kcal</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-zinc-200">{item.protein_g}g</span>
          <span className="text-[10px]">protein</span>
        </div>
      </div>
    </div>
  );
}
