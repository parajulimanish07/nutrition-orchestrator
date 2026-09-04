"use client";

import React from "react";
import { MessageSquareText, Cpu, CheckCircle } from "lucide-react";

interface FeedbackBannerProps {
  feedback: string;
  iterations: number;
  status: string;
}

export function FeedbackBanner({ feedback, iterations, status }: FeedbackBannerProps) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-Agent Reasoning & Math Verification</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          {iterations === 1 ? "Single-pass validation" : `${iterations} corrective iterations`}
        </span>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed pl-5.5 relative">
        <span className="absolute left-0 top-0 text-emerald-400 font-bold">↳</span>
        {feedback}
      </p>
    </div>
  );
}
