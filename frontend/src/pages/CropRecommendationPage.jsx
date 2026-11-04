// src/pages/CropRecommendationPage.jsx
import React, { useState } from 'react';
import { 
  Sprout, Droplets, Thermometer, Wind, Sparkles, ArrowRight, 
  Layers, CheckCircle2, TrendingUp, Compass, Calendar, Award,
  ChevronRight, RefreshCw, BarChart2
} from 'lucide-react';
import { SOIL_PRESETS, calculateCropRecommendation } from '../data/cropRecommendationData';

export default function CropRecommendationPage({ onNavigateToMarketTerminal, onOpenCopilot }) {
  const [activePreset, setActivePreset] = useState('alluvial');
  const [inputs, setInputs] = useState(SOIL_PRESETS.alluvial.values);
  const [isCalculating, setIsCalculating] = useState(false);
  const [recommendations, setRecommendations] = useState(() => 
    calculateCropRecommendation(SOIL_PRESETS.alluvial.values)
  );

  // Field update handler
  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) }));
    setActivePreset(null); // Custom input mode
  };

  // Preset selector
  const handleSelectPreset = (presetKey) => {
    const preset = SOIL_PRESETS[presetKey];
    if (!preset) return;
    setActivePreset(presetKey);
    setInputs(preset.values);
    setRecommendations(calculateCropRecommendation(preset.values));
  };

  // Re-run recommendation computation
  const handleCompute = (e) => {
    e?.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setRecommendations(calculateCropRecommendation(inputs));
    }, 600);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#283618]/10 border border-[#283618]/20 text-[#283618] text-[11px] font-mono font-bold uppercase mb-2.5">
              <Sprout className="w-3.5 h-3.5" />
              <span>Agronomic Intelligence &bull; Soil &amp; Climate Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#121212] tracking-tight">
              AI Soil Chemistry &amp; Crop Recommendation
            </h1>
            <p className="text-sm text-[#5A5A5A] font-sans mt-1 max-w-2xl">
              Calibrated machine learning matching evaluating laboratory soil macronutrients (N-P-K), pH, and regional climatic precipitation vectors to determine the highest yielding and most commercially viable cash crops.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectPreset('alluvial')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                activePreset === 'alluvial'
                  ? 'bg-[#121212] text-white border-[#121212]'
                  : 'bg-[#F5F4F0] text-[#121212] border-black/[0.06] hover:bg-[#EBE8E2]'
              }`}>
              Alluvial Soil
            </button>
            <button
              onClick={() => handleSelectPreset('black')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                activePreset === 'black'
                  ? 'bg-[#121212] text-white border-[#121212]'
                  : 'bg-[#F5F4F0] text-[#121212] border-black/[0.06] hover:bg-[#EBE8E2]'
              }`}>
              Black Regur
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SOIL & CLIMATE INPUT PARAMETERS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="skanvi-card rounded-3xl p-6 border border-black/[0.08] bg-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="text-xs font-mono font-bold text-[#787774] uppercase tracking-wider">
                Laboratory Soil &amp; Climate Assay
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Calibrated Matrix
              </span>
            </div>

            {/* Quick Presets Strip */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-[#787774] uppercase">
                Select Agro-Climatic Soil Zone:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(SOIL_PRESETS).map((key) => {
                  const p = SOIL_PRESETS[key];
                  const isSelected = activePreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#121212] text-white border-[#121212] shadow-xs'
                          : 'bg-[#FBFBF9] hover:bg-[#F2F0EB] text-[#121212] border-black/[0.06]'
                      }`}>
                      <p className="text-xs font-bold truncate leading-tight">{p.name.split('(')[0]}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-[#787774]'}`}>
                        {key === 'alluvial' ? 'Rice / Wheat' : key === 'black' ? 'Cotton / Soya' : key === 'red' ? 'Maize / Gram' : 'Mustard / Arid'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleCompute} className="space-y-4 pt-2">
              
              {/* NPK Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1">
                    Nitrogen (N)
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={inputs.N}
                      onChange={(e) => handleInputChange('N', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">mg/kg</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1">
                    Phosphorus (P)
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={inputs.P}
                      onChange={(e) => handleInputChange('P', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">mg/kg</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1">
                    Potassium (K)
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={inputs.K}
                      onChange={(e) => handleInputChange('K', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">mg/kg</span>
                  </div>
                </div>
              </div>

              {/* pH & Rainfall */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1">
                    Soil pH Level
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      step="0.1"
                      value={inputs.ph}
                      onChange={(e) => handleInputChange('ph', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">{inputs.ph > 7.2 ? 'Alkaline' : inputs.ph < 6.0 ? 'Acidic' : 'Neutral'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-sky-600" />
                    <span>Annual Rainfall</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={inputs.rainfall}
                      onChange={(e) => handleInputChange('rainfall', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">mm</span>
                  </div>
                </div>
              </div>

              {/* Temperature & Humidity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#C26747]" />
                    <span>Temperature</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      step="0.5"
                      value={inputs.temp}
                      onChange={(e) => handleInputChange('temp', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">°C</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.06]">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#787774] block mb-1 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-emerald-600" />
                    <span>Relative Humidity</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number"
                      value={inputs.humidity}
                      onChange={(e) => handleInputChange('humidity', e.target.value)}
                      className="w-full text-base font-extrabold font-heading text-[#121212] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#8E8E8E]">%</span>
                  </div>
                </div>
              </div>

              {/* Compute Button */}
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#121212] hover:bg-[#252525] text-white text-xs font-extrabold font-heading shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C26747]" />
                    <span>Evaluating Crop Matrix...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4A373]" />
                    <span>Compute Agronomic Recommendations</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: RECOMMENDED CROP SHOWCASE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {recommendations && (
            <>
              {/* #1 PRIME RECOMMENDATION HERO CARD */}
              <div className="skanvi-card rounded-3xl p-6 sm:p-8 border-2 border-[#C26747]/30 bg-gradient-to-br from-white via-white to-[#FAF6F0] relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 bg-[#C26747] text-white text-[10px] font-mono font-black uppercase px-4 py-1 rounded-bl-2xl">
                  #1 Prime Agro-Match
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#C26747]/10 border border-[#C26747]/20 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                    {recommendations.topCrop.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-[#C26747]">
                        {recommendations.topCrop.category}
                      </span>
                      <span>&bull;</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {recommendations.topCrop.match} Compatibility
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black font-heading text-[#121212]">
                      {recommendations.topCrop.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed mb-6 font-sans">
                  {recommendations.topCrop.desc}
                </p>

                {/* Metrics 3-Col Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FBFBF9] border border-black/[0.06] mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#787774] block">Expected Yield</span>
                    <strong className="text-xs sm:text-sm font-black font-heading text-[#121212]">
                      {recommendations.topCrop.yield}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#787774] block">Growth Period</span>
                    <strong className="text-xs sm:text-sm font-black font-heading text-[#121212]">
                      {recommendations.topCrop.growthPeriod}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#787774] block">Market APMC Rate</span>
                    <strong className="text-xs sm:text-sm font-black font-heading text-[#C26747]">
                      {recommendations.topCrop.mandiRefPrice}
                    </strong>
                  </div>
                </div>

                {/* Agronomic Cultivation Tips */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-6 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-950 font-sans">
                    <strong>Agronomic Tip:</strong> {recommendations.topCrop.agronomicTips}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-black/[0.06]">
                  <span className="text-[11px] font-mono text-[#787774]">
                    Ready to evaluate buyer demand &amp; spot rates?
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenCopilot}
                      className="px-4 py-2 rounded-full bg-[#FAF9F5] hover:bg-[#EFECE5] text-[#121212] text-xs font-bold border border-black/[0.08] transition-all flex items-center gap-1.5 cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5 text-[#C26747]" />
                      <span>Ask Copilot</span>
                    </button>

                    <button
                      onClick={onNavigateToMarketTerminal}
                      className="px-4 py-2 rounded-full bg-[#121212] text-white hover:bg-[#252525] text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Check Mandi Depth</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* #2 & #3 SECONDARY ALTERNATIVES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Secondary Option */}
                <div className="skanvi-card rounded-3xl p-5 border border-black/[0.07] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#787774]">
                      #2 Secondary Alternative
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {recommendations.secondCrop.match}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{recommendations.secondCrop.emoji}</span>
                    <div>
                      <h4 className="text-sm font-bold font-heading text-[#121212]">
                        {recommendations.secondCrop.title}
                      </h4>
                      <p className="text-[11px] text-[#787774] font-mono">{recommendations.secondCrop.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A5A5A] line-clamp-3 leading-relaxed">
                    {recommendations.secondCrop.desc}
                  </p>

                  <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-[#787774]">Est. Yield:</span>
                    <strong className="font-heading text-[#121212]">{recommendations.secondCrop.yield}</strong>
                  </div>
                </div>

                {/* Tertiary Option */}
                <div className="skanvi-card rounded-3xl p-5 border border-black/[0.07] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#787774]">
                      #3 Soil Rejuvenation / Legume
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {recommendations.thirdCrop.match}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{recommendations.thirdCrop.emoji}</span>
                    <div>
                      <h4 className="text-sm font-bold font-heading text-[#121212]">
                        {recommendations.thirdCrop.title}
                      </h4>
                      <p className="text-[11px] text-[#787774] font-mono">{recommendations.thirdCrop.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A5A5A] line-clamp-3 leading-relaxed">
                    {recommendations.thirdCrop.desc}
                  </p>

                  <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-[#787774]">Est. Yield:</span>
                    <strong className="font-heading text-[#121212]">{recommendations.thirdCrop.yield}</strong>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

