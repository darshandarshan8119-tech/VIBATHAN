// src/assistant/ConversationSidebar.jsx
import React from 'react';
import { 
  Plus, MessageSquare, Trash2, Scale, FileText, User, 
  LogOut, Sparkles, ChevronRight, X, LayoutDashboard 
} from 'lucide-react';

export default function ConversationSidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  activeView, // 'assistant' | 'terminal' | 'transactions' | 'profile'
  onSelectView,
  user,
  onLogout,
  isOpen,
  onClose
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#FAF9F5] border-r border-black/[0.08] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top Section: Brand & New Chat */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          
          {/* Header Brandmark */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#121212] font-heading flex items-center gap-1.5">
                <span>Agri<span className="text-[#C26747]">mart</span></span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#C26747]/10 text-[#C26747] border border-[#C26747]/20">
                  Agentic AI
                </span>
              </span>
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                Autonomous Market Copilot
              </span>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/[0.04]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewConversation();
              if (onSelectView) onSelectView('assistant');
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#121212] hover:bg-[#C26747] text-white text-xs font-bold font-heading shadow-xs transition-all active:scale-[0.98] cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Middle Section: Conversation History (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 space-y-1">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-bold px-3 py-1">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-400 font-sans">
              No previous threads. Ask a question to begin.
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConversationId && activeView === 'assistant';
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectConversation(c.id);
                    if (onSelectView) onSelectView('assistant');
                    if (onClose) onClose();
                  }}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-black/[0.06]'
                      : 'text-slate-600 hover:bg-black/[0.03] hover:text-slate-900'
                  }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C26747]' : 'text-slate-400'}`} />
                    <span className="truncate">{c.title || 'Market Inquiry'}</span>
                  </div>

                  {onDeleteConversation && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      title="Delete thread"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Section: Primary Modules & User Session */}
        <div className="p-3 sm:p-4 border-t border-black/[0.08] space-y-3 bg-white/60">
          {/* Main Navigation Modules */}
          <div className="space-y-1 text-xs font-heading font-bold">
            <button
              onClick={() => { onSelectView('assistant'); if (onClose) onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeView === 'assistant' 
                  ? 'bg-[#121212] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-black/[0.04]'
              }`}>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#C26747]" />
                <span>AI Assistant</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { onSelectView('terminal'); if (onClose) onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeView === 'terminal' 
                  ? 'bg-[#121212] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-black/[0.04]'
              }`}>
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-[#10B981]" />
                <span>Market Terminal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { onSelectView('transactions'); if (onClose) onClose(); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                activeView === 'transactions' 
                  ? 'bg-[#121212] text-white shadow-xs' 
                  : 'text-slate-700 hover:bg-black/[0.04]'
              }`}>
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>My Transactions</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <h5 className="font-heading font-bold text-xs text-slate-900 truncate">
                  {user?.name || user?.full_name || 'Kisan Member'}
                </h5>
                <span className="text-[10px] text-slate-400 font-mono capitalize">
                  {user?.role || 'Farmer'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
