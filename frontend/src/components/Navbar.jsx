// src/components/Navbar.jsx
import React from 'react';
import { 
  Search, User, Scale, FileText, Gavel, LogOut, ArrowLeft,
  Activity, TrendingUp, Layers, CheckCircle2, ChevronRight,
  Bot, BarChart2, ReceiptText, ShieldCheck, Sparkles, ExternalLink
} from 'lucide-react';

export default function Navbar({ 
  user,
  onOpenLogin,
  onLogout,
  onOpenSearch, 
  mandiTab,
  onSelectMandiTab,
  onExitToLanding,
  activeAppView = 'assistant',
  onNavigateView = () => {}
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-black/[0.06] transition-all">
      {/* Top Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">

          {/* Left: Brandmark & Return to Public Portal */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={onExitToLanding}
              className="flex flex-col text-left group focus:outline-none shrink-0 cursor-pointer">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] font-heading flex items-center gap-1.5">
                <span>Agri<span className="text-[#C26747]">mart</span></span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#C26747]/10 text-[#C26747] border border-[#C26747]/20 tracking-normal">
                  Agentic AI
                </span>
              </span>
              <span className="text-[9px] tracking-widest text-[#787774] uppercase font-mono -mt-0.5 hidden sm:block">
                National APMC Mandi &bull; Commodity Exchange
              </span>
            </button>
          </div>

          {/* Center: First-Class Sub-Module Switcher (Separate Dedicated Pages) */}
          <div className="flex items-center p-1 rounded-full bg-[#F2F0EB] border border-black/[0.07] shadow-xs">
            {/* Module 1: AI Copilot */}
            <button
              onClick={() => onNavigateView('assistant')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
                activeAppView === 'assistant'
                  ? 'bg-[#121212] text-white shadow-md'
                  : 'text-[#5A5A5A] hover:text-[#121212] hover:bg-black/[0.04]'
              }`}>
              <Bot className={`w-3.5 h-3.5 ${activeAppView === 'assistant' ? 'text-[#D4A373]' : 'text-[#8E8E8E]'}`} />
              <span>AI Copilot</span>
              {activeAppView === 'assistant' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Module 2: Market Terminal */}
            <button
              onClick={() => onNavigateView('terminal')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-heading font-extrabold transition-all cursor-pointer ${
                activeAppView === 'terminal'
                  ? 'bg-[#121212] text-white shadow-md'
                  : 'text-[#5A5A5A] hover:text-[#121212] hover:bg-black/[0.04]'
              }`}>
              <BarChart2 className={`w-3.5 h-3.5 ${activeAppView === 'terminal' ? 'text-[#D4A373]' : 'text-[#8E8E8E]'}`} />
              <span>Market Terminal</span>
            </button>

            {/* Module 3: Transactions & Escrow */}
            <button
              onClick={() => onNavigateView('transactions')}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                activeAppView === 'transactions'
                  ? 'bg-[#121212] text-white shadow-md'
                  : 'text-[#5A5A5A] hover:text-[#121212] hover:bg-black/[0.04]'
              }`}>
              <ReceiptText className={`w-3.5 h-3.5 ${activeAppView === 'transactions' ? 'text-[#D4A373]' : 'text-[#8E8E8E]'}`} />
              <span className="hidden md:inline">Transactions &amp; Escrow</span>
              <span className="md:hidden">Ledger</span>
            </button>

            {/* Module 4: Profile */}
            <button
              onClick={() => onNavigateView('profile')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                activeAppView === 'profile'
                  ? 'bg-[#121212] text-white shadow-md'
                  : 'text-[#5A5A5A] hover:text-[#121212] hover:bg-black/[0.04]'
              }`}>
              <User className={`w-3.5 h-3.5 ${activeAppView === 'profile' ? 'text-[#D4A373]' : 'text-[#8E8E8E]'}`} />
              <span>Profile</span>
            </button>
          </div>

          {/* Right: Search & User Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F6F5F2] hover:bg-[#EFECE5] text-[#787774] text-xs rounded-full border border-black/[0.05] transition-all cursor-pointer"
              title="Search Mandis & Commodities (Cmd+K)">
              <Search className="w-3.5 h-3.5 text-[#888681]" />
              <kbd className="hidden sm:inline text-[9px] font-mono text-[#888681] bg-white px-1.5 py-0.5 rounded border border-black/[0.06]">
                ⌘K
              </kbd>
            </button>

            {/* User Session Pill */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateView('profile')}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E2] border border-black/[0.06] text-xs transition-colors cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[#1A1A1A] text-xs leading-none">
                      {user.name ? user.name.split(' ')[0] : 'Kisan'}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-[#787774] capitalize leading-tight">
                      {user.role || 'Member'}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-[#787774] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  aria-label="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs text-white bg-[#1A1A1A] hover:bg-[#333] rounded-full font-bold shadow-xs transition-colors cursor-pointer"
                aria-label="User Account">
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>

        {/* Dynamic Contextual Sub-Bar */}
        <div className="flex items-center justify-between border-t border-black/[0.06] py-2 text-xs overflow-x-auto no-scrollbar gap-4">
          
          {/* SCENARIO A: Inside Market Terminal -> Show Terminal Trading Sub-Tabs */}
          {activeAppView === 'terminal' && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6 sm:gap-7 shrink-0 text-xs font-medium">
                <button
                  onClick={() => onSelectMandiTab('exchange')}
                  className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${
                    mandiTab === 'exchange' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
                  }`}>
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live APMC Exchange</span>
                  {mandiTab === 'exchange' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C26747] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onSelectMandiTab('arrivals')}
                  className={`py-1 relative transition-colors cursor-pointer ${
                    mandiTab === 'arrivals' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
                  }`}>
                  <span>Real-Time Arrivals</span>
                  {mandiTab === 'arrivals' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C26747] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onSelectMandiTab('lots')}
                  className={`py-1 relative transition-colors cursor-pointer ${
                    mandiTab === 'lots' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
                  }`}>
                  <span>Wholesale Lots</span>
                  {mandiTab === 'lots' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C26747] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onSelectMandiTab('bids')}
                  className={`py-1 relative transition-colors cursor-pointer ${
                    mandiTab === 'bids' ? 'text-[#1A1A1A] font-bold' : 'text-[#6B6A66] hover:text-[#1A1A1A]'
                  }`}>
                  <span>Merchant Bids</span>
                  {mandiTab === 'bids' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C26747] rounded-full" />
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
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C26747] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onSelectMandiTab('auction')}
                  className={`py-1 relative flex items-center gap-1.5 transition-colors cursor-pointer ${
                    mandiTab === 'auction' ? 'text-[#C26747] font-bold' : 'text-[#C26747]/80 hover:text-[#C26747]'
                  }`}>
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Kisan Auction Desk</span>
                  {mandiTab === 'auction' && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#C26747] rounded-full" />
                  )}
                </button>
              </div>

              <button
                onClick={() => onNavigateView('assistant')}
                className="hidden md:flex items-center gap-1 text-[11px] font-mono font-bold text-[#C26747] hover:underline cursor-pointer">
                <span>Switch to AI Copilot</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* SCENARIO B: Inside AI Copilot -> Show Telemetry Status & Direct Terminal Jump Pills */}
          {activeAppView === 'assistant' && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#5A5A5A]">
                <span className="flex items-center gap-1.5 font-bold text-[#121212]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Agentic Copilot Active</span>
                </span>
                <span>&bull;</span>
                <span className="hidden sm:inline">6 Regional APMC Electronic Feeds</span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="hidden md:inline">Deterministic 1.5% Cess &amp; Freight Tariffs</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#8E8E8E] hidden lg:inline">Quick Jump to Terminal:</span>
                <button
                  onClick={() => {
                    onSelectMandiTab('exchange');
                    onNavigateView('terminal');
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E2] text-[11px] font-mono font-bold text-[#121212] border border-black/[0.06] flex items-center gap-1 transition-all cursor-pointer">
                  <BarChart2 className="w-3 h-3 text-[#C26747]" />
                  <span>5-Level Order Book</span>
                </button>

                <button
                  onClick={() => {
                    onSelectMandiTab('auction');
                    onNavigateView('terminal');
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E2] text-[11px] font-mono font-bold text-[#121212] border border-black/[0.06] flex items-center gap-1 transition-all cursor-pointer">
                  <Gavel className="w-3 h-3 text-[#C26747]" />
                  <span>Kisan Auction</span>
                </button>
              </div>
            </div>
          )}

          {/* SCENARIO C: Inside Transactions -> Show Escrow Status */}
          {activeAppView === 'transactions' && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#5A5A5A]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Statutory APMC Contract Notes &bull; T+0 RTGS Settlement Ledger &bull; SHA-256 Escrow Hashes</span>
              </div>
              <button
                onClick={() => onNavigateView('assistant')}
                className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#C26747] hover:underline cursor-pointer">
                <span>Return to AI Copilot</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* SCENARIO D: Inside Profile */}
          {activeAppView === 'profile' && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#5A5A5A]">
                <User className="w-3.5 h-3.5 text-[#C26747]" />
                <span>Accredited Cultivator &amp; APMC Merchant Institutional Profile</span>
              </div>
              <button
                onClick={() => onNavigateView('assistant')}
                className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#C26747] hover:underline cursor-pointer">
                <span>Return to AI Copilot</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
