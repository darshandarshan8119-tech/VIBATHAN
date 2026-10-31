// src/pages/ProfilePage.jsx
import React from 'react';
import { User, ShieldCheck, MapPin, Building2, Tractor, LogOut, Sparkles } from 'lucide-react';

export default function ProfilePage({ user, onLogout, onReturnToAssistant }) {
  const isFarmer = user?.role === 'farmer' || !user?.role;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9]">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[#C26747]" />
          <span>AUTHORIZED APMC MEMBER IDENTITY &bull; ACCESS CONTROL</span>
        </div>

        <button
          onClick={onReturnToAssistant}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all cursor-pointer">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Back to AI Copilot</span>
        </button>
      </div>

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-10 space-y-8 flex-1">
        
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#121212] text-white flex items-center justify-center font-heading font-black text-2xl shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'K'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                  {user?.name || user?.full_name || 'Devinder Singh'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {user?.identifier || user?.phone || '+91 98765 43210'} &bull; <span className="capitalize">{user?.role || 'Farmer'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold font-heading transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Role Profile Specifications */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-4">
          <h3 className="font-heading font-extrabold text-base text-slate-900 border-b border-black/[0.06] pb-3">
            {isFarmer ? 'Kisan Agricultural Registration' : 'Institutional Merchant Credentials'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {isFarmer ? (
              <>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">Cultivation Acreage</span>
                  <span className="font-bold text-slate-900 text-sm">18.5 Acres (Silty Loam)</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">Irrigation Source</span>
                  <span className="font-bold text-slate-900 text-sm">Canal + Solar Borewell</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">Registered APMC Village</span>
                  <span className="font-bold text-slate-900 text-sm">Khanna, Ludhiana (141001)</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">Kisan Credit Card</span>
                  <span className="font-bold text-slate-900 text-sm">Ending in •••• 4091</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">Trading Company</span>
                  <span className="font-bold text-slate-900 text-sm">Rajkot Agri-Exports Pvt Ltd</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">APMC License</span>
                  <span className="font-bold text-slate-900 text-sm">GJ-RJK-2024-8841</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">Verified Credit Limit</span>
                  <span className="font-bold text-emerald-700 text-sm">₹15,00,000 (Axis Escrow)</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 block">GSTIN Certificate</span>
                  <span className="font-bold text-slate-900 text-sm">Ending in •••• 1Z5A</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
