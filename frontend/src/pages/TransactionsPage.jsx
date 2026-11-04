// src/pages/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, Clock, Filter, ArrowRight,
  ExternalLink, Printer, Sparkles, Scale, Search, Download,
  ShoppingCart, ArrowUpRight, Truck, RefreshCw, AlertCircle, BarChart2
} from 'lucide-react';
import { SAMPLE_CONTRACT_TRANSACTIONS, TRANSACTION_LIFECYCLE_STEPS } from '../data/mockData';
import { apiGetTransactions, apiGetMyBookings } from '../services/api';

export default function TransactionsPage({ onReturnToAssistant }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL' | 'SLOT'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalContract, setActiveModalContract] = useState(null);

  // Load backend transactions & slot bookings
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [txnRes, bookingRes] = await Promise.allSettled([
          apiGetTransactions(),
          apiGetMyBookings(),
        ]);

        const loadedTxns = [];

        // 1. Backend Market Transactions
        if (txnRes.status === 'fulfilled' && Array.isArray(txnRes.value) && txnRes.value.length > 0) {
          txnRes.value.forEach(t => {
            const isBuy = t.buyer_name?.toLowerCase().includes('devinder') || 
                          t.buyer_name?.toLowerCase().includes('kisan') || 
                          t.buyer_name?.toLowerCase().includes('ramesh') ||
                          t.buyer_name?.toLowerCase().includes('buyer');

            let currentStep = 1;
            let statusLabel = 'Contract Note Issued';
            if (t.status === 'escrow_funded') { currentStep = 2; statusLabel = 'Escrow Funded (100%)'; }
            else if (t.status === 'goods_dispatched') { currentStep = 3; statusLabel = 'Goods Dispatched'; }
            else if (t.status === 'assay_passed') { currentStep = 4; statusLabel = 'APMC Assay Passed'; }
            else if (t.status === 'buyer_accepted') { currentStep = 5; statusLabel = 'Inward Accepted'; }
            else if (t.status === 'funds_released') { currentStep = 6; statusLabel = 'Funds Settled to Bank'; }

            loadedTxns.push({
              id: t.id,
              orderId: t.transaction_id,
              contractNumber: t.contract_note_number,
              escrowReference: `ESC-AXIS-${t.escrow_deposit_hash?.slice(0, 8).toUpperCase() || '683553'}`,
              commodity: t.commodity_name || 'Wheat',
              cropFullName: t.commodity_name,
              mandi: t.apmc_name || 'Karnal APMC, Haryana',
              quantity: Number(t.quantity_quintals),
              unit: 'Quintals',
              rate: Number(t.agreed_rate),
              buyer: t.buyer_name || 'Institutional Merchant',
              seller: t.seller_name || 'Registered Producer',
              tradeType: isBuy ? 'BUY' : 'SELL',
              status: statusLabel,
              currentStep: currentStep,
              totalAmount: Number(t.gross_amount),
              financials: {
                totalEscrow: Number(t.gross_amount),
                mandiCess: Number(t.mandi_cess),
                escrowFee: Number(t.escrow_fee),
                freightCost: Number(t.freight_deduction),
                netProceeds: Number(t.net_seller_payable),
              },
              createdAt: new Date(t.created_at).toLocaleDateString(),
            });
          });
        }

        // 2. Backend Slot Bookings
        if (bookingRes.status === 'fulfilled' && Array.isArray(bookingRes.value) && bookingRes.value.length > 0) {
          bookingRes.value.forEach(b => {
            loadedTxns.push({
              id: b.id,
              orderId: b.booking_reference,
              contractNumber: b.booking_reference,
              escrowReference: `GATE-TOKEN-${b.qr_code_token?.slice(0, 6).toUpperCase() || '7412'}`,
              commodity: b.commodity_name || 'Paddy',
              cropFullName: b.commodity_name,
              mandi: b.slot_detail ? `APMC Gate Delivery` : 'APMC North Inward Gate',
              quantity: Number(b.estimated_quantity_quintals),
              unit: 'Quintals',
              rate: 0,
              buyer: 'APMC Weighbridge Authority',
              seller: b.vehicle_number || 'Truck Assigned',
              tradeType: 'SLOT',
              status: b.status === 'confirmed' ? 'Weighbridge Priority Token Issued' : 'Arrival Slot Reserved',
              currentStep: 3,
              totalAmount: 0,
              financials: {
                totalEscrow: 0,
                mandiCess: 0,
                escrowFee: 0,
                freightCost: 0,
                netProceeds: 0,
              },
              createdAt: new Date(b.created_at).toLocaleDateString(),
            });
          });
        }

        // Merge with sample contracts if empty or for comprehensive demo
        const finalTxns = loadedTxns.length > 0 ? [...loadedTxns, ...SAMPLE_CONTRACT_TRANSACTIONS] : SAMPLE_CONTRACT_TRANSACTIONS;
        setTransactions(finalTxns);
      } catch (err) {
        setTransactions(SAMPLE_CONTRACT_TRANSACTIONS);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.commodity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buyer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mandi?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'BUY') return matchesSearch && t.tradeType === 'BUY';
    if (filterType === 'SELL') return matchesSearch && t.tradeType === 'SELL';
    if (filterType === 'SLOT') return matchesSearch && t.tradeType === 'SLOT';
    return matchesSearch;
  });

  const countBuy = transactions.filter(t => t.tradeType === 'BUY').length;
  const countSell = transactions.filter(t => t.tradeType === 'SELL' || !t.tradeType).length;
  const countSlot = transactions.filter(t => t.tradeType === 'SLOT').length;

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
              <span>T+0 Electronic Escrow Settlement &bull; Real-time Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#121212] tracking-tight">
              Transactions &amp; Escrow Ledger
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Live status of trade matched lots, buying orders, APMC delivery slots, and electronic escrow payments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8E8E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search contract, crop, mandi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-[#121212] placeholder-[#8E8E8E] focus:outline-none focus:border-[#121212] w-56 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Tab Filter Switcher */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-[#121212] text-white shadow-xs'
                : 'bg-white border border-black/[0.08] text-slate-600 hover:bg-slate-50'
            }`}>
            All Transactions ({transactions.length})
          </button>

          <button
            onClick={() => setFilterType('BUY')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
              filterType === 'BUY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-black/[0.08] text-blue-700 hover:bg-blue-50'
            }`}>
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Buying Orders ({countBuy})</span>
          </button>

          <button
            onClick={() => setFilterType('SELL')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
              filterType === 'SELL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-black/[0.08] text-emerald-700 hover:bg-emerald-50'
            }`}>
            <Scale className="w-3.5 h-3.5" />
            <span>Selling Contracts ({countSell})</span>
          </button>

          <button
            onClick={() => setFilterType('SLOT')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
              filterType === 'SLOT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-black/[0.08] text-amber-700 hover:bg-amber-50'
            }`}>
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Slots ({countSlot})</span>
          </button>
        </div>

        {/* Transactions Table / Cards */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.08] space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-heading font-bold text-slate-700">No transactions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't booked any transactions under this filter yet. You can use the Market Terminal or AI Copilot to compare mandis and execute trades.
            </p>
            <button
              onClick={onReturnToAssistant}
              className="px-5 py-2 rounded-full bg-[#121212] text-white text-xs font-heading font-bold cursor-pointer hover:bg-[#C26747] transition-all">
              Return to Market Terminal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((t) => {
              const isBuy = t.tradeType === 'BUY';
              const isSlot = t.tradeType === 'SLOT';

              return (
                <div 
                  key={t.contractNumber || t.id}
                  className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs hover:shadow-md transition-all space-y-4">
                  
                  {/* Row 1: Contract Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isBuy ? 'bg-blue-50 text-blue-700' : isSlot ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isBuy ? <ShoppingCart className="w-5 h-5" /> : isSlot ? <Truck className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-extrabold text-base text-slate-900">
                            {t.cropFullName || t.commodity}
                          </h3>

                          {/* Trade Type Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isBuy 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : isSlot
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isBuy ? '🛒 BUYING ORDER' : isSlot ? '🚛 GATE DELIVERY' : '🌾 SELLING LOT'}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-black/[0.06] text-[10px] font-mono text-slate-600 font-bold hidden sm:inline">
                            {t.contractNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{t.mandi} &bull; Ref: {t.orderId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                        isBuy
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : isSlot
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {t.status}
                      </span>

                      {t.totalAmount > 0 && (
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ₹{Number(t.totalAmount || t.financials?.totalEscrow || 0).toLocaleString()}
                        </span>
                      )}
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
                      <span>Counterparty: <strong className="text-slate-900">{isBuy ? t.seller : t.buyer}</strong></span>
                      <span>&bull;</span>
                      <span>Quantity: <strong>{t.quantity} {t.unit}</strong></span>
                      {t.rate > 0 && (
                        <>
                          <span>&bull;</span>
                          <span>Agreed Rate: <strong>₹{t.rate}/Qtl</strong></span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveModalContract(t)}
                        className="px-3.5 py-1.5 rounded-full bg-[#121212] hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all flex items-center gap-1.5 cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Contract Note &amp; Escrow</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Contract Detail Modal */}
      {activeModalContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-black/[0.08] shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#C26747] font-bold block">
                  {activeModalContract.tradeType === 'BUY' ? 'Electronic Purchase Contract Note' : 'Electronic Sale Contract Note'}
                </span>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">{activeModalContract.contractNumber}</h3>
              </div>
              <button 
                onClick={() => setActiveModalContract(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">
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
                <span className="text-slate-500">Total Escrow Value:</span>
                <span className="font-bold text-emerald-700">₹{Number(activeModalContract.totalAmount || activeModalContract.financials?.totalEscrow || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Statutory Tax & Deduction Breakdown */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-black/[0.06] text-[11px] font-mono space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Statutory APMC Cess (1.5%):</span>
                <span>₹{Number(activeModalContract.financials?.mandiCess || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Axis Escrow Settlement Fee (0.5%):</span>
                <span>₹{Number(activeModalContract.financials?.escrowFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Certified Transport Freight:</span>
                <span>₹{Number(activeModalContract.financials?.freightCost || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-black/[0.06] font-bold text-slate-900">
                <span>Net In-Hand Payable:</span>
                <span className="text-emerald-700">₹{Number(activeModalContract.financials?.netProceeds || activeModalContract.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F7F4] border border-black/[0.06] text-[11px] font-mono text-[#5A5A5A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>SHA-256 Escrow Stamp: 0x8f2a...91b4 &bull; RTGS Settled</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  alert(`Electronic Contract Note ${activeModalContract.contractNumber} downloaded.`);
                }}
                className="px-4 py-2 rounded-full border border-black/[0.1] text-xs font-heading font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Slip</span>
              </button>
              <button 
                onClick={() => setActiveModalContract(null)}
                className="px-5 py-2 rounded-full bg-[#121212] text-white text-xs font-heading font-bold hover:bg-[#C26747] transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
