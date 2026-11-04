// src/assistant/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, Scale, TrendingUp, Calendar, DollarSign, Building2 } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled = false, placeholder = "Ask AgriMart about mandi rates, buyer bids, profit estimates, or slot bookings...", language = 'en', onLanguageChange }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const promptChips = [
    { label: 'Business Storage Plan', query: 'I am a merchant planning cold storage. Help me decide what details you need before I buy or hold stock.' },
    { label: '🌾 Compare Wheat APMCs', query: 'I have 100 quintals of Sharbati Wheat. Which mandi offers the best net proceeds?' },
    { label: '📊 5-Level Depth & Spread', query: 'Show me the 5-level order book and market depth for Ludhiana APMC wheat.' },
    { label: '💰 Calculate 100 Qtl Profit', query: 'Calculate my estimated net proceeds for 100 quintals of wheat at Ludhiana APMC.' },
    { label: '📈 7-Day Price Forecast', query: 'What is the 7-day statistical price forecast for Wheat at Ludhiana APMC?' },
    { label: '🏢 Match Verified Buyers', query: 'Which verified APMC institutional buyers have active bids for my harvest?' },
    { label: '🚚 Book Delivery Slot', query: 'Check available weighbridge delivery slots at Ludhiana APMC for tomorrow.' },
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5 text-xs">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSendMessage(chip.query)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF9F5] hover:border-black/20 text-slate-700 font-medium border border-black/[0.08] text-[11px] whitespace-nowrap shadow-2xs transition-all cursor-pointer">
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <form onSubmit={handleSubmit} className="relative rounded-3xl bg-white border border-black/[0.1] shadow-md focus-within:border-[#121212] focus-within:ring-1 focus-within:ring-[#121212] transition-all p-2 sm:p-2.5">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none font-sans max-h-36"
        />

        <div className="flex items-center justify-between gap-2 pt-1 px-2 border-t border-black/[0.04] text-[11px] text-slate-400">
          <span className="hidden sm:inline">Press Enter to send &bull; Shift + Enter for newline</span>
          <span className="sm:hidden">AgriMart AI</span>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(event) => onLanguageChange?.(event.target.value)}
              disabled={disabled}
              aria-label="Chat response language"
              className="h-8 bg-[#FAF9F5] border border-black/[0.08] rounded-md px-2 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-[#121212]">
              <option value="en">English</option>
              <option value="kn">Kannada</option>
            </select>
            <button
              type="submit"
              disabled={!text.trim() || disabled}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                text.trim() && !disabled
                  ? 'bg-[#121212] text-white hover:bg-[#C26747] shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}>
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
