// src/assistant/ChatWindow.jsx
import React, { useRef, useEffect } from 'react';
import { Menu, Sparkles, RefreshCw, Trash2, ArrowUpRight, Scale, ShieldCheck } from 'lucide-react';
import MessageBubble from './MessageBubble';
import AgentActivity from './AgentActivity';
import ChatInput from './ChatInput';

export default function ChatWindow({
  messages = [],
  onSendMessage,
  isLoading = false,
  agentActivity = null, // { currentAction, toolName, steps }
  conversationTitle = 'Market Intelligence Chat',
  onClearMessages,
  onOpenSidebar,
  onAction, // Navigation or interactive card actions
  language,
  onLanguageChange,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentActivity, isLoading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FBFBF9] relative overflow-hidden">
      
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-8 border-b border-black/[0.06] bg-[#FBFBF9]/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-black/[0.04]">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 truncate">
                {conversationTitle}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 truncate">
              Autonomous Market Copilot &bull; AGMARKNET &bull; e-NAM Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClearMessages && messages.length > 0 && (
            <button
              onClick={onClearMessages}
              title="Clear Thread"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-black/[0.04] rounded-full transition-colors text-xs flex items-center gap-1 font-heading cursor-pointer">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Welcome Intro if no messages */}
          {messages.length === 0 && (
            <div className="py-12 sm:py-20 text-center max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-3xl bg-[#121212] text-white flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="w-7 h-7 text-[#C26747]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                  How can AgriMart assist your harvest today?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
                  I can analyze current APMC mandi prices, compare net profitability across regional yards, display 5-level market depth, identify verified institutional buyers, and book priority weighbridge slots.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-[#FAF9F5] border border-black/[0.06] text-slate-600 font-medium">
                  🌾 APMC Wheat, Mustard, Paddy, Cotton
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FAF9F5] border border-black/[0.06] text-slate-600 font-medium">
                  ⚖️ Transparent Assay Deductions
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FAF9F5] border border-black/[0.06] text-slate-600 font-medium">
                  🔒 Guaranteed Axis Escrow
                </span>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <MessageBubble 
              key={msg.id || index} 
              message={msg} 
              onAction={onAction}
            />
          ))}

          {/* Dynamic Tool & Execution Activity */}
          {isLoading && agentActivity && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Sparkles className="w-4 h-4 text-[#C26747]" />
              </div>
              <div className="max-w-[90%] sm:max-w-2xl">
                <AgentActivity 
                  currentAction={agentActivity.currentAction}
                  toolName={agentActivity.toolName}
                  steps={agentActivity.steps}
                />
              </div>
            </div>
          )}

          {isLoading && !agentActivity && (
            <div className="flex gap-3 sm:gap-4 justify-start my-4">
              <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Sparkles className="w-4 h-4 text-[#C26747]" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-black/[0.08] text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C26747] animate-ping"></span>
                <span>Consulting market intelligence models &amp; order depth...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Sticky Input */}
      <footer className="p-4 sm:p-6 bg-gradient-to-t from-[#FBFBF9] via-[#FBFBF9] to-transparent shrink-0">
        <ChatInput 
          onSendMessage={onSendMessage}
          disabled={isLoading}
          language={language}
          onLanguageChange={onLanguageChange}
        />
      </footer>

    </div>
  );
}
