// src/components/MarketLandingPage.jsx
import React, { useState, useRef } from 'react';
import { 
  Scale, ArrowRight, ShieldCheck, Check, Sparkles, Lock, ArrowUpRight, 
  TrendingUp, TrendingDown, Building2, Landmark, CheckCircle2, Activity,
  BarChart2, FileText, Clock, MapPin, Award
} from 'lucide-react';
import { MANDI_INFRASTRUCTURE } from '../data/mockData';

export default function MarketLandingPage({ onEnterPlatform }) {
  // 3D Mouse Parallax Tilt Physics for Hero Card
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransformStyle(`perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setGlarePosition({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const liveTickers = [
    { name: 'Wheat (Sharbati)', mandi: 'Ludhiana APMC', price: 2450, change: '+₹60 (2.4%)', isUp: true, high: 2480, low: 2410, volume: '4,200 Qtl' },
    { name: 'Mustard Seed (Black)', mandi: 'Alwar APMC', price: 5680, change: '+₹100 (1.8%)', isUp: true, high: 5720, low: 5550, volume: '2,800 Qtl' },
    { name: 'Cotton (Shankar-6)', mandi: 'Rajkot APMC', price: 7140, change: '-₹40 (0.6%)', isUp: false, high: 7220, low: 7110, volume: '6,400 Bales' },
    { name: 'Basmati Paddy 1121', mandi: 'Karnal APMC', price: 4420, change: '+₹130 (3.1%)', isUp: true, high: 4460, low: 4280, volume: '5,100 Qtl' },
    { name: 'Soybean (Yellow)', mandi: 'Indore APMC', price: 4820, change: '+₹40 (0.9%)', isUp: true, high: 4850, low: 4760, volume: '3,700 Qtl' },
    { name: 'Red Chilli (Teja)', mandi: 'Guntur APMC', price: 18500, change: '+₹750 (4.2%)', isUp: true, high: 18900, low: 17600, volume: '1,950 Qtl' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#121212] flex flex-col font-sans selection:bg-[#EBE8E2] selection:text-[#121212] overflow-x-hidden">
      
      {/* Top Announcement Strip */}
      <div className="bg-[#121212] text-[#FBFBF9] text-[11px] py-2 px-4 tracking-wide font-medium text-center flex items-center justify-center gap-2">
        <Scale className="w-3.5 h-3.5 text-[#D4A373]" />
        <span>Bharat's National APMC Mandi Commodity Exchange &bull; AGMARKNET Benchmarks, 5-Level Depth &amp; T+0 Escrow</span>
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
              APMC Commodity Exchange &bull; Bharat
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#5A5A5A] font-heading">
            <a href="#live-radar" className="hover:text-[#121212] transition-colors">Live APMC Radar</a>
            <a href="#core-capabilities" className="hover:text-[#121212] transition-colors">Order Depth &amp; Assays</a>
            <a href="#infrastructure" className="hover:text-[#121212] transition-colors">Mandi Infrastructure</a>
            <a href="#clearing" className="hover:text-[#121212] transition-colors">Escrow Clearing</a>
          </nav>

          {/* Primary Action Button */}
          <button
            onClick={() => onEnterPlatform()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-[#283618] text-white font-extrabold text-xs font-heading shadow-md transition-all active:scale-95 cursor-pointer">
            <Lock className="w-3.5 h-3.5 stroke-[2]" />
            <span>Launch Market Terminal</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-[1400px] mx-auto px-4 sm:px-8 pt-10 pb-16">
        
        {/* Editorial Eyebrow & Headline Block */}
        <div className="max-w-3xl mb-10 space-y-3">
          <div className="text-[11px] font-bold tracking-[0.25em] text-[#C26747] uppercase font-sans flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C26747]"></span>
            <span>NATIONAL APMC MANDI COMMODITY EXCHANGE 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading tracking-tight leading-[1.08] text-[#121212]">
            Democratized Mandi Intelligence.<br />
            <span className="text-[#C26747]">Live APMC Price Discovery</span> &amp; Escrow.
          </h1>

          <p className="text-sm sm:text-base text-[#5A5A5A] font-sans leading-relaxed max-w-2xl pt-2">
            Bridging Bharat's agricultural producers directly with verified wholesale merchants. High-frequency price tickers across 6 states, 5-level order depth, standardized moisture assay discounts, and guaranteed electronic settlement.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onEnterPlatform()}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#121212] hover:bg-[#C26747] text-white font-extrabold text-xs font-heading shadow-lg transition-all cursor-pointer">
              <span>Open AgriStock Terminal</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <a
              href="#live-radar"
              className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#F5F4F0] hover:bg-[#EBE8E2] text-[#121212] font-bold text-xs font-heading border border-black/[0.08] transition-all">
              <span>View Live APMC Rates</span>
              <ArrowUpRight className="w-4 h-4 text-[#8E8E8E]" />
            </a>
          </div>
        </div>

        {/* 3D Interactive Terminal Showcase Card */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transform: transformStyle, transition: 'transform 0.15s ease-out' }}
          className="relative rounded-3xl bg-[#111315] text-white p-6 sm:p-10 border border-white/[0.1] shadow-2xl overflow-hidden">
          
          {/* Subtle Glare overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
            }}
          />

          {/* Terminal Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.1]">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                APMC National Mandi Radar &bull; Active Real-Time Stream
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-white/60">
              <span>AGMARKNET Linked</span>
              <span>&bull;</span>
              <span>LTP Discovery</span>
              <span>&bull;</span>
              <span>T+0 RTGS</span>
            </div>
          </div>

          {/* Live Commodity Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6" id="live-radar">
            {liveTickers.map((t, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#E67E22]/50 hover:bg-white/[0.07] transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-white">{t.name}</h4>
                    <span className="text-[11px] text-white/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E67E22]" />
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
                    <span className="text-[10px] uppercase font-mono text-white/40 block">Modal Price</span>
                    <span className="text-xl font-black font-mono text-white">₹{t.price.toLocaleString()}</span>
                    <span className="text-[10px] text-white/50 font-normal"> /Qtl</span>
                  </div>

                  <div className="text-right text-[11px] font-mono text-white/60">
                    <div>High: <span className="text-white font-bold">₹{t.high}</span></div>
                    <div>Low: <span className="text-white font-bold">₹{t.low}</span></div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-white/40 flex items-center justify-between pt-1 border-t border-white/[0.05]">
                  <span>Arrival: {t.volume}</span>
                  <span className="text-emerald-400">e-NAM Verified</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-white/60 font-sans">
              Looking for 5-level depth book, moisture deduction calculations, or lot auctions?
            </span>
            <button
              onClick={() => onEnterPlatform()}
              className="px-5 py-2.5 rounded-full bg-[#E67E22] hover:bg-[#D35400] text-[#111315] font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <span>Enter Full AgriStock Terminal</span>
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
              className="px-6 py-4 rounded-full bg-[#E67E22] hover:bg-[#D35400] text-[#111315] font-extrabold text-xs font-heading shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Lock className="w-4 h-4 stroke-[2]" />
              <span>Sign In to Terminal</span>
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

