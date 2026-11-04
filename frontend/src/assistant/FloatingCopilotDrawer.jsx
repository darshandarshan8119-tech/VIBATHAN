// src/assistant/FloatingCopilotDrawer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, X, Send, ArrowUpRight, UploadCloud, 
  MessageSquare, ChevronRight, Scale, Leaf, Sprout, BarChart2 
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import { SAMPLE_DISEASES } from '../data/diseaseData';
import { SOIL_PRESETS, calculateCropRecommendation } from '../data/cropRecommendationData';

const QUICK_PROMPTS = [
  { label: '🌾 Wheat Price & Risk', query: 'What is the modal price and 7-day forecast for Wheat at Ludhiana APMC?' },
  { label: '🔬 Check Leaf Disease', query: 'How to diagnose and cure leaf blight disease?' },
  { label: '🌱 Recommend Crop for Soil', query: 'What crop is recommended for alluvial soil with high nitrogen?' },
  { label: '⚖️ Best Mandi for 100 Qtl', query: 'Which regional mandi gives the highest net proceeds for 100 quintals of wheat?' },
  { label: '📊 5-Level Market Depth', query: 'Show 5-level order book depth and spread for Mustard' },
  { label: '📅 Book Delivery Gate', query: 'Book a delivery slot at Gate #2 for tomorrow morning' },
];

export default function FloatingCopilotDrawer({ 
  user,
  onNavigateView,
  onSelectMandiTab,
  isOpenDefault = false 
}) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      timestamp: 'Just now',
      content: `Namaste ${user?.name ? user.name.split(' ')[0] : 'Kisan Member'}! I am your **AgriMart AI Copilot**.\n\nI provide instant intelligence for **APMC mandi rates**, **7-day price forecasts**, **crop disease leaf diagnosis**, and **soil-tailored crop recommendations**. Ask me anything or tap a fast action below!`,
      actions: [
        { label: '📈 Check Market Terminal', type: 'NAVIGATE_TERMINAL' },
        { label: '🔬 Scan Crop Disease', type: 'NAVIGATE_DISEASE' },
        { label: '🌱 Crop Recommendation', type: 'NAVIGATE_RECOMMENDATION' },
      ]
    }
  ]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Handle Action pill click inside chat bubbles
  const handleActionClick = (type, payload) => {
    if (type === 'NAVIGATE_TERMINAL' || type === 'COMPARE_MANDIS' || type === 'VIEW_DEPTH' || type === 'CHECK_FORECAST') {
      onSelectMandiTab?.('exchange');
      onNavigateView?.('terminal');
    } else if (type === 'NAVIGATE_DISEASE') {
      onNavigateView?.('disease');
    } else if (type === 'NAVIGATE_RECOMMENDATION') {
      onNavigateView?.('recommendation');
    } else if (type === 'BOOK_SLOT') {
      onSelectMandiTab?.('arrivals');
      onNavigateView?.('terminal');
    } else if (type === 'VIEW_TRANSACTIONS') {
      onNavigateView?.('transactions');
    }
  };

  // Dispatch and generate interactive response
  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputVal;
    if (!text || !text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    const lower = text.toLowerCase();

    setTimeout(() => {
      setIsLoading(false);

      // 1. CROP DISEASE DETECTION INTENT
      if (lower.includes('disease') || lower.includes('leaf') || lower.includes('blight') || lower.includes('rust') || lower.includes('infection') || lower.includes('cure') || lower.includes('diagnos')) {
        const sampleKey = lower.includes('corn') || lower.includes('maize') ? 'corn_rust'
          : lower.includes('rice') || lower.includes('paddy') ? 'healthy_rice'
          : lower.includes('cotton') ? 'cotton_leaf_curl'
          : lower.includes('potato') ? 'potato_late_blight'
          : 'tomato_early_blight';
        const disease = SAMPLE_DISEASES[sampleKey];

        const asstMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I analyzed plant health symptoms for **${disease.crop}**.\n\nPrimary diagnosis indicates **${disease.disease}** (${disease.confidence} confidence). Review the diagnostic protocol below or upload a photo in our Disease Scanner:`,
          card: {
            type: 'disease',
            data: {
              crop: disease.crop,
              diseaseName: disease.disease,
              confidence: disease.confidence,
              severity: disease.severity,
              symptoms: disease.symptoms,
              chemicalCure: disease.treatments[1] || disease.treatments[0],
              sampleImg: disease.imgUrl
            }
          },
          actions: [
            { label: '📷 Open Leaf Disease Clinic', type: 'NAVIGATE_DISEASE' },
            { label: '🌱 Check Soil Health', type: 'NAVIGATE_RECOMMENDATION' }
          ]
        };
        setMessages(prev => [...prev, asstMsg]);
        return;
      }

      // 2. CROP RECOMMENDATION INTENT
      if (lower.includes('recommend') || lower.includes('soil') || lower.includes('what to grow') || lower.includes('what crop') || lower.includes('npk') || lower.includes('plant')) {
        const soilKey = lower.includes('black') ? 'black' : lower.includes('red') ? 'red' : lower.includes('sandy') ? 'sandy' : 'alluvial';
        const preset = SOIL_PRESETS[soilKey];
        const recs = calculateCropRecommendation(preset.values);

        const asstMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Based on **${preset.name}** and current agro-climatic conditions, **${recs.topCrop.title}** is your #1 prime recommendation (${recs.topCrop.match} compatibility).\n\nExpected harvest yield is **${recs.topCrop.yield}**.`,
          card: {
            type: 'recommendation',
            data: {
              topCrop: recs.topCrop.title,
              topEmoji: recs.topCrop.emoji,
              match: recs.topCrop.match,
              soilType: preset.name.split('(')[0],
              expectedYield: recs.topCrop.yield,
              desc: recs.topCrop.desc,
              secondaryCrop: recs.secondCrop.title
            }
          },
          actions: [
            { label: '🧪 Open Soil & Climate Matrix', type: 'NAVIGATE_RECOMMENDATION' },
            { label: '📈 Check Market Price in Terminal', type: 'NAVIGATE_TERMINAL' }
          ]
        };
        setMessages(prev => [...prev, asstMsg]);
        return;
      }

      // 3. MANDI COMPARISON INTENT
      if (lower.includes('compare') || lower.includes('which mandi') || lower.includes('best mandi') || lower.includes('proceeds')) {
        const asstMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I evaluated regional APMC mandis for **100 Quintals of Wheat (Sharbati)**. **Ludhiana APMC** yields the highest net in-hand proceeds of **₹2,38,400** after freight, 1.5% APMC cess, and 0.5% escrow deductions.`,
          card: {
            type: 'comparison',
            data: {
              commodity: 'Wheat (Sharbati)',
              quantity: 100,
              recommendedMandi: 'Ludhiana APMC, Punjab',
              mandis: [
                { name: 'Ludhiana APMC, Punjab', quotedRate: 2450, distanceKm: 25, netProceeds: 238400, freight: 450, mandiCess: 3675 },
                { name: 'Karnal APMC, Haryana', quotedRate: 2380, distanceKm: 120, netProceeds: 228800, freight: 2160, mandiCess: 3570 },
                { name: 'Alwar APMC, Rajasthan', quotedRate: 2340, distanceKm: 280, netProceeds: 221200, freight: 5040, mandiCess: 3510 },
              ]
            }
          },
          actions: [
            { label: '📊 View in Market Terminal', type: 'NAVIGATE_TERMINAL' }
          ]
        };
        setMessages(prev => [...prev, asstMsg]);
        return;
      }

      // 4. 5-LEVEL DEPTH INTENT
      if (lower.includes('depth') || lower.includes('order book') || lower.includes('spread') || lower.includes('liquidity')) {
        const asstMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Electronic 5-level market depth for **Mustard (Sarson)** at **Alwar APMC**. The bid/ask spread is currently **₹30/Qtl (0.53%)** with strong buyer absorption.`,
          card: {
            type: 'liquidity',
            data: {
              commodity: 'Mustard (Sarson)',
              mandi: 'Alwar APMC, Rajasthan',
              bestBid: 5680,
              bestAsk: 5710,
              spread: 30,
              spreadPct: '0.53%',
              totalBidQty: 320,
              totalAskQty: 290,
              imbalance: 'Bid Dominant (+9.8%)',
            }
          },
          actions: [
            { label: '📊 Open Order Book Terminal', type: 'NAVIGATE_TERMINAL' }
          ]
        };
        setMessages(prev => [...prev, asstMsg]);
        return;
      }

      // 5. DELIVERY WEIGHBRIDGE SLOT BOOKING
      if (lower.includes('book') || lower.includes('slot') || lower.includes('gate') || lower.includes('weighbridge')) {
        const asstMsg = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `A delivery arrival window is available at **Ludhiana APMC Gate #2 (Electronic Scales)** for tomorrow morning. Review details below:`,
          card: {
            type: 'booking',
            data: {
              mandi: 'Ludhiana APMC, Punjab',
              gate: 'Gate No. 2 (Bulk Grain Scales)',
              date: 'Tomorrow Morning',
              timeSlot: '08:00 AM - 11:30 AM',
              commodity: 'Wheat (Sharbati)',
              quantity: 100,
              unit: 'Quintals',
              vehicleNo: 'PB-10-DT-4821',
              status: 'CONFIRMED_PASS',
            }
          },
          actions: [
            { label: '🚚 View Gate Arrivals & Inflow', type: 'NAVIGATE_TERMINAL' }
          ]
        };
        setMessages(prev => [...prev, asstMsg]);
        return;
      }

      // 6. DEFAULT MARKET SPOT PRICE & ADVISORY
      const asstMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Verified spot rate for **Wheat (Sharbati)** at **Ludhiana APMC** is **₹2,450/Qtl** (+2.4% today). Statutory AGMARKNET benchmark is **₹2,275/Qtl**.\n\nOur 7-day model projects **₹2,510/Qtl** (+₹60/Qtl gain). Advisory recommends a **Strategic Hold** if warehouse capacity is accessible.`,
        card: {
          type: 'price',
          data: {
            commodity: 'Wheat (Sharbati)',
            mandi: 'Ludhiana APMC, Punjab',
            currentPrice: 2450,
            prevPrice: 2390,
            change: '+2.4%',
            isUp: true,
            dayHigh: 2480,
            dayLow: 2410,
            agmarknetBenchmark: 2275,
          }
        },
        actions: [
          { label: '📈 Analyze in Market Terminal', type: 'NAVIGATE_TERMINAL' },
          { label: '🔬 Check Leaf Disease', type: 'NAVIGATE_DISEASE' }
        ]
      };
      setMessages(prev => [...prev, asstMsg]);

    }, 600);
  };

  return (
    <>
      {/* ALWAYS-AVAILABLE DOCKED FLOATING TRIGGER (RIGHT-SIDE DOCKED) */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#121212] text-white ring-4 ring-[#C26747]/30 scale-95'
            : 'bg-[#121212] hover:bg-[#252525] text-white hover:scale-105'
        }`}
        title="Open AgriMart AI Copilot">
        
        {/* Pulsing Orange Dot / Ring */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C26747] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C26747]" />
        </span>

        <Bot className="w-4 h-4 text-[#D4A373]" />
        <span className="text-xs font-heading font-extrabold tracking-tight">
          AgriMart AI Copilot
        </span>
      </button>

      {/* BACKDROP ON MOBILE */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 md:hidden"
        />
      )}

      {/* SLIDE-OUT DRAWER OVERLAY */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] bg-[#FBFBF9] border-l border-black/[0.08] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>

        {/* DRAWER HEADER */}
        <header className="h-16 px-5 border-b border-black/[0.06] bg-[#121212] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4A373] border border-white/15">
              <Sparkles className="w-5 h-5 text-[#C26747]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold font-heading text-white">
                  AgriMart AI Copilot
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] font-mono text-white/60">
                Online &bull; Market, Pathology &amp; Soil Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close Assistant Drawer">
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* FAST ACTION SHORTCUTS CHIPS */}
        <div className="px-4 py-2.5 border-b border-black/[0.05] bg-[#F5F4F0] overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono uppercase font-bold text-[#787774] shrink-0">
            Fast Actions:
          </span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#121212] hover:text-white text-[#121212] text-[11px] font-heading font-bold border border-black/[0.06] shrink-0 transition-all cursor-pointer shadow-xs">
              {p.label}
            </button>
          ))}
        </div>

        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((m) => (
            <MessageBubble 
              key={m.id} 
              message={m} 
              onAction={(type, payload) => handleActionClick(type, payload)} 
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-black/[0.06] max-w-xs text-xs font-mono text-[#787774] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#C26747] animate-ping" />
              <span>Evaluating APMC telemetry &amp; agronomic models...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 border-t border-black/[0.06] bg-white flex items-center gap-2 shrink-0">
          
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about mandi prices, leaf disease, soil..."
            disabled={isLoading}
            className="flex-1 bg-[#F5F4F0] text-[#121212] placeholder:text-[#8E8E8E] text-xs px-4 py-3 rounded-2xl border border-black/[0.06] focus:outline-none focus:border-[#C26747]"
          />

          <button
            type="button"
            onClick={() => {
              onNavigateView?.('disease');
              setIsOpen(false);
            }}
            title="Open Camera / Leaf Scan"
            className="p-2.5 text-[#787774] hover:text-[#C26747] hover:bg-[#F5F4F0] rounded-xl border border-black/[0.05] transition-all cursor-pointer">
            <Leaf className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="p-3 bg-[#121212] hover:bg-[#252525] text-white rounded-2xl transition-all cursor-pointer disabled:opacity-40">
            <Send className="w-4 h-4 text-[#D4A373]" />
          </button>
        </form>

      </div>
    </>
  );
}

