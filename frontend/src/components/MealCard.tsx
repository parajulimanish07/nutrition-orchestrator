"use client";

import React from "react";
import { Flame, Dumbbell } from "lucide-react";
import { MealItem } from "@/types/nutrition";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MealCardProps {
  item: MealItem;
  index?: number;
}

export function MealCard({ item }: MealCardProps) {
  const getVendorBadge = (restaurant: string) => {
    switch (restaurant) {
      case "Yum Yai Thai":
        return {
          label: "🍜 Yum Yai Thai",
          variant: "success" as const,
        };
      case "Tapari Momo":
        return {
          label: "🥟 Tapari Momo",
          variant: "violet" as const,
        };
      case "KFC":
        return {
          label: "🍗 KFC",
          variant: "destructive" as const,
        };
      default:
        return {
          label: restaurant,
          variant: "secondary" as const,
        };
    }
  };

  const vendor = getVendorBadge(item.restaurant);

  return (
    <div className="group rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant={vendor.variant} className="text-[11px] font-semibold py-0.5">
            {vendor.label}
          </Badge>
          <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {formatCurrency(item.price)}
          </span>
        </div>

        <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-3">
          {item.name}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-zinc-800/80">
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
          <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="font-bold text-zinc-100">{item.calories}</span>
          <span className="text-[10px] text-zinc-500">kcal</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
          <Dumbbell className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="font-bold text-zinc-100">{item.protein_g}g</span>
          <span className="text-[10px] text-zinc-500">protein</span>
        </div>
      </div>
    </div>
  );
}
