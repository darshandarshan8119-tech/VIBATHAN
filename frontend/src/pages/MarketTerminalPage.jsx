// src/pages/MarketTerminalPage.jsx
import React from 'react';
import AgriStockExchangeView from '../components/AgriStockExchangeView';
import { Activity } from 'lucide-react';

export default function MarketTerminalPage({ activeTab, onTabChange }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9]">
      {/* Subtle Terminal Status Strip */}
      <div className="bg-[#121212] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AGRISTOCK MANDI COMMODITY TERMINAL &bull; SECONDARY TRADING MODULE</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/70">
          <span>T+0 RTGS Settlements Enabled &bull; Zero Brokerage</span>
        </div>
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
