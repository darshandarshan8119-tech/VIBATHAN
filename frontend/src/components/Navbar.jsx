// src/components/Navbar.jsx
import React from 'react';
import { 
  Search, User, Scale, FileText, Gavel, LogOut, ArrowLeft,
  Activity, TrendingUp, Layers, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function Navbar({ 
  user,
  onOpenLogin,
  onLogout,
  onOpenSearch, 
  mandiTab,
  onSelectMandiTab,
  onExitToLanding
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-black/[0.06] transition-all">
      {/* Main Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-8">

          {/* Clean Brandmark & Return to Public Portal */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={onExitToLanding}
              className="flex flex-col text-left group focus:outline-none shrink-0 cursor-pointer">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] font-heading flex items-center gap-1.5">
                <span>Agri<span className="text-[#B45309]">mart</span></span>
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/20 tracking-normal">
                  Market Intelligence
                </span>
              </span>
              <span className="text-[10px] tracking-widest text-[#787774] uppercase font-mono -mt-0.5">
                National APMC Mandi &bull; Commodity Exchange
              </span>
            </button>
          </div>

          {/* Live APMC Mandi Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-4 py-2 bg-[#F6F5F2] hover:bg-[#EFECE5] text-[#787774] text-xs rounded-full border border-black/[0.05] hover:border-black/15 transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#888681] shrink-0" />
                <span className="truncate text-xs text-[#787774]">Search APMC mandis, commodities, varieties (Wheat, Mustard, Cotton)...</span>
              </div>
              <kbd className="text-[10px] font-mono text-[#888681] bg-white px-2 py-0.5 rounded border border-black/[0.06]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* User Account & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Search on mobile */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-[#6B6A66] hover:text-[#1A1A1A] rounded-full hover:bg-black/[0.04] transition-colors"
              aria-label="Search">
              <Search className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F4F0] border border-black/[0.06] text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[#1A1A1A] leading-none">
                      {user.name || user.full_name || 'Member'}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-[#787774] capitalize">
                      {user.role || 'Member'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-[#787774] hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs text-white bg-[#1A1A1A] hover:bg-[#333] rounded-full font-bold shadow-xs transition-colors"
                aria-label="User Account">
                <User className="w-3.5 h-3.5" />
                <span>Member Sign In</span>
              </button>
            )}
          </div>

        </div>

        {/* Clean Market Intelligence Sub-Navigation Bar */}
        <div className="flex items-center justify-between border-t border-black/[0.06] py-2.5 text-xs overflow-x-auto no-scrollbar gap-6">
          <div className="flex items-center gap-6 sm:gap-7 shrink-0 text-xs font-medium">
            <button
              onClick={() => onSelectMandiTab('exchange')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${
                mandiTab === 'exchange' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
              }`}>
              <Scale className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Live APMC Exchange</span>
              {mandiTab === 'exchange' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('arrivals')}
              className={`py-1 relative transition-colors cursor-pointer ${
                mandiTab === 'arrivals' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
              }`}>
              <span>Real-Time Arrivals</span>
              {mandiTab === 'arrivals' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('lots')}
              className={`py-1 relative transition-colors cursor-pointer ${
                mandiTab === 'lots' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
              }`}>
              <span>Wholesale Lots</span>
              {mandiTab === 'lots' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('bids')}
              className={`py-1 relative transition-colors cursor-pointer ${
                mandiTab === 'bids' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
              }`}>
              <span>Merchant Bids</span>
              {mandiTab === 'bids' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('contracts')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${
                mandiTab === 'contracts' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
              }`}>
              <FileText className="w-3.5 h-3.5 text-[#166534]" />
              <span>Contract Notes &amp; Escrow</span>
              {mandiTab === 'contracts' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#1A1A1A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectMandiTab('auction')}
              className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${
                mandiTab === 'auction' ? 'text-[#B45309] font-bold' : 'text-[#B45309]/80 hover:text-[#B45309]'
              }`}>
              <Gavel className="w-3.5 h-3.5" />
              <span>Kisan Auction Desk</span>
              {mandiTab === 'auction' && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#B45309] rounded-full" />
              )}
            </button>
          </div>

          {/* Subtle Right Note */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#888681] font-sans shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>National AGMARKNET Ticker Feed &bull; Verified Axis Escrow</span>
          </div>
        </div>
      </div>
    </header>
  );
}

