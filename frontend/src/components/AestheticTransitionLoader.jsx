// src/components/AestheticTransitionLoader.jsx
import React from 'react';
import { Activity, Tractor, Scale } from 'lucide-react';

export default function AestheticTransitionLoader({ targetMode, message }) {
  const isMandi = targetMode === 'mandi';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111315]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex flex-col items-center max-w-sm text-center p-8 space-y-6">
        
        {/* Minimalist Radar / Telemetry Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer Pulsing Wave */}
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-40"></div>
          {/* Rotating Ring */}
          <div className="absolute inset-1 rounded-full border-t-2 border-r-2 border-[#D97706] animate-spin"></div>
          {/* Central Emblem */}
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white shadow-glow">
            {isMandi ? (
              <Scale className="w-6 h-6 text-[#10B981] animate-pulse" />
            ) : (
              <Tractor className="w-6 h-6 text-[#D97706] animate-pulse" />
            )}
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono tracking-[0.25em] text-[#D4A373] uppercase font-bold">
            {isMandi ? 'APMC Mandi Realtime Exchange' : 'AgriMart Machinery & Inputs'}
          </div>
          <h3 className="text-lg font-bold font-heading text-white tracking-tight">
            {message || (isMandi ? 'Connecting to National Mandi Feeds...' : 'Loading Equipment Fleet Telemetry...')}
          </h3>
        </div>

        {/* Brushed Gold 1px Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D97706] to-[#10B981] rounded-full animate-shimmer w-full"></div>
        </div>

      </div>
    </div>
  );
}
