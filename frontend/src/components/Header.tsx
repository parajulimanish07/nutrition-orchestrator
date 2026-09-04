"use client";

import React, { useEffect, useState } from "react";
import { Activity, Sparkles, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";
import { HealthCheckResponse } from "@/types/nutrition";

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
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-zinc-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Nutrition Orchestrator
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Phase 4
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Mathematically Verified Multi-Agent Meal Planning
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>LangGraph + AWS Bedrock</span>
          </div>

          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
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
