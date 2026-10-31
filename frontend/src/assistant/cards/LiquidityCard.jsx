// src/assistant/cards/LiquidityCard.jsx
import React from 'react';
import { BarChart2, TrendingUp, TrendingDown, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function LiquidityCard({ data, onAction }) {
  if (!data) return null;

  const {
    commodity = 'Wheat (Sharbati)',
    mandi = 'Ludhiana APMC, Punjab',
    bestBid = 2450,
    bestAsk = 2470,
    spread = 20,
    spreadPct = '0.81%',
    totalBidQty = 450,
    totalAskQty = 380,
    unit = 'Qtl',
    timestamp = 'Live Depth Stream',
    bids = [
      { price: 2450, qty: 120, orders: 3 },
      { price: 2445, qty: 90, orders: 2 },
      { price: 2440, qty: 110, orders: 4 },
      { price: 2435, qty: 80, orders: 2 },
      { price: 2430, qty: 50, orders: 1 },
    ],
    asks = [
      { price: 2470, qty: 80, orders: 2 },
      { price: 2475, qty: 100, orders: 3 },
      { price: 2480, qty: 90, orders: 2 },
      { price: 2485, qty: 60, orders: 1 },
      { price: 2490, qty: 50, orders: 2 },
    ],
    imbalance = 'Bid Dominant (+18.4%)',
  } = data;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <BarChart2 className="w-3 h-3" />
              <span>5-Level Market Depth</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timestamp}</span>
            </span>
          </div>
          <h3 className="font-heading font-extrabold text-base text-[#121212]">
            {commodity} &bull; <span className="text-slate-500 font-normal">{mandi}</span>
          </h3>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Bid/Ask Spread</span>
          <span className="text-sm font-extrabold font-mono text-slate-900">₹{spread}</span>
          <span className="text-[11px] font-mono text-slate-500 ml-1">({spreadPct})</span>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-black/[0.06] text-center text-xs">
        <div className="bg-emerald-50/60 p-2 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-emerald-800 block">Top Buyer Bid</span>
          <span className="text-sm font-black font-mono text-emerald-700">₹{bestBid}</span>
          <span className="text-[10px] text-emerald-600 block">{totalBidQty} {unit} total</span>
        </div>
        <div className="bg-rose-50/60 p-2 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-rose-800 block">Lowest Seller Ask</span>
          <span className="text-sm font-black font-mono text-rose-700">₹{bestAsk}</span>
          <span className="text-[10px] text-rose-600 block">{totalAskQty} {unit} total</span>
        </div>
        <div className="bg-[#FAF9F5] p-2 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Order Imbalance</span>
          <span className="text-[11px] font-bold font-mono text-slate-800 truncate">{imbalance}</span>
        </div>
      </div>

      {/* 5-Level Depth Ladder */}
      <div className="py-3 text-[11px] font-mono">
        <div className="grid grid-cols-2 gap-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-black/[0.04]">
          <div className="flex justify-between">
            <span>Bid Qty</span>
            <span className="text-emerald-700 font-bold">Buy Bid</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rose-700 font-bold">Sell Ask</span>
            <span>Ask Qty</span>
          </div>
        </div>

        <div className="space-y-1 pt-1.5">
          {bids.slice(0, 5).map((bid, i) => {
            const ask = asks[i] || { price: '-', qty: '-' };
            return (
              <div key={i} className="grid grid-cols-2 gap-4 py-0.5 hover:bg-slate-50 rounded px-1">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">{bid.qty} {unit}</span>
                  <span className="font-bold text-emerald-700">₹{bid.price}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-bold text-rose-700">₹{ask.price}</span>
                  <span className="text-slate-500">{ask.qty} {unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Disclaimer & Terminal Link */}
      <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400">Visible queue depth &bull; APMC electronic book</span>
        {onAction && (
          <button
            onClick={() => onAction('OPEN_TERMINAL', { tab: 'exchange', commodity })}
            className="text-[#C26747] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer">
            <span>Terminal View</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
