// src/components/SearchModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, Scale, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { LIVE_MANDI_COMMODITIES } from '../data/mockData';

export default function SearchModal({ isOpen, onClose, onSelectCommodity }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = LIVE_MANDI_COMMODITIES.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.mandi.toLowerCase().includes(query.toLowerCase()) ||
    c.grade.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-black/[0.08] flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center gap-3 bg-[#FBFBF9]">
          <Search className="w-5 h-5 text-[#B45309] shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search APMC commodities (Wheat, Mustard, Cotton, Basmati Paddy, Soybean)..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors font-heading">
            ESC
          </button>
        </div>

        {/* Popular Shortcuts */}
        {!query && (
          <div className="p-4 border-b border-black/[0.05] flex items-center gap-2 text-xs text-slate-500 flex-wrap bg-[#FAF9F5]">
            <span className="font-bold text-slate-700 font-heading">Popular Mandis &amp; Crops:</span>
            {['Wheat', 'Mustard', 'Cotton', 'Basmati', 'Soybean', 'Maize', 'Ludhiana APMC', 'Rajkot APMC'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-2.5 py-1 bg-white hover:bg-[#B45309]/10 hover:text-[#B45309] rounded-lg text-xs font-semibold border border-black/[0.06] transition-colors">
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No APMC commodity contracts found matching "{query}". Try searching by crop name or regional APMC mandi.
            </div>
          ) : (
            filtered.map((commodity) => (
              <div 
                key={commodity.id}
                onClick={() => {
                  if (onSelectCommodity) onSelectCommodity(commodity);
                  onClose();
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#F5F4F0] border border-transparent hover:border-black/[0.06] transition-all cursor-pointer group">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img 
                    src={commodity.cropImage || commodity.image} 
                    alt={commodity.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white" 
                  />
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#B45309] truncate">
                      {commodity.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#B45309]" />
                        <span>{commodity.mandi}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="font-medium text-slate-700">{commodity.grade}</span>
                      <span>&bull;</span>
                      <span>Moisture: {commodity.moisture}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-[#121212] font-mono">
                    ₹{commodity.price?.toLocaleString()}
                    <span className="text-[10px] text-slate-500 font-normal"> /Qtl</span>
                  </div>
                  <div className={`text-[11px] font-bold font-mono flex items-center justify-end gap-0.5 ${
                    commodity.isUp ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {commodity.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{commodity.change}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

