// src/components/MandiTicker.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { LIVE_MANDI_COMMODITIES } from '../data/mockData';

export default function MandiTicker({ onOpenMandiTerminal }) {
  return (
    <div className="bg-[#111315] text-white border-b border-white/[0.08] overflow-hidden py-2 px-4 select-none">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        
        {/* Ticker Lead Label */}
        <button 
          onClick={onOpenMandiTerminal}
          className="flex items-center gap-2 bg-[#E67E22] text-[#111315] px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase font-heading shrink-0 hover:bg-white transition-colors">
          <Activity className="w-3 h-3 stroke-[2.5]" />
          <span>APMC Mandi Live</span>
        </button>

        {/* Scrolling/Flex Ticker Items */}
        <div className="flex items-center gap-6 text-xs font-mono overflow-x-auto no-scrollbar py-0.5">
          {LIVE_MANDI_COMMODITIES.map((item) => (
            <div 
              key={item.id}
              onClick={onOpenMandiTerminal}
              className="flex items-center gap-2 cursor-pointer shrink-0 hover:text-[#D4A373] transition-colors">
              <span className="text-white/80 font-sans font-semibold text-[11px]">{item.name.split('(')[0].trim()}:</span>
              <span className="font-bold text-white">₹{item.price.toLocaleString()}</span>
              
              <span className={`inline-flex items-center text-[10px] font-bold ${
                item.isUp ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}>
                {item.isUp ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                )}
                {item.change}
              </span>
              
              <span className="text-white/30 text-[10px] font-sans">({item.mandi.split(',')[0]})</span>
            </div>
          ))}
        </div>

        {/* View Terminal Action */}
        <button
          onClick={onOpenMandiTerminal}
          className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4A373] hover:text-white transition-colors shrink-0 font-sans">
          <span>Full Market Radar</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
}
