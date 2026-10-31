// src/assistant/cards/MandiComparisonCard.jsx
import React from 'react';
import { Scale, Truck, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MandiComparisonCard({ data, onAction }) {
  if (!data || !data.mandis) return null;

  const {
    commodity = 'Wheat (Sharbati)',
    quantity = 100,
    unit = 'Quintals',
    mandis = [],
    tradeIntent = 'sell',
    isMockData = false,
    dataNotice = '',
    recommendationReason = 'Ranked by highest net realized proceeds after freight & mandi cess.',
  } = data;
  const isBuying = tradeIntent === 'buy';

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-xl">
      {/* Header */}
      <div className="pb-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <Scale className="w-3 h-3" />
            <span>Mandi Comparison Radar</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-bold">
            Lot: {quantity} {unit}
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#121212]">
          {isBuying ? 'Purchase Price Comparison' : 'Comparative Realization'}: {commodity}
        </h3>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          {recommendationReason}
        </p>
        {isMockData && (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900">
            Demo data only: {dataNotice}
          </p>
        )}
      </div>

      {/* Mandis Comparison Table / Cards */}
      <div className="space-y-3 py-4">
        {mandis.map((m, idx) => {
          const isTopRank = idx === 0;
          return (
            <div 
              key={m.mandiName || idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                isTopRank 
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300' 
                  : 'bg-[#FAF9F5] border-black/[0.06] hover:border-black/15'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {isTopRank && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Award className="w-2.5 h-2.5" />
                        <span>{isBuying ? 'Lowest Quoted Price' : 'Best Net Proceeds'}</span>
                      </span>
                    )}
                    <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                      {m.mandiName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-0.5">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>{isBuying && m.distanceKm == null ? 'Local distance unavailable' : `${m.distanceKm} km transit`}</span>
                    </span>
                    <span>&bull;</span>
                    {isBuying ? <span>Current market quote</span> : <span>Buyer Demand: <strong className="text-slate-700">{m.buyerDemandQty} Qtl</strong></span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400 font-mono">Quoted Rate</div>
                  <div className="text-sm font-extrabold font-mono text-slate-900">
                    ₹{Number(m.quotedRate).toLocaleString()}/Qtl
                  </div>
                </div>
              </div>

              {/* Purchase cost or selling proceeds */}
              <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500 font-mono">
                  <span>{isBuying ? 'Transport: confirm locally' : <>Freight: ₹{m.estimatedFreight}</>}</span>
                  <span className="mx-1">&bull;</span>
                  <span>{isBuying ? 'Quality charges: confirm locally' : <>Cess: ₹{m.mandiCess}</>}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 mr-1.5">{isBuying ? 'Crop cost:' : 'Est. Net:'}</span>
                  <span className="font-mono font-black text-sm text-emerald-700">
                    ₹{Number(isBuying ? m.estimatedPurchaseCost : m.estimatedNetProceeds).toLocaleString()}
                  </span>
                </div>
              </div>

              {isTopRank && onAction && (
                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onAction('VIEW_CONTRACT_NOTE')}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-800 underline cursor-pointer">
                    Transactions &amp; Escrow &rarr;
                  </button>

                  <button
                    type="button"
                    onClick={() => onAction('SELECT_MANDI', { ...m, commodity, quantity, tradeIntent })}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold font-heading transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    <span>{isBuying ? '⚡ Instant Buy & Book Slot' : '⚡ Select & Book Delivery Slot'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note on Visible Demand */}
      <div className="text-[11px] text-slate-400 font-sans border-t border-black/[0.06] pt-2 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#C26747] shrink-0" />
        <span>{isBuying ? 'Purchase ranking uses the available crop quotes. Confirm local transport, quality, and charges before buying.' : 'Transportation and cess estimates are calculated deterministically from the available transit data.'}</span>
      </div>
    </div>
  );
}
