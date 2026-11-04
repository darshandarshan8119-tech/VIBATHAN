// src/pages/TransactionsPage.jsx
import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, Clock, Filter, ArrowRight,
  ExternalLink, Printer, Scale, Search, Download, BarChart2
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
          <BarChart2 className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Return to Market Terminal</span>
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
            <p className="text-xs text-[#787774] mt-1 font-sans">
              Statutory Form-J procurement vouchers digitally signed under Mandi Bylaws &bull; Instant RTGS release upon Weighbridge certification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8E8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search contract, crop, buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-[#121212] placeholder-[#8E8E8E] focus:outline-none focus:border-[#121212] w-56 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'SETTLED', 'ESCROW_FUNDED', 'DISPATCHED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#121212] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F2F0EB] text-[#5A5A5A] border border-black/[0.06]'
              }`}>
              {st === 'ALL' ? 'All Contracts' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Contract Table */}
        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FBFBF9] border-b border-black/[0.06] text-[#6E6E6E] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Contract Ref</th>
                  <th className="px-5 py-3.5">Commodity &amp; Grade</th>
                  <th className="px-5 py-3.5">Buyer / Processor</th>
                  <th className="px-5 py-3.5">Volume</th>
                  <th className="px-5 py-3.5">Gross Settlement</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBFBF9]/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#121212]">
                      {item.contractNumber}
                      <span className="block text-[10px] font-normal text-[#8E8E8E]">{item.date}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-heading font-extrabold text-[#121212] text-sm block">
                        {item.commodity}
                      </span>
                      <span className="text-[10px] text-[#8E8E8E] font-mono">{item.mandi}</span>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#404040]">
                      {item.buyer}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-[#121212]">
                      {item.quantity} Qtl
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-[#166534] text-sm">
                      ₹{item.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.status === 'SETTLED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{item.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setActiveModalContract(item)}
                        className="px-3 py-1.5 rounded-full bg-[#F5F4F0] hover:bg-[#121212] hover:text-white text-xs font-mono font-bold transition-all border border-black/[0.06] cursor-pointer">
                        View Note
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Contract Detail Modal */}
      {activeModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-black/[0.08] shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C26747] font-bold uppercase tracking-wider block">
                  APMC Statutory Contract Note
                </span>
                <h3 className="font-heading font-extrabold text-lg text-[#121212]">
                  {activeModalContract.contractNumber}
                </h3>
              </div>
              <button 
                onClick={() => setActiveModalContract(null)}
                className="text-[#8E8E8E] hover:text-[#121212] p-1.5 rounded-full hover:bg-black/5 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#787774]">Commodity:</span>
                <span className="font-bold text-[#121212]">{activeModalContract.commodity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#787774]">Procuring Buyer:</span>
                <span className="font-bold text-[#121212]">{activeModalContract.buyer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#787774]">Mandi Weighbridge:</span>
                <span className="font-bold text-[#121212]">{activeModalContract.mandi}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#787774]">Certified Volume:</span>
                <span className="font-bold text-[#121212]">{activeModalContract.quantity} Qtl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#787774]">Rate per Quintal:</span>
                <span className="font-bold text-[#166534]">₹{activeModalContract.ratePerQtl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#787774]">Total Escrow Payout:</span>
                <span className="font-extrabold text-base text-[#166534]">₹{activeModalContract.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F7F4] border border-black/[0.06] text-[11px] font-mono text-[#5A5A5A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>SHA-256 Escrow Stamp: 0x8f2a...91b4 &bull; RTGS Settled</span>
            </div>

            <button
              onClick={() => setActiveModalContract(null)}
              className="w-full py-3 rounded-full bg-[#121212] text-white font-heading font-extrabold text-xs hover:bg-[#C26747] transition-all cursor-pointer">
              Close Contract Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
