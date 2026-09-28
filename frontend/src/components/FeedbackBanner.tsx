"use client";

import React from "react";
import { GitBranch, CheckCheck } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface FeedbackBannerProps {
  feedback: string;
  iterations: number;
  status: string;
}

export function FeedbackBanner({ feedback, iterations, status }: FeedbackBannerProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      <Accordion type="single" collapsible defaultValue="diagnostics">
        <AccordionItem value="diagnostics" className="border-b-0">
          <AccordionTrigger className="py-1 hover:no-underline">
            <div className="flex items-center space-x-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  Multi-Agent Audit Trail & Execution History
                </span>
                <span className="text-xs text-slate-500">
                  {iterations === 1
                    ? "Single-pass execution — constraints met immediately"
                    : `${iterations} iterative loopback cycles for error correction`}
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pt-3 pb-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Math Worker Evaluation:</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-slate-300 text-slate-700 bg-white">
                  State: {status}
                </Badge>
              </div>

              <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed shadow-2xs">
                {feedback}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 pt-1">
                <span>Supervisor routing: Finalized without hallucinations</span>
                <span className="font-mono text-[10px] text-slate-400">Path: Supervisor → Menu Worker → Math Worker → Final State</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
