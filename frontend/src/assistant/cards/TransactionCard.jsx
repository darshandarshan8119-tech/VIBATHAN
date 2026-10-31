// src/assistant/cards/TransactionCard.jsx
import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, Clock, ArrowRight, ExternalLink, Scale } from 'lucide-react';
import { TRANSACTION_LIFECYCLE_STEPS } from '../../data/mockData';

export default function TransactionCard({ data, onAction }) {
  if (!data) return null;

  const {
    orderId = 'ORD-AGX-48291',
    contractNumber = 'AGX-2026-74741',
    escrowReference = 'ESC-AXIS-683553',
    commodity = 'Wheat (Sharbati Grade-A)',
    mandi = 'Ludhiana APMC, Punjab',
    quantity = 120,
    unit = 'Quintals',
    rate = 2450,
    buyer = 'ITC Agri Business Division',
    seller = 'Harpreet Singh (Khanna FPO)',
    status = 'Escrow Secured',
    currentStep = 3, // Step 1 to 6
    paymentStatus = 'Funds Quarantined in Escrow',
    deliveryStatus = 'e-NWR Receipt Issued',
    settlementStatus = 'Awaiting Gate Weighment Reconciliation',
    totalEscrow = 296900,
  } = data;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="pb-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{status}</span>
          </span>
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {orderId}
          </span>
        </div>

        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#121212]">
          Trade Contract: {commodity}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
          <span>{mandi}</span>
          <span className="font-mono text-[11px] text-[#C26747] font-semibold">{escrowReference}</span>
        </div>
      </div>

      {/* Trade Parties & Value */}
      <div className="grid grid-cols-2 gap-3 py-3 border-b border-black/[0.06] text-xs">
        <div className="p-2.5 bg-[#FAF9F5] rounded-xl space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Buyer</span>
          <span className="font-bold text-slate-900 truncate block">{buyer}</span>
          <span className="text-[10px] text-slate-400 font-mono">Seller: {seller}</span>
        </div>

        <div className="p-2.5 bg-[#FAF9F5] rounded-xl space-y-0.5 text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Escrow Value</span>
          <span className="text-base font-black font-mono text-slate-900 block">
            ₹{Number(totalEscrow).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {quantity} {unit} @ ₹{rate}/Qtl
          </span>
        </div>
      </div>

      {/* 6-Step Visual Lifecycle Tracker */}
      <div className="py-3 border-b border-black/[0.06]">
        <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-2">
          Transaction Lifecycle State:
        </span>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          {TRANSACTION_LIFECYCLE_STEPS.map((step) => {
            const isCompleted = step.id <= currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  isCurrent 
                    ? 'bg-[#C26747] text-white ring-4 ring-[#C26747]/20 scale-110' 
                    : isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : step.id}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-2">
          <span>Order Placed</span>
          <span>Escrow Secured</span>
          <span>Weighment</span>
          <span>RTGS Released</span>
        </div>
      </div>

      {/* Status Details */}
      <div className="pt-3 text-xs space-y-1 font-sans">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Payment:</span>
          <span className="font-medium text-emerald-700">{paymentStatus}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Delivery:</span>
          <span className="font-medium text-slate-800">{deliveryStatus}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500">Settlement:</span>
          <span className="font-medium text-slate-800">{settlementStatus}</span>
        </div>
      </div>

      {/* Terminal View Link */}
      {onAction && (
        <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex items-center justify-end">
          <button
            onClick={() => onAction('VIEW_CONTRACT_NOTE', data)}
            className="text-[#C26747] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            <span>Open Contract Note in Terminal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
