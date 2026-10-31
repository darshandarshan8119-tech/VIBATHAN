// src/assistant/AgentActivity.jsx
import React from 'react';
import { Sparkles, Terminal, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AgentActivity({ currentAction, toolName, steps = [] }) {
  if (!currentAction && !toolName) return null;

  return (
    <div className="my-2 p-3.5 rounded-2xl bg-[#FAF9F5] border border-black/[0.06] text-xs font-mono max-w-lg animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C26747] animate-ping"></span>
          <span className="font-bold text-[#121212] uppercase tracking-wider text-[10px]">
            Agent Orchestration Pipeline
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Deterministic Tool Call</span>
      </div>

      <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-black/[0.04]">
        <Terminal className="w-3.5 h-3.5 text-[#C26747] shrink-0" />
        <span className="font-medium text-[11px] truncate">
          {toolName ? `Invoking Tool: ${toolName}` : currentAction}
        </span>
      </div>

      {steps.length > 0 && (
        <div className="mt-2 space-y-1 text-[10px] text-slate-500">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
