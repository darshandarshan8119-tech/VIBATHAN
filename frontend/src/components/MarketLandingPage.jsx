// src/components/MarketLandingPage.jsx
import React, { useState, useRef } from 'react';
import { 
  Scale, ArrowRight, ShieldCheck, Check, Sparkles, Lock, ArrowUpRight, 
  TrendingUp, TrendingDown, Building2, Landmark, CheckCircle2, Activity,
  BarChart2, FileText, Clock, MapPin, Award, Bot, Zap, Truck, Layers,
  ChevronRight, ArrowDownRight, Compass
} from 'lucide-react';
import { MANDI_INFRASTRUCTURE } from '../data/mockData';

export default function MarketLandingPage({ onEnterPlatform }) {
  // 3D Mouse Parallax Tilt Physics for Hero Card
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  
  // Interactive Hero Preview Tab: 'radar' | 'copilot' | 'depth'
  const [heroTab, setHeroTab] = useState('radar');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTransformStyle(`perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
    setGlarePosition({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const liveTickers = [
    { name: 'Wheat (Sharbati)', mandi: 'Ludhiana APMC', price: 2450, change: '+₹60 (2.4%)', isUp: true, high: 2480, low: 2410, volume: '4,200 Qtl', msp: 2275 },
    { name: 'Mustard Seed (Black)', mandi: 'Alwar APMC', price: 5680, change: '+₹100 (1.8%)', isUp: true, high: 5720, low: 5550, volume: '2,800 Qtl', msp: 5650 },
    { name: 'Cotton (Shankar-6)', mandi: 'Rajkot APMC', price: 7140, change: '-₹40 (0.6%)', isUp: false, high: 7220, low: 7110, volume: '6,400 Bales', msp: 7122 },
    { name: 'Basmati Paddy 1121', mandi: 'Karnal APMC', price: 4420, change: '+₹130 (3.1%)', isUp: true, high: 4460, low: 4280, volume: '5,100 Qtl', msp: 2183 },
    { name: 'Soybean (Yellow)', mandi: 'Indore APMC', price: 4820, change: '+₹40 (0.9%)', isUp: true, high: 4850, low: 4760, volume: '3,700 Qtl', msp: 4600 },
    { name: 'Red Chilli (Teja)', mandi: 'Guntur APMC', price: 18500, change: '+₹750 (4.2%)', isUp: true, high: 18900, low: 17600, volume: '1,950 Qtl', msp: 12000 },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#121212] flex flex-col font-sans selection:bg-[#EBE8E2] selection:text-[#121212] overflow-x-hidden">
      
      {/* Top Announcement Strip */}
      <div className="bg-[#121212] text-[#FBFBF9] text-[11px] py-2 px-4 tracking-wide font-medium text-center flex items-center justify-center gap-2">
        <Scale className="w-3.5 h-3.5 text-[#D4A373]" />
        <span>Bharat's National APMC Mandi Commodity Exchange &bull; Conversational AI Copilot, 5-Level Depth &amp; T+0 Escrow</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FBFBF9]/90 backdrop-blur-md border-b border-black/[0.06] transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Mark */}
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-[0.16em] text-[#121212] uppercase font-heading">
              AGRI<span className="text-[#C26747]">MART</span> <span className="text-xs font-mono font-bold tracking-normal text-[#5A5A5A]">MARKET INTELLIGENCE</span>
            </span>
            <span className="text-[9px] tracking-[0.25em] text-[#8E8E8E] uppercase font-sans -mt-0.5">
              Agentic Commodity Exchange &bull; Bharat
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#5A5A5A] font-heading">
            <a href="#live-radar" className="hover:text-[#121212] transition-colors">Live APMC Radar</a>
            <a href="#copilot-preview" className="hover:text-[#121212] transition-colors">AI Copilot</a>
            <a href="#core-capabilities" className="hover:text-[#121212] transition-colors">5-Level Depth</a>
            <a href="#infrastructure" className="hover:text-[#121212] transition-colors">Logistics &amp; Godowns</a>
            <a href="#clearing" className="hover:text-[#121212] transition-colors">Escrow Clearing</a>
          </nav>

          {/* Primary Action Button */}
          <button
            onClick={() => onEnterPlatform()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-[#C26747] text-white font-extrabold text-xs font-heading shadow-md transition-all active:scale-95 cursor-pointer">
            <Bot className="w-3.5 h-3.5 stroke-[2] text-[#D4A373]" />
            <span>Open AI Copilot</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>

        </div>
      </header>

      {/* REFINED HERO SECTION */}
      <section className="relative max-w-[1400px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-16">
        
        {/* Editorial Eyebrow & Headline Block */}
        <div className="max-w-4xl mb-10 space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F4F0] border border-black/[0.08] text-[11px] font-bold font-mono text-[#C26747] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#C26747] animate-ping" />
            <span>AGENTIC COMMODITY INTELLIGENCE &bull; VIBEATHON 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-[1.08] text-[#121212]">
            Conversational Agri-Market Intelligence.<br />
            <span className="text-[#C26747]">Live APMC Price Discovery</span> &amp; T+0 Escrow.
          </h1>

          <p className="text-sm sm:text-base text-[#5A5A5A] font-sans leading-relaxed max-w-2xl">
            Empowering Bharat's farmers with an autonomous AI copilot that ranks regional mandis by net in-hand cash proceeds, executes 5-level order depth analysis, matches verified institutional buyers, and books gate delivery slots in seconds.
          </p>

          {/* Quick AI Intent Pills */}
          <div className="pt-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E8E8E] block mb-2">
              Try Natural Language Inquiries:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: '🌾 Compare 100 Qtl Wheat across Ludhiana & Karnal', action: () => onEnterPlatform() },
                { label: '📊 5-Level Depth & Buyer Spread for Mustard', action: () => onEnterPlatform() },
                { label: '🚚 Book APMC Gate Slot for PB-10 Vehicle', action: () => onEnterPlatform() },
                { label: '📈 14-Day Price Forecast with 95% Confidence Bounds', action: () => onEnterPlatform() },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={chip.action}
                  className="px-3.5 py-1.5 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E2] border border-black/[0.06] text-xs font-medium text-[#121212] transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer">
                  <span>{chip.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#C26747]" />
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons & Social Proof */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={() => onEnterPlatform()}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#121212] hover:bg-[#C26747] text-white font-extrabold text-xs font-heading shadow-xl transition-all cursor-pointer hover:shadow-2xl active:scale-95">
              <Bot className="w-4 h-4 text-[#D4A373]" />
              <span>Launch AI Market Copilot</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onEnterPlatform()}
              className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E2] text-[#121212] font-bold text-xs font-heading border border-black/[0.08] transition-all cursor-pointer">
              <BarChart2 className="w-4 h-4 text-[#5A5A5A]" />
              <span>Open Trading Terminal</span>
              <ArrowUpRight className="w-4 h-4 text-[#8E8E8E]" />
            </button>

            <div className="flex items-center gap-3 pl-2 text-xs font-mono text-[#5A5A5A]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>e-NAM Synced</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C26747]" />
                <span>100% Escrow Protected</span>
              </span>
            </div>
          </div>

        </div>

        {/* 3D Interactive Terminal & Intelligence Showcase Card */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: transformStyle, transition: 'transform 0.15s ease-out' }}
          className="relative rounded-3xl bg-[#111315] text-white p-6 sm:p-8 border border-white/[0.1] shadow-2xl overflow-hidden">
          
          {/* Subtle Glare overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
            }}
          />

          {/* Card Top Control Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.1]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                  AgriMart Live Telemetry Hub
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  Connected to 6 APMC electronic pits &bull; AGMARKNET statutory benchmarks
                </span>
              </div>
            </div>

            {/* Interactive Preview Mode Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-mono">
              <button
                onClick={() => setHeroTab('radar')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  heroTab === 'radar' 
                    ? 'bg-[#C26747] text-white shadow-sm' 
                    : 'text-white/60 hover:text-white'
                }`}>
                Live APMC Radar
              </button>
              <button
                onClick={() => setHeroTab('copilot')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  heroTab === 'copilot' 
                    ? 'bg-[#C26747] text-white shadow-sm' 
                    : 'text-white/60 hover:text-white'
                }`}>
                AI Copilot Reasoning
              </button>
              <button
                onClick={() => setHeroTab('depth')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  heroTab === 'depth' 
                    ? 'bg-[#C26747] text-white shadow-sm' 
                    : 'text-white/60 hover:text-white'
                }`}>
                5-Level Depth
              </button>
            </div>
          </div>

          {/* TAB 1: LIVE COMMODITY RADAR GRID */}
          {heroTab === 'radar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6" id="live-radar">
              {liveTickers.map((t, idx) => {
                const spreadRange = t.high - t.low;
                const posPercent = spreadRange > 0 ? Math.round(((t.price - t.low) / spreadRange) * 100) : 50;

                return (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#C26747]/60 hover:bg-white/[0.07] transition-all space-y-3 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-white group-hover:text-[#D4A373] transition-colors">{t.name}</h4>
                        <span className="text-[11px] text-white/50 flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-[#C26747]" />
                          <span>{t.mandi}</span>
                        </span>
                      </div>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        t.isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {t.change}
                      </span>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-white/40 block">Modal Spot Rate</span>
                        <span className="text-2xl font-black font-mono text-white">₹{t.price.toLocaleString()}</span>
                        <span className="text-[10px] text-white/50 font-normal"> /Qtl</span>
                      </div>

                      <div className="text-right text-[11px] font-mono text-white/60">
                        <div>High: <span className="text-white font-bold">₹{t.high}</span></div>
                        <div>Low: <span className="text-white font-bold">₹{t.low}</span></div>
                      </div>
                    </div>

                    {/* Day Range Mini-Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#C26747] rounded-full"
                          style={{ width: `${posPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-white/40">
                        <span>MSP: ₹{t.msp}</span>
                        <span>Spread: ₹{t.high - t.low}</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-white/40 flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <span>Arrival: {t.volume}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>e-NAM Verified</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: AI COPILOT REASONING PREVIEW */}
          {heroTab === 'copilot' && (
            <div className="pt-6 space-y-4" id="copilot-preview">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#D4A373] mb-2">
                  <Bot className="w-4 h-4" />
                  <span>Kisan Query: "Compare mandis for 100 Quintals Wheat Sharbati from Ludhiana hub"</span>
                </div>
                <div className="text-xs text-white/80 font-sans leading-relaxed">
                  The AI Copilot queries regional APMC spot rates, calculates transportation freight tariffs @ ₹0.18/qtl/km, applies statutory 1.5% Mandi Cess and 0.5% Escrow guarantee, and ranks markets by <strong className="text-white">Net In-Hand Proceeds</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { mandi: 'Ludhiana APMC (Punjab)', rate: 2450, dist: '32 km', freight: 576, cess: 3675, net: 238125, rank: '#1 Best Choice', highlight: true },
                  { mandi: 'Karnal APMC (Haryana)', rate: 2380, dist: '125 km', freight: 2250, cess: 3570, net: 230330, rank: '#2 (-₹7,795)', highlight: false },
                  { mandi: 'Alwar APMC (Rajasthan)', rate: 2410, dist: '340 km', freight: 6120, cess: 3615, net: 228945, rank: '#3 (-₹9,180)', highlight: false },
                ].map((m, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      m.highlight 
                        ? 'bg-[#C26747]/10 border-[#C26747] text-white' 
                        : 'bg-white/[0.03] border-white/[0.06] text-white/80'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        m.highlight ? 'bg-[#C26747] text-white' : 'bg-white/10 text-white/60'
                      }`}>
                        {m.rank}
                      </span>
                      <span className="text-[11px] font-mono text-white/50">{m.dist}</span>
                    </div>
                    <h5 className="font-heading font-bold text-sm text-white mb-2">{m.mandi}</h5>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-white/60">
                        <span>Quoted Spot:</span>
                        <span>₹{m.rate}/Qtl</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Freight + Cess:</span>
                        <span>₹{(m.freight + m.cess).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-emerald-400">
                        <span>Net In-Hand:</span>
                        <span>₹{m.net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>AI Recommendation: Ludhiana yields ₹7,795 higher cash proceeds than Karnal because lower freight charges outweigh the quoted rate difference.</span>
              </div>
            </div>
          )}

          {/* TAB 3: 5-LEVEL ORDER DEPTH PREVIEW */}
          {heroTab === 'depth' && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-white/60 pb-2 border-b border-white/[0.08]">
                <span>Commodity: <strong className="text-white">Wheat Sharbati (Grade A)</strong></span>
                <span>Best Bid: <strong className="text-emerald-400">₹2,440</strong> | Best Ask: <strong className="text-rose-400">₹2,460</strong> | Spread: <strong className="text-[#D4A373]">₹20 (0.82%)</strong></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bids */}
                <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-emerald-400 pb-1 border-b border-emerald-500/20">
                    <span>BID PRICE (₹/QTL)</span>
                    <span>BUY VOLUME (QTL)</span>
                    <span>ORDERS</span>
                  </div>
                  {[
                    { rate: 2440, qty: 120, orders: 3 },
                    { rate: 2432, qty: 200, orders: 5 },
                    { rate: 2424, qty: 310, orders: 7 },
                    { rate: 2416, qty: 450, orders: 9 },
                    { rate: 2408, qty: 620, orders: 12 },
                  ].map((b, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono text-white/80">
                      <span className="text-emerald-400 font-bold">₹{b.rate}</span>
                      <span>{b.qty} Qtl</span>
                      <span className="text-white/40">{b.orders}</span>
                    </div>
                  ))}
                </div>

                {/* Asks */}
                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono font-bold text-rose-400 pb-1 border-b border-rose-500/20">
                    <span>ASK PRICE (₹/QTL)</span>
                    <span>SELL VOLUME (QTL)</span>
                    <span>ORDERS</span>
                  </div>
                  {[
                    { rate: 2460, qty: 95, orders: 2 },
                    { rate: 2468, qty: 160, orders: 4 },
                    { rate: 2476, qty: 235, orders: 6 },
                    { rate: 2484, qty: 320, orders: 8 },
                    { rate: 2492, qty: 415, orders: 10 },
                  ].map((a, i) => (
                    <div key={i} className="flex justify-between text-xs font-mono text-white/80">
                      <span className="text-rose-400 font-bold">₹{a.rate}</span>
                      <span>{a.qty} Qtl</span>
                      <span className="text-white/40">{a.orders}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Card Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-white/60 font-sans">
              Need real-time lot bidding, digital gate passes, or contract notes?
            </span>
            <button
              onClick={() => onEnterPlatform()}
              className="px-5 py-2.5 rounded-full bg-[#C26747] hover:bg-[#D35400] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <span>Enter Full AgriMart Platform</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </section>

      {/* CORE PLATFORM CAPABILITIES */}
      <section className="bg-[#F5F4F0] py-20 border-y border-black/[0.06]" id="core-capabilities">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          
          <div className="max-w-2xl mb-12">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C26747] block mb-2">
              Architectural Agritech Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#121212] tracking-tight">
              Built for Institutional Precision &amp; Cultivator Equity.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5A5A] font-sans mt-2">
              Every market component is engineered with real financial and agricultural telemetry to eliminate unverified middlemen discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. AGMARKNET Benchmark */}
            <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C26747]/10 flex items-center justify-center text-[#C26747]">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#121212]">AGMARKNET Benchmark</h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                Direct statutory modal rates from official central APMC feeds, establishing fair benchmark minimums before bidding starts.
              </p>
            </div>

            {/* 2. Five-Level Market Depth */}
            <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#121212]">5-Level Depth &amp; Spread</h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                Complete visibility of top 5 merchant bids and farmer asks, real-time bid/ask spread, and last traded price (LTP) analytics.
              </p>
            </div>

            {/* 3. Moisture Assay Deductions */}
            <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#121212]">Transparent Moisture Assays</h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                Standardized basis moisture bands with algorithmic price deduction rates per excess percentage point. Zero arbitrary price cuts.
              </p>
            </div>

            {/* 4. T+0 Escrow Clearing */}
            <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#121212]">T+0 Escrow Settlement</h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                Secured bank escrow quarantine for buyer funds, programmatic APMC cess calculation, and automated RTGS payout to farmers upon gate weighment.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* MANDI INFRASTRUCTURE SHOWCASE */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 py-20" id="infrastructure">
        <div className="max-w-2xl mb-12">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C26747] block mb-2">
            Certified Physical Logistics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#121212] tracking-tight">
            Accredited Mandi Infrastructure.
          </h2>
          <p className="text-xs sm:text-sm text-[#5A5A5A] font-sans mt-2">
            Connecting electronic trading directly to CWC accredited grain godowns, electronic weighbridges, and certified NIR spectroscopy assay laboratories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MANDI_INFRASTRUCTURE.map((item) => (
            <div 
              key={item.id}
              className="group rounded-3xl overflow-hidden bg-white border border-black/[0.06] shadow-xs hover:shadow-md transition-all flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wide">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h4 className="font-heading font-bold text-sm text-[#121212]">{item.title}</h4>
                <p className="text-xs text-[#5A5A5A] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-20" id="clearing">
        <div className="rounded-3xl bg-[#121212] text-white p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl z-10">
            <span className="text-[11px] font-mono uppercase text-[#D4A373] tracking-widest font-bold">
              Kisan &bull; APMC Merchant &bull; FPO Clearing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight text-white">
              Ready to trade on Bharat's most transparent commodity exchange?
            </h2>
            <p className="text-xs sm:text-sm text-white/70">
              Access real-time APMC arrivals, submit auction lots with guaranteed reserve prices, or place institutional bids with certified laboratory assays.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0 z-10">
            <button
              onClick={() => onEnterPlatform()}
              className="px-6 py-4 rounded-full bg-[#C26747] hover:bg-[#D35400] text-white font-extrabold text-xs font-heading shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Bot className="w-4 h-4 stroke-[2] text-[#D4A373]" />
              <span>Launch AI Market Copilot</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-8 px-4 sm:px-8 text-center text-xs text-[#8E8E8E] bg-[#FBFBF9]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 AgriMart Market Intelligence. All rights reserved.</span>
          <span>National APMC Mandi Feeds &bull; AGMARKNET Benchmarks &bull; Axis Escrow Simulation</span>
        </div>
      </footer>

    </div>
  );
}
