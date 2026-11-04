// src/pages/ProfilePage.jsx
import React from 'react';
import { User, ShieldCheck, MapPin, Building2, Tractor, LogOut, BarChart2 } from 'lucide-react';

export default function ProfilePage({ user, onLogout, onReturnToAssistant }) {
  const isFarmer = user?.role === 'farmer' || !user?.role;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF9]">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[#C26747]" />
          <span>AUTHORIZED APMC MEMBER IDENTITY &bull; ACCREDITED KISAN PRODUCER PROFILE</span>
        </div>

        <button
          onClick={onReturnToAssistant}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#C26747] text-white text-[11px] font-bold font-heading transition-all cursor-pointer">
          <BarChart2 className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>Return to Market Terminal</span>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-heading font-bold transition-all border border-rose-200 cursor-pointer self-start sm:self-auto">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Operational Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
            <span className="text-[10px] font-mono uppercase text-[#787774] font-bold block mb-1">Total Harvest Marketed</span>
            <span className="text-2xl font-extrabold font-mono text-[#121212]">840 Qtl</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Across 3 APMC Mandis</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
            <span className="text-[10px] font-mono uppercase text-[#787774] font-bold block mb-1">Escrow Settled</span>
            <span className="text-2xl font-extrabold font-mono text-[#166534]">₹21.4 Lakh</span>
            <span className="text-[10px] text-[#787774] font-medium block mt-1">100% Direct RTGS Bank Credit</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
            <span className="text-[10px] font-mono uppercase text-[#787774] font-bold block mb-1">Registered Acreage</span>
            <span className="text-2xl font-extrabold font-mono text-[#121212]">15.0 Acres</span>
            <span className="text-[10px] text-[#787774] font-medium block mt-1">Alluvial Soil Basin</span>
          </div>
        </div>

        {/* Mandi Affiliations */}
        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
            <h3 className="font-heading font-extrabold text-sm text-[#121212] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C26747]" />
              <span>Accredited Mandi Gateways</span>
            </h3>
            <span className="text-[10px] font-mono text-[#787774]">e-NAM Integrated</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#F8F7F4] flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-[#121212] block">Ludhiana Grain Market APMC</span>
                <span className="text-[10px] text-[#787774] font-mono">Punjab &bull; License #PB-LDH-2024-9182</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                Primary Mandi
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F7F4] flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-[#121212] block">Khanna APMC Mandi</span>
                <span className="text-[10px] text-[#787774] font-mono">Asia's Largest Grain Market &bull; License #PB-KHN-2025-4411</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-[#5A5A5A] text-[10px] font-mono font-semibold">
                Secondary Mandi
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
