// src/components/Footer.jsx
import React from 'react';
import { ShieldCheck, Scale, FileText, TrendingUp, Building2, ExternalLink } from 'lucide-react';

export default function Footer({ onSelectMandiTab }) {
  return (
    <footer className="bg-[#121212] text-[#8E8E8E] pt-16 pb-12 border-t border-black/[0.1]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
          
          {/* Brand & Mandi Charter (Col 1 to 5) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-2xl font-black tracking-[0.16em] text-[#FBFBF9] uppercase font-heading block">
              AGRI<span className="text-[#C26747]">MART</span> <span className="text-xs text-white/50 font-mono tracking-normal">MARKET INTELLIGENCE</span>
            </span>
            <p className="text-xs sm:text-sm text-[#8E8E8E] font-sans leading-relaxed max-w-md">
              Democratizing wholesale agricultural commodity trade across Bharat. High-frequency APMC price feeds, standardized moisture assay discounts, transparent 5-level market depth, and digital escrow clearing.
            </p>
            <div className="pt-2 text-[11px] text-[#D4A373] font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4A373] shrink-0" />
              <span>100% Certified AGMARKNET Benchmark Rates &amp; Verified Weighbridge Data</span>
            </div>
          </div>

          {/* Market Intelligence Modules (Col 6 to 8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-[#FBFBF9] tracking-wider uppercase font-heading">
              Exchange Terminal
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button 
                  onClick={() => onSelectMandiTab && onSelectMandiTab('exchange')} 
                  className="hover:text-white transition-colors cursor-pointer text-left">
                  Live APMC Commodity Exchange
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectMandiTab && onSelectMandiTab('arrivals')} 
                  className="hover:text-white transition-colors cursor-pointer text-left">
                  Real-Time Mandi Arrivals &amp; Gates
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectMandiTab && onSelectMandiTab('lots')} 
                  className="hover:text-white transition-colors cursor-pointer text-left">
                  Wholesale Farmer Harvest Lots
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectMandiTab && onSelectMandiTab('contracts')} 
                  className="hover:text-white transition-colors cursor-pointer text-left">
                  Contract Notes &amp; Escrow Ledger
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectMandiTab && onSelectMandiTab('auction')} 
                  className="hover:text-white transition-colors cursor-pointer text-left">
                  Kisan Digital Auction Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Mandi Network & APMC Hubs (Col 9 to 10) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#FBFBF9] tracking-wider uppercase font-heading">
              APMC Hubs
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><span className="text-[#B0AEA8]">Ludhiana APMC, Punjab</span></li>
              <li><span className="text-[#B0AEA8]">Alwar APMC, Rajasthan</span></li>
              <li><span className="text-[#B0AEA8]">Rajkot APMC, Gujarat</span></li>
              <li><span className="text-[#B0AEA8]">Karnal APMC, Haryana</span></li>
              <li><span className="text-[#B0AEA8]">Indore APMC, MP</span></li>
              <li><span className="text-[#B0AEA8]">Guntur APMC, AP</span></li>
            </ul>
          </div>

          {/* Compliance & Standards (Col 11 to 12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#FBFBF9] tracking-wider uppercase font-heading">
              Clearing &amp; Standards
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#B0AEA8]">
              <li>e-NAM Compatible</li>
              <li>AGMARK Moisture Assays</li>
              <li>T+0 RTGS Direct to Farmer</li>
              <li>Bank-Guaranteed Settlement</li>
              <li>Ministry of Agriculture Compliance</li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8E8E] gap-4">
          <p>© 2026 AgriMart National APMC Mandi Commodity Exchange. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors">Security &amp; Encryption</span>
            <span className="hover:text-white transition-colors">Statutory Mandi By-Laws</span>
            <span className="hover:text-white transition-colors">Axis Escrow Charter</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
