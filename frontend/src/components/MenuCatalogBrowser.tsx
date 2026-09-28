"use client";

import React, { useState, useEffect } from "react";
import { Search, Flame, Dumbbell, Filter, Utensils, RotateCcw, ArrowRight } from "lucide-react";
import { fetchMenuCatalog } from "@/lib/api";
import { MenuItemCatalog } from "@/types/nutrition";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuCatalogBrowserProps {
  onSelectDishForPrompt?: (dishName: string, restaurant: string) => void;
}

export function MenuCatalogBrowser({ onSelectDishForPrompt }: MenuCatalogBrowserProps) {
  const [items, setItems] = useState<MenuItemCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minProtein, setMinProtein] = useState<number>(0);
  const [maxCalories, setMaxCalories] = useState<number>(1000);

  const loadMenu = async () => {
    setLoading(true);
    const data = await fetchMenuCatalog({
      restaurant: selectedRestaurant || undefined,
      min_protein: minProtein > 0 ? minProtein : undefined,
      max_calories: maxCalories < 1000 ? maxCalories : undefined,
    });
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMenu();
  }, [selectedRestaurant, minProtein, maxCalories]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.restaurant.toLowerCase().includes(q) ||
      item.portion_size.toLowerCase().includes(q)
    );
  });

  const handleResetFilters = () => {
    setSelectedRestaurant("");
    setSearchQuery("");
    setMinProtein(0);
    setMaxCalories(1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Card */}
      <Card className="border border-slate-200/90 shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Restaurant Menu Database</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Browse verified nutrition profiles from local restaurant partner menus
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search input (6 cols) */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish name, ingredients, or portions..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Restaurant Selector (6 cols) */}
            <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "", label: "All Restaurants" },
                { id: "Yum Yai Thai", label: "🍜 Yum Yai Thai" },
                { id: "Tapari Momo", label: "🥟 Tapari Momo" },
                { id: "KFC", label: "🍗 KFC" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedRestaurant(v.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedRestaurant === v.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick macro range filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                <span className="flex items-center gap-1 text-amber-700">
                  <Flame className="w-3.5 h-3.5" /> Max Calories: {maxCalories} kcal
                </span>
                <span className="text-slate-400 font-normal">Cap</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxCalories}
                onChange={(e) => setMaxCalories(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                <span className="flex items-center gap-1 text-indigo-700">
                  <Dumbbell className="w-3.5 h-3.5" /> Min Protein: {minProtein}g
                </span>
                <span className="text-slate-400 font-normal">Floor</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={minProtein}
                onChange={(e) => setMinProtein(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{filteredItems.length}</span> verified menu items
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-3/4" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 rounded-lg" />
                <Skeleton className="h-8 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <Card className="border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
          <Utensils className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 mb-1">No matching dishes found</h4>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search keywords or loosening calorie and protein filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            Reset Filters
          </button>
        </Card>
      )}

      {/* Dish Grid */}
      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="p-4.5 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    variant={
                      item.restaurant === "Yum Yai Thai"
                        ? "success"
                        : item.restaurant === "Tapari Momo"
                        ? "violet"
                        : "destructive"
                    }
                    className="text-[11px] font-semibold"
                  >
                    {item.restaurant}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug mb-1">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Portion: {item.portion_size}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                {/* 4 Macros Chips */}
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="bg-amber-50/80 border border-amber-200/70 p-1.5 rounded-lg">
                    <span className="block text-[10px] text-amber-800 font-semibold">Calories</span>
                    <span className="text-xs font-bold text-amber-950 font-mono">{item.calories}</span>
                  </div>
                  <div className="bg-indigo-50/80 border border-indigo-200/70 p-1.5 rounded-lg">
                    <span className="block text-[10px] text-indigo-800 font-semibold">Protein</span>
                    <span className="text-xs font-bold text-indigo-950 font-mono">{item.protein_g}g</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 p-1.5 rounded-lg">
                    <span className="block text-[10px] text-slate-600 font-semibold">Carbs</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{item.carbs_g}g</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 p-1.5 rounded-lg">
                    <span className="block text-[10px] text-slate-600 font-semibold">Fat</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{item.fat_g}g</span>
                  </div>
                </div>

                {onSelectDishForPrompt && (
                  <button
                    type="button"
                    onClick={() => onSelectDishForPrompt(item.name, item.restaurant)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Target dish in Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
