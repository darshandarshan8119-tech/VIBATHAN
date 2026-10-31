// src/assistant/cards/CommodityPriceCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown, MapPin, Scale, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function CommodityPriceCard({ data, onAction }) {
  if (!data) return null;

  const {
    commodity = 'Wheat (Sharbati)',
    mandi = 'Ludhiana APMC, Punjab',
    currentPrice = 2450,
    prevPrice = 2390,
    change = '+2.4%',
    isUp = true,
    dayHigh = 2480,
    dayLow = 2410,
    unit = 'Quintal',
    timestamp = 'Today, 10:30 AM',
    source = 'AGMARKNET Daily Modal',
    agmarknetBenchmark = 2275,
  } = data;

  const priceDiff = currentPrice - prevPrice;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[#C26747]/10 text-[#C26747] text-[10px] font-mono font-bold uppercase tracking-wider">
              Mandi Spot Rate
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timestamp}</span>
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#121212]">
            {commodity}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#C26747] shrink-0" />
            <span className="font-medium">{mandi}</span>
          </div>
        </div>

        {/* Price & Change Badge */}
        <div className="text-right shrink-0">
          <div className="text-xl sm:text-2xl font-black font-mono text-[#121212]">
            ₹{Number(currentPrice).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">per {unit}</div>
          <div className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-md mt-1 ${
            isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isUp ? `+₹${Math.abs(priceDiff)} (${change})` : `-₹${Math.abs(priceDiff)} (${change})`}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-black/[0.06] text-center">
        <div className="bg-[#FAF9F5] p-2 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Day High</span>
          <span className="text-xs font-extrabold font-mono text-slate-800">₹{dayHigh}</span>
        </div>
        <div className="bg-[#FAF9F5] p-2 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Day Low</span>
          <span className="text-xs font-extrabold font-mono text-slate-800">₹{dayLow}</span>
        </div>
        <div className="bg-[#FAF9F5] p-2 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">MSP Benchmark</span>
          <span className="text-xs font-extrabold font-mono text-[#C26747]">₹{agmarknetBenchmark}</span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Source: {source}</span>
        </div>

        <div className="flex items-center gap-2">
          {onAction && (
            <button
              onClick={() => onAction('VIEW_DEPTH', { commodity, mandi })}
              className="px-3 py-1.5 rounded-full bg-[#121212] hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all flex items-center gap-1 cursor-pointer">
              <span>View Depth</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
