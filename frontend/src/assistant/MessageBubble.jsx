// src/assistant/MessageBubble.jsx
import React from 'react';
import { User, Sparkles, Bot, ArrowUpRight, Check, Copy } from 'lucide-react';
import CommodityPriceCard from './cards/CommodityPriceCard';
import MandiComparisonCard from './cards/MandiComparisonCard';
import LiquidityCard from './cards/LiquidityCard';
import ProfitabilityCard from './cards/ProfitabilityCard';
import ForecastCard from './cards/ForecastCard';
import BuyerCard from './cards/BuyerCard';
import BookingCard from './cards/BookingCard';
import TransactionCard from './cards/TransactionCard';
import DiseaseScanCard from './cards/DiseaseScanCard';
import CropRecommendationCard from './cards/CropRecommendationCard';

export default function MessageBubble({ message, onAction }) {
  const isUser = message.role === 'user';

  // Render Card Based on Card Type
  const renderCard = (card) => {
    if (!card) return null;
    switch (card.type) {
      case 'price':
        return <CommodityPriceCard key={card.data?.commodity || Math.random()} data={card.data} onAction={onAction} />;
      case 'comparison':
        return <MandiComparisonCard key={card.data?.commodity || Math.random()} data={card.data} onAction={onAction} />;
      case 'liquidity':
        return <LiquidityCard key={card.data?.commodity || Math.random()} data={card.data} onAction={onAction} />;
      case 'profitability':
        return <ProfitabilityCard key={card.data?.commodity || Math.random()} data={card.data} onAction={onAction} />;
      case 'forecast':
        return <ForecastCard key={card.data?.commodity || Math.random()} data={card.data} onAction={onAction} />;
      case 'buyer':
        return <BuyerCard key={card.data?.commodity || Math.random()} data={card.data} onAction={onAction} />;
      case 'booking':
        return <BookingCard key={card.data?.bookingId || Math.random()} data={card.data} onAction={onAction} />;
      case 'transaction':
        return <TransactionCard key={card.data?.orderId || Math.random()} data={card.data} onAction={onAction} />;
      case 'disease':
        return <DiseaseScanCard key={card.data?.diseaseName || Math.random()} data={card.data} onAction={onAction} />;
      case 'recommendation':
        return <CropRecommendationCard key={card.data?.topCrop || Math.random()} data={card.data} onAction={onAction} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-3 sm:gap-4 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
          <Sparkles className="w-4 h-4 text-[#C26747]" />
        </div>
      )}

      {/* Message Body */}
      <div className={`max-w-[90%] sm:max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Author Label & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 font-mono">
          <span className="font-bold text-slate-600">
            {isUser ? 'You' : 'AgriMart Assistant'}
          </span>
          <span>&bull;</span>
          <span>{message.timestamp || 'Just now'}</span>
        </div>

        {/* Text Bubble */}
        <div className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
          isUser 
            ? 'bg-[#121212] text-white rounded-tr-xs' 
            : 'bg-white text-slate-800 border border-black/[0.08] rounded-tl-xs'
        }`}>
          <div className="whitespace-pre-wrap font-sans space-y-2">
            {message.content}
          </div>

          {/* Interactive Response Cards */}
          {message.cards && message.cards.length > 0 && (
            <div className="mt-4 pt-3 border-t border-black/[0.06] space-y-3">
              {message.cards.map(renderCard)}
            </div>
          )}

          {message.card && (
            <div className="mt-3">
              {renderCard(message.card)}
            </div>
          )}

          {/* Navigation Action Buttons if any */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-black/[0.06] flex flex-wrap gap-2">
              {message.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => onAction && onAction(act.type, act.payload)}
                  className="px-3.5 py-1.5 rounded-full bg-[#F5F4F0] hover:bg-[#121212] hover:text-white text-slate-800 font-bold text-xs font-heading border border-black/[0.08] transition-all flex items-center gap-1.5 cursor-pointer">
                  <span>{act.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#C26747] text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
