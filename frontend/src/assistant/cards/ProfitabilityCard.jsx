// src/assistant/cards/ProfitabilityCard.jsx
import React from 'react';
import { DollarSign, ShieldCheck, ArrowRight, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfitabilityCard({ data, onAction }) {
  if (!data) return null;

  const {
    commodity = 'Wheat (Sharbati)',
    mandi = 'Ludhiana APMC, Punjab',
    quantity = 100,
    unit = 'Quintals',
    sellingPrice = 2450,
    grossValue = 245000,
    expenses = {
      transportation: 3200,
      mandiCess: 3675, // 1.5% APMC cess
      escrowFee: 1225, // 0.5% escrow guarantee
      qualityDeductions: 0,
      unloadingCharges: 400,
    },
    totalExpenses = 8500,
    estimatedNetProceeds = 236500,
    productionCost = null, // If provided by farmer
    estimatedProfit = null,
  } = data;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="pb-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            Deterministic Net Proceeds
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-bold">
            {quantity} {unit} @ ₹{sellingPrice}/Qtl
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#121212]">
          Liquidation Realization: {commodity}
        </h3>
        <span className="text-xs text-slate-500">{mandi}</span>
      </div>

      {/* Gross Value vs Net Proceeds Hero */}
      <div className="grid grid-cols-2 gap-3 py-4 border-b border-black/[0.06]">
        <div className="p-3 bg-[#FAF9F5] rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Gross Value</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-800">
            ₹{Number(grossValue).toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-emerald-700 block">Estimated Net Proceeds</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-800">
            ₹{Number(estimatedNetProceeds).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Itemized Expenses Breakdown */}
      <div className="py-3 text-xs space-y-1.5 font-sans">
        <div className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider mb-1">
          Verified Deductions Breakdown
        </div>

        <div className="flex justify-between py-1 border-b border-black/[0.04]">
          <span className="text-slate-600">Freight &amp; Transportation</span>
          <span className="font-mono font-medium text-slate-800">-₹{Number(expenses.transportation || 0).toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-black/[0.04]">
          <span className="text-slate-600">APMC Mandi Cess (1.5%)</span>
          <span className="font-mono font-medium text-slate-800">-₹{Number(expenses.mandiCess || 0).toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-black/[0.04]">
          <span className="text-slate-600">Escrow Guarantee Fee (0.5%)</span>
          <span className="font-mono font-medium text-slate-800">-₹{Number(expenses.escrowFee || 0).toLocaleString()}</span>
        </div>

        {expenses.qualityDeductions > 0 && (
          <div className="flex justify-between py-1 border-b border-black/[0.04]">
            <span className="text-slate-600">Moisture Assay Deduction</span>
            <span className="font-mono font-medium text-rose-600">-₹{Number(expenses.qualityDeductions).toLocaleString()}</span>
          </div>
        )}

        {expenses.unloadingCharges > 0 && (
          <div className="flex justify-between py-1 border-b border-black/[0.04]">
            <span className="text-slate-600">APMC Weighment &amp; Unloading</span>
            <span className="font-mono font-medium text-slate-800">-₹{Number(expenses.unloadingCharges).toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between pt-1 font-bold text-slate-900">
          <span>Total Expenses</span>
          <span className="font-mono text-rose-600">-₹{Number(totalExpenses).toLocaleString()}</span>
        </div>
      </div>

      {/* Optional Production Cost & True Profit */}
      {productionCost ? (
        <div className="mt-2 p-2.5 bg-blue-50/60 rounded-xl text-xs flex justify-between items-center">
          <div>
            <span className="font-bold text-blue-900 block">Cultivation Profit</span>
            <span className="text-[11px] text-blue-700">Cost: ₹{Number(productionCost).toLocaleString()}</span>
          </div>
          <span className="font-mono font-black text-sm text-blue-900">
            ₹{Number(estimatedProfit).toLocaleString()}
          </span>
        </div>
      ) : (
        <div className="mt-2 p-2.5 bg-[#FAF9F5] rounded-xl text-[11px] text-slate-500 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>Net proceeds represent trade cash realization. Actual farm profit depends on your cultivation input costs.</span>
        </div>
      )}

      {/* Action Footer */}
      {onAction && (
        <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-end">
          <button
            onClick={() => onAction('PROCEED_TO_BOOKING', { commodity, mandi, quantity, netProceeds: estimatedNetProceeds })}
            className="px-4 py-2 rounded-full bg-[#121212] hover:bg-[#C26747] text-white text-xs font-bold font-heading transition-all flex items-center gap-1.5 cursor-pointer">
            <span>Book Delivery Slot for this Mandi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
