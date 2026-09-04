"use client";

import React from "react";
import { Cpu, Workflow } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface FeedbackBannerProps {
  feedback: string;
  iterations: number;
  status: string;
}

export function FeedbackBanner({ feedback, iterations, status }: FeedbackBannerProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <Accordion type="single" collapsible defaultValue="diagnostics">
        <AccordionItem value="diagnostics" className="border-b-0">
          <AccordionTrigger className="py-1 hover:no-underline">
            <div className="flex items-center space-x-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Multi-Agent Audit Trail & Loopback Details
                </span>
                <span className="text-[11px] text-zinc-400">
                  {iterations === 1
                    ? "Single-pass execution — constraints fulfilled immediately"
                    : `${iterations} iterative loopback cycles for error correction`}
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pt-3 pb-1">
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium text-zinc-300">Math Worker Evaluation:</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400">
                  State Machine Status: {status}
                </Badge>
              </div>

              <p className="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 text-[11px]">
                {feedback}
              </p>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                <span>Supervisor routing: finalized without prompt drift</span>
                <span>Node path: Supervisor → Menu Worker → Math Worker → Supervisor</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
