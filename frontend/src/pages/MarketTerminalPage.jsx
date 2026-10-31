// src/pages/MarketTerminalPage.jsx
import React from 'react';
import AgriStockExchangeView from '../components/AgriStockExchangeView';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function MarketTerminalPage({ activeTab, onTabChange, onReturnToAssistant }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9]">
      {/* Subtle Return Header */}
      <div className="bg-[#121212] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AGRISTOCK MANDI COMMODITY TERMINAL &bull; SECONDARY TRADING MODULE</span>
        </div>

        <button
          onClick={onReturnToAssistant}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all cursor-pointer">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Return to AI Copilot</span>
        </button>
      </div>

      <main className="flex-1 pb-16">
        <AgriStockExchangeView 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
        />
      </main>
    </div>
  );
}
