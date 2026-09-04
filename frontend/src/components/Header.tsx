"use client";

import React, { useEffect, useState } from "react";
import { Activity, Sparkles, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { HealthCheckResponse } from "@/types/nutrition";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      const res = await checkBackendHealth();
      setHealth(res);
      setLoading(false);
    }
    verify();
    const interval = setInterval(verify, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Sparkles className="w-4 h-4 text-zinc-950 font-extrabold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Nutrition Orchestrator
              </h1>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-semibold px-2 py-0">
                Phase 4
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Mathematically Verified Multi-Agent Meal Planning
            </p>
          </div>
        </div>

        {/* Right Info Chips */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">Engine:</span>
            <span className="text-zinc-200 font-medium">LangGraph + Bedrock</span>
          </div>

          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              loading
                ? "bg-zinc-800/50 text-zinc-400 border-zinc-700"
                : health
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {loading ? (
              <Activity className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : health ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>
              {loading
                ? "Connecting..."
                : health
                ? `FastAPI Online (v${health.version})`
                : "Backend Offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
