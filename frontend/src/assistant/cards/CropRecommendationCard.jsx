// src/assistant/cards/CropRecommendationCard.jsx
import React from 'react';
import { Sprout, ArrowRight, Award } from 'lucide-react';

export default function CropRecommendationCard({ data = {}, onAction }) {
  if (!data) return null;

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm space-y-3 my-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Soil &amp; Climate Matrix Match
        </span>
        <span className="text-[10px] font-mono font-bold text-emerald-700">
          {data.match || '98.4% Match'}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0 p-2 rounded-xl bg-[#FAF9F5] border border-black/[0.05]">
          {data.topEmoji || '🌾'}
        </span>
        <div>
          <span className="text-[10px] font-mono text-[#787774] block uppercase">
            #1 Prime Crop Recommendation
          </span>
          <h4 className="text-sm font-extrabold font-heading text-[#121212]">
            {data.topCrop || 'Basmati Paddy / Rice'}
          </h4>
          <span className="text-[11px] font-mono text-[#5A5A5A] block mt-0.5">
            {data.soilType || 'Alluvial Soil'} &bull; Yield: {data.expectedYield || '4.8 - 5.5 T/Acre'}
          </span>
        </div>
      </div>

      {data.desc && (
        <p className="text-xs text-[#5A5A5A] line-clamp-2 leading-relaxed">
          {data.desc}
        </p>
      )}

      {data.secondaryCrop && (
        <div className="text-[11px] font-mono text-[#787774] flex items-center justify-between pt-1">
          <span>Secondary Rotation:</span>
          <strong className="text-[#121212]">{data.secondaryCrop}</strong>
        </div>
      )}

      <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
        <button
          onClick={() => onAction?.({ type: 'NAVIGATE_RECOMMENDATION' })}
          className="text-xs font-bold text-[#C26747] hover:underline flex items-center gap-1 cursor-pointer">
          <span>Open Soil &amp; Climate Matrix</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

