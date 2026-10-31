// src/pages/TransactionsPage.jsx
import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, Clock, Filter, ArrowRight,
  ExternalLink, Printer, Sparkles, Scale, Search, Download
} from 'lucide-react';
import { SAMPLE_CONTRACT_TRANSACTIONS, TRANSACTION_LIFECYCLE_STEPS } from '../data/mockData';

export default function TransactionsPage({ onReturnToAssistant }) {
  const [transactions, setTransactions] = useState(SAMPLE_CONTRACT_TRANSACTIONS);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalContract, setActiveModalContract] = useState(null);

  const filtered = transactions.filter(t => {
    const matchesSearch = t.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.buyer.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && t.status.toLowerCase().includes(filterStatus.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9]">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#10B981]" />
          <span>VERIFIED ELECTRONIC CONTRACT NOTES &bull; AXIS ESCROW CLEARING LEDGER</span>
        </div>

        <button
          onClick={onReturnToAssistant}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all cursor-pointer">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Back to AI Copilot</span>
        </button>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8 space-y-6 flex-1">
        
        {/* Page Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase mb-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>T+0 Electronic Escrow Settlement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#121212] tracking-tight">
              Contract Notes &amp; Settlement History
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Live status of trade matched lots, axis escrow deposits, electronic warehouse receipts (e-NWR) and payment releases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contract, buyer..."
                className="bg-white border border-black/[0.1] rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#121212] w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table / Cards */}
        <div className="space-y-4">
          {filtered.map((t) => (
            <div 
              key={t.contractNumber}
              className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs hover:shadow-md transition-all space-y-4">
              
              {/* Row 1: Contract Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-mono font-bold text-xs">
                    {t.commodity.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-extrabold text-base text-slate-900">
                        {t.cropFullName || t.commodity}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-black/[0.06] text-[10px] font-mono text-slate-600 font-bold">
                        {t.contractNumber}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{t.mandi} &bull; Lot: {t.lotRef}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                    {t.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    ₹{Number(t.financials?.totalEscrow || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Row 2: 6-Step Visual Lifecycle */}
              <div className="py-2">
                <div className="flex items-center justify-between relative max-w-2xl">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                  {TRANSACTION_LIFECYCLE_STEPS.map((step) => {
                    const isCompleted = step.id <= t.currentStep;
                    const isCurrent = step.id === t.currentStep;
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
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
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 max-w-2xl">
                  <span>Created</span>
                  <span>Escrow</span>
                  <span>Delivery</span>
                  <span>Weighment</span>
                  <span>Settlement</span>
                  <span>RTGS</span>
                </div>
              </div>

              {/* Row 3: Trade Details & Action Buttons */}
              <div className="pt-3 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600 text-[11px] font-mono">
                  <span>Buyer: <strong className="text-slate-900">{t.buyer}</strong></span>
                  <span>&bull;</span>
                  <span>Quantity: <strong>{t.quantity} {t.unit}</strong></span>
                  <span>&bull;</span>
                  <span>Rate: <strong>₹{t.rate}/Qtl</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalContract(t)}
                    className="px-3 py-1.5 rounded-full bg-[#121212] hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all flex items-center gap-1 cursor-pointer">
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Electronic Note</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Contract Detail Modal */}
      {activeModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-black/[0.1] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Electronic Contract Note</span>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">{activeModalContract.contractNumber}</h3>
              </div>
              <button 
                onClick={() => setActiveModalContract(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-slate-900">{activeModalContract.orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">Escrow Reference:</span>
                <span className="font-bold text-[#C26747]">{activeModalContract.escrowReference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">Commodity &amp; Grade:</span>
                <span className="font-bold text-slate-900">{activeModalContract.cropFullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">Trade Volume:</span>
                <span className="font-bold text-slate-900">{activeModalContract.quantity} {activeModalContract.unit} @ ₹{activeModalContract.rate}/Qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">Produce Subtotal:</span>
                <span className="font-bold text-slate-900">₹{Number(activeModalContract.financials?.produceSubtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">APMC Mandi Cess (1.5%):</span>
                <span className="font-bold text-slate-900">₹{Number(activeModalContract.financials?.mandiCess || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-slate-500">Escrow Fee (0.5%):</span>
                <span className="font-bold text-slate-900">₹{Number(activeModalContract.financials?.escrowFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold border-t border-black/[0.08]">
                <span>Total Escrow Secured:</span>
                <span className="text-emerald-700">₹{Number(activeModalContract.financials?.totalEscrow || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-sans leading-relaxed">
              {activeModalContract.disclaimer}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-full bg-[#121212] hover:bg-[#C26747] text-white text-xs font-bold font-heading transition-all flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
