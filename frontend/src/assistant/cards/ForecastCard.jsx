// src/assistant/cards/ForecastCard.jsx
import React from 'react';
import { TrendingUp, AlertCircle, Clock, ShieldCheck, Sparkles, BarChart2 } from 'lucide-react';
import MerchantTrendGraph from './MerchantTrendGraph';

export default function ForecastCard({ data, onAction }) {
  if (!data) return null;

  const {
    commodity = 'Wheat (Sharbati)',
    mandi = 'Ludhiana APMC, Punjab',
    horizon = '7-Day Ahead',
    currentPrice = 2450,
    predictedPrice = 2510,
    lowerRange = 2460,
    upperRange = 2560,
    modelName = 'Time-Series ARIMA(1,1,1) Baseline',
    evaluationMetric = 'MAPE: 2.14% on 90-day test window',
    dataFreshness = 'Updated with today\'s APMC settlement',
    direction = 'Bullish (+2.45%)',
    priceDifferencePerQuintal = null,
    quantity = null,
    estimatedDifferenceForQuantity = null,
    recommendation = '',
    merchantAnalysis = false,
    historicalPoints = [],
    points = [
      { day: 'Day 1', price: 2460 },
      { day: 'Day 2', price: 2475 },
      { day: 'Day 3', price: 2480 },
      { day: 'Day 4', price: 2495 },
      { day: 'Day 5', price: 2505 },
      { day: 'Day 6', price: 2510 },
      { day: 'Day 7', price: 2510 },
    ],
  } = data;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Statistical Price Forecast</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{horizon}</span>
          </div>
          <h3 className="font-heading font-extrabold text-base text-[#121212]">
            {commodity} &bull; <span className="text-slate-500 font-normal">{mandi}</span>
          </h3>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Current Modal</span>
          <span className="text-base font-extrabold font-mono text-slate-900">₹{currentPrice}/Qtl</span>
        </div>
      </div>

      {/* Forecast Band Banner */}
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 to-emerald-50/70 border border-purple-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono text-purple-900 font-bold block">
            Expected Target ({horizon})
          </span>
          <div className="text-2xl font-black font-mono text-purple-950 mt-0.5">
            ₹{predictedPrice}
            <span className="text-xs font-normal text-purple-700"> /Qtl</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 block mt-0.5">
            {direction}
          </span>
        </div>

        <div className="text-right bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-purple-200/50">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Estimated Range</span>
          <span className="text-xs font-black font-mono text-slate-800">
            ₹{lowerRange} &mdash; ₹{upperRange}
          </span>
          <span className="text-[9px] text-slate-400 font-mono block">95% Confidence Interval</span>
        </div>
      </div>

      {/* Mini Trend Sparkline / Progression */}
      <div className="py-2">
        <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1.5">
          Projected 7-Day Path:
        </span>
        <div className="grid grid-cols-7 gap-1 text-center font-mono">
          {points.map((p, idx) => (
            <div key={idx} className="bg-[#FAF9F5] p-1.5 rounded-lg border border-black/[0.04]">
              <span className="text-[9px] text-slate-400 block">{p.day}</span>
              <span className="text-[10px] font-bold text-slate-800">₹{p.price}</span>
            </div>
          ))}
        </div>
      </div>

      {(priceDifferencePerQuintal !== null || recommendation) && (
        <div className="mt-3 rounded-xl bg-[#FAF9F5] border border-black/[0.06] px-3 py-2.5 text-xs leading-relaxed text-slate-700">
          {priceDifferencePerQuintal !== null && <p>Expected price difference: {priceDifferencePerQuintal} per quintal{quantity ? ` for ${quantity} quintals` : ''}{estimatedDifferenceForQuantity !== null ? `; estimated total difference before other costs: ${estimatedDifferenceForQuantity}.` : '.'}</p>}
          {recommendation && <p className="mt-1"><strong className="text-slate-900">Decision guide:</strong> {recommendation}</p>}
        </div>
      )}

      {merchantAnalysis && historicalPoints.length > 1 && points.length > 0 && (
        <div className="mt-4 pt-3 border-t border-black/[0.06]">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400 mb-1">
            <span>Merchant price trend</span>
            <span>Solid: history / Dashed: estimate</span>
          </div>
          <MerchantTrendGraph historicalPoints={historicalPoints} forecastPoints={points} />
        </div>
      )}

      {/* Model Specs & Non-Negotiable Disclaimer */}
      <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine: <strong className="text-slate-700">{modelName}</strong></span>
          <span className="font-mono text-slate-400">{evaluationMetric}</span>
        </div>
        <div className="flex items-start gap-1.5 text-[10px] text-slate-400 pt-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>Statistically modeled estimate from historical Agmarknet time-series. Not a guaranteed future contract price.</span>
        </div>
      </div>
    </div>
  );
}
