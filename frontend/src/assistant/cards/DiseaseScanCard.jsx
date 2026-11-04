// src/assistant/cards/DiseaseScanCard.jsx
import React from 'react';
import { Leaf, ShieldAlert, CheckCircle2, ArrowRight, Activity } from 'lucide-react';

export default function DiseaseScanCard({ data = {}, onAction }) {
  if (!data) return null;

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm space-y-3 my-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          Plant Pathology Assay
        </span>
        <span className="text-[10px] font-mono font-bold text-[#C26747]">
          Confidence: {data.confidence || '96.8%'}
        </span>
      </div>

      <div className="flex items-start gap-3">
        {data.sampleImg && (
          <img 
            src={data.sampleImg} 
            alt={data.diseaseName || 'Crop Leaf'} 
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-black/[0.08]"
          />
        )}
        <div>
          <span className="text-[11px] font-mono text-[#787774] block">{data.crop || 'Crop Leaf'}</span>
          <h4 className="text-sm font-extrabold font-heading text-[#121212]">
            {data.diseaseName || 'Early Blight'}
          </h4>
          <span className="text-[10px] font-mono text-rose-700 font-bold block mt-0.5">
            Severity: {data.severity || 'Moderate Infection'}
          </span>
        </div>
      </div>

      {data.symptoms && (
        <p className="text-xs text-[#5A5A5A] line-clamp-2 leading-relaxed">
          {data.symptoms}
        </p>
      )}

      {data.chemicalCure && (
        <div className="p-2.5 rounded-xl bg-[#FBFBF9] border border-black/[0.05] text-[11px] space-y-1">
          <strong className="text-[#121212] block">Recommended Agronomic Treatment:</strong>
          <span className="text-[#5A5A5A]">{data.chemicalCure}</span>
        </div>
      )}

      <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between">
        <button
          onClick={() => onAction?.({ type: 'NAVIGATE_DISEASE' })}
          className="text-xs font-bold text-[#C26747] hover:underline flex items-center gap-1 cursor-pointer">
          <span>Open Full Disease Clinic</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

