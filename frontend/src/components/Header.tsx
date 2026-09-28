"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Compass, Sliders } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { HealthCheckResponse } from "@/types/nutrition";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  activeTab?: "planner" | "catalog";
  onTabChange?: (tab: "planner" | "catalog") => void;
}

export function Header({ activeTab = "planner", onTabChange }: HeaderProps) {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyHealth = async () => {
    setLoading(true);
    const res = await checkBackendHealth();
    setHealth(res);
    setLoading(false);
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-sm shadow-emerald-700/20 text-white flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                NutriOrchestrator
              </span>
              <Badge variant="success" className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0">
                Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Precision Macro Optimization & Deterministic Meal Intelligence
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (if onTabChange provided) */}
        {onTabChange && (
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => onTabChange("planner")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "planner"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Meal Planner</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange("catalog")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "catalog"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Menu Database</span>
            </button>
          </nav>
        )}

        {/* Right Info Chips: API status + engine */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
            <span className="font-medium text-slate-700">LangGraph Multi-Agent</span>
          </div>

          <button
            type="button"
            onClick={verifyHealth}
            title="Click to re-check API connection"
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              loading
                ? "bg-slate-50 text-slate-500 border-slate-200"
                : health
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
            }`}
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : health ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>
              {loading
                ? "Checking..."
                : health
                ? `API Online (v${health.version})`
                : "API Offline"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
