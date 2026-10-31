// src/assistant/cards/BuyerCard.jsx
import React from 'react';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, Award, Lock } from 'lucide-react';

export default function BuyerCard({ data, onAction }) {
  if (!data || !data.buyers) return null;

  const {
    commodity = 'Wheat (Sharbati)',
    mandi = 'Ludhiana APMC, Punjab',
    quantity = 100,
    buyers = [
      {
        id: 'buyer-1',
        name: 'Rajkot Agri-Exports Pvt Ltd',
        apmcLicense: 'APMC-RJK-2024-8841',
        offeredRate: 2465,
        requestedQty: 300,
        remainingCapacity: 180,
        settlementMode: 'Axis Escrow T+0 RTGS',
        isVerified: true,
        trustScore: '98.5%',
      },
      {
        id: 'buyer-2',
        name: 'Malwa Grain Commercial Traders',
        apmcLicense: 'APMC-LDH-2023-4109',
        offeredRate: 2450,
        requestedQty: 150,
        remainingCapacity: 150,
        settlementMode: 'Axis Escrow T+0 RTGS',
        isVerified: true,
        trustScore: '96.0%',
      }
    ],
  } = data;

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="pb-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>Verified APMC Buyers Match</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-bold">
            Target Lot: {quantity} Qtl
          </span>
        </div>
        <h3 className="font-heading font-extrabold text-base text-[#121212]">
          Institutional Procurement: {commodity}
        </h3>
        <span className="text-xs text-slate-500">{mandi}</span>
      </div>

      {/* Buyer Cards List */}
      <div className="space-y-3 py-3">
        {buyers.map((b) => (
          <div 
            key={b.id || b.name}
            className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-black/[0.06] hover:border-black/15 transition-all space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {b.name}
                  </h4>
                  {b.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="APMC Verified License" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Lic: <span className="text-slate-700">{b.apmcLicense}</span> &bull; Trust: {b.trustScore}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-mono">Offered Rate</div>
                <div className="text-base font-black font-mono text-emerald-700">
                  ₹{Number(b.offeredRate).toLocaleString()}/Qtl
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04]">
              <div className="text-[11px] text-slate-500 font-mono">
                Req: <strong>{b.requestedQty} Qtl</strong> &bull; Open Cap: {b.remainingCapacity} Qtl
              </div>

              {onAction && (
                <button
                  onClick={() => onAction('SELL_TO_BUYER', { buyer: b, commodity, quantity })}
                  className="px-3 py-1 rounded-full bg-[#121212] hover:bg-emerald-700 text-white text-[11px] font-bold font-heading transition-all flex items-center gap-1 cursor-pointer">
                  <span>Direct Quote</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Disclaimer */}
      <div className="pt-2 border-t border-black/[0.06] flex items-center gap-1.5 text-[10px] text-slate-400">
        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
        <span>Buyer identities verified against state APMC registry. Funds pre-authorized in escrow.</span>
      </div>
    </div>
  );
}
