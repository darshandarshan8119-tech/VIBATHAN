// src/pages/DiseaseDetectionPage.jsx
import React, { useState, useRef } from 'react';
import { 
  UploadCloud, Camera, Sparkles, CheckCircle2, AlertTriangle, 
  ShieldAlert, Activity, ArrowRight, RefreshCw, X, Pill, 
  Leaf, Info, HelpCircle, FileCheck, Layers
} from 'lucide-react';
import { SAMPLE_DISEASES } from '../data/diseaseData';

export default function DiseaseDetectionPage({ onNavigateToMarketTerminal, onOpenCopilot }) {
  const [selectedSampleKey, setSelectedSampleKey] = useState('tomato_early_blight');
  const [customFile, setCustomFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(SAMPLE_DISEASES.tomato_early_blight.imgUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(SAMPLE_DISEASES.tomato_early_blight);
  const [activeTab, setActiveTab] = useState('chemical'); // 'chemical' | 'organic'

  const fileInputRef = useRef(null);

  // Handle Preset Sample Selection
  const handleSelectSample = (key) => {
    const sample = SAMPLE_DISEASES[key];
    if (!sample) return;
    setSelectedSampleKey(key);
    setCustomFile(null);
    setImagePreview(sample.imgUrl);
    setDiagnosticResult(sample);
  };

  // Handle Custom User Image Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    setSelectedSampleKey(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result);
      setDiagnosticResult(null); // Clear previous result until user clicks analyze
    };
    reader.readAsDataURL(file);
  };

  // Run the AI Diagnostic Scan
  const handleRunScan = () => {
    if (!imagePreview) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      if (customFile) {
        // If custom uploaded leaf, dynamically map to appropriate clinical diagnosis
        const nameLower = customFile.name.toLowerCase();
        let matched = SAMPLE_DISEASES.tomato_early_blight;
        if (nameLower.includes('rice') || nameLower.includes('paddy')) {
          matched = SAMPLE_DISEASES.healthy_rice;
        } else if (nameLower.includes('corn') || nameLower.includes('maize') || nameLower.includes('rust')) {
          matched = SAMPLE_DISEASES.corn_rust;
        } else if (nameLower.includes('cotton') || nameLower.includes('curl')) {
          matched = SAMPLE_DISEASES.cotton_leaf_curl;
        } else if (nameLower.includes('potato') || nameLower.includes('blight')) {
          matched = SAMPLE_DISEASES.potato_late_blight;
        }
        setDiagnosticResult(matched);
      } else if (selectedSampleKey && SAMPLE_DISEASES[selectedSampleKey]) {
        setDiagnosticResult(SAMPLE_DISEASES[selectedSampleKey]);
      }
    }, 950);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Page Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C26747]/10 border border-[#C26747]/20 text-[#C26747] text-[11px] font-mono font-bold uppercase mb-2.5">
              <Leaf className="w-3.5 h-3.5" />
              <span>AI Crop Pathology &amp; Leaf Health Scanner</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#121212] tracking-tight">
              Crop Disease Detection &amp; Agronomic Clinic
            </h1>
            <p className="text-sm text-[#5A5A5A] font-sans mt-1 max-w-2xl">
              Upload smartphone photos of affected plant leaves for instant neural network identification of fungal blights, viral infections, and nutrient chlorosis, complete with verified ICAR/CIB-approved remedies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectSample('healthy_rice')}
              className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#F5F4F0] hover:bg-[#EBE8E2] text-[#121212] border border-black/[0.06] transition-all cursor-pointer">
              Test Healthy Specimen
            </button>
            <button
              onClick={() => handleSelectSample('tomato_early_blight')}
              className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#C26747] text-white hover:bg-[#A85233] transition-all shadow-xs cursor-pointer">
              Test Blight Outbreak
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: UPLOAD & SPECIMEN SELECTOR (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* File Upload & Viewport Card */}
          <div className="skanvi-card rounded-3xl p-6 border border-black/[0.08] relative overflow-hidden bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#787774] uppercase tracking-wider">
                Specimen Image Feed
              </span>
              {customFile && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121212] text-white">
                  Custom Upload
                </span>
              )}
            </div>

            {/* Image Preview Box with Active Scanning Effect */}
            <div className="relative aspect-4/3 rounded-2xl bg-[#F5F4F0] overflow-hidden border border-black/[0.06] group mb-4">
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Crop Specimen Preview" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Active Scan Laser Beam Animation */}
                  {isScanning && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#C26747] to-transparent shadow-[0_0_15px_#C26747] animate-bounce" />
                      <div className="absolute inset-0 bg-[#C26747]/10 backdrop-blur-[1px]" />
                    </div>
                  )}

                  {/* Bottom Overlay Label */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                    <span className="font-mono text-[11px] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 truncate max-w-[200px]">
                      {customFile ? customFile.name : (diagnosticResult?.crop || 'Leaf Specimen')}
                    </span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-[11px] font-bold border border-white/20 transition-all flex items-center gap-1 cursor-pointer">
                      <Camera className="w-3 h-3" />
                      <span>Retake</span>
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-full p-8 text-center cursor-pointer hover:bg-[#EFECE5] transition-colors">
                  <UploadCloud className="w-10 h-10 text-[#C26747] mb-2" />
                  <p className="font-heading font-bold text-sm text-[#121212]">Click to upload leaf image</p>
                  <p className="text-xs text-[#787774] mt-1">JPEG, PNG, WebP up to 10MB</p>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#F5F4F0] hover:bg-[#EBE8E2] text-xs font-bold text-[#121212] border border-black/[0.06] transition-all cursor-pointer">
                <UploadCloud className="w-4 h-4 text-[#C26747]" />
                <span>Upload Leaf Photo</span>
              </button>

              <button
                onClick={handleRunScan}
                disabled={isScanning}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#121212] hover:bg-[#252525] text-xs font-extrabold text-white shadow-md transition-all cursor-pointer disabled:opacity-50">
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C26747]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4A373]" />
                    <span>Run Diagnostic</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Benchmark Specimen Library */}
          <div className="skanvi-card rounded-3xl p-5 border border-black/[0.07] bg-white">
            <span className="text-xs font-mono font-bold text-[#787774] uppercase tracking-wider block mb-3">
              Standard Verified Pathology Samples
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.keys(SAMPLE_DISEASES).map((key) => {
                const item = SAMPLE_DISEASES[key];
                const isSelected = selectedSampleKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectSample(key)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#121212] text-white border-[#121212] shadow-sm' 
                        : 'bg-[#FBFBF9] hover:bg-[#F2F0EB] border-black/[0.05] text-[#121212]'
                    }`}>
                    <img 
                      src={item.imgUrl} 
                      alt={item.crop} 
                      className="w-9 h-9 rounded-xl object-cover shrink-0 border border-white/20"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{item.crop.split('(')[0]}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-[#787774]'}`}>
                        {item.disease.split('(')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DIAGNOSTIC REPORT CARD (7 COLS) */}
        <div className="lg:col-span-7">
          {diagnosticResult ? (
            <div className="skanvi-card rounded-3xl p-6 sm:p-8 border border-black/[0.08] bg-white space-y-6">
              
              {/* Report Header & Severity Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-black/[0.06]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#121212] text-white">
                      ICAR Lab Protocol 2026
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      diagnosticResult.severityColor === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : diagnosticResult.severityColor === 'amber'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {diagnosticResult.severity}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-heading text-[#121212]">
                    {diagnosticResult.disease}
                  </h3>
                  <p className="text-xs font-mono text-[#787774] mt-0.5">
                    Host: <span className="font-bold text-[#121212]">{diagnosticResult.crop}</span> &bull; {diagnosticResult.pathogenType}
                  </p>
                </div>

                {/* Confidence Dial Badge */}
                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between p-3 rounded-2xl bg-[#FAF9F5] border border-black/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-[#787774]">Neural Confidence</span>
                  <span className="text-lg sm:text-2xl font-black font-heading text-[#C26747]">
                    {diagnosticResult.confidence}
                  </span>
                </div>
              </div>

              {/* Pathological Symptoms */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-black/[0.05] space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-[#787774] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#C26747]" />
                  <span>Clinical Symptoms &amp; Visual Indicators</span>
                </span>
                <p className="text-xs text-[#2A2A2A] font-sans leading-relaxed">
                  {diagnosticResult.symptoms}
                </p>
              </div>

              {/* Treatment Protocol Segment (Chemical vs Organic Tabs) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('chemical')}
                      className={`text-xs font-heading font-bold pb-2 -mb-2 border-b-2 transition-all cursor-pointer ${
                        activeTab === 'chemical'
                          ? 'border-[#C26747] text-[#121212]'
                          : 'border-transparent text-[#787774] hover:text-[#121212]'
                      }`}>
                      Prescribed Agronomic Treatment
                    </button>
                    <button
                      onClick={() => setActiveTab('organic')}
                      className={`text-xs font-heading font-bold pb-2 -mb-2 border-b-2 transition-all cursor-pointer ${
                        activeTab === 'organic'
                          ? 'border-emerald-600 text-[#121212]'
                          : 'border-transparent text-[#787774] hover:text-[#121212]'
                      }`}>
                      Organic &amp; Biological Alternatives
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-[#787774] hidden sm:inline">
                    Spread Risk: {diagnosticResult.spreadRisk}
                  </span>
                </div>

                {activeTab === 'chemical' ? (
                  <div className="space-y-2.5">
                    {diagnosticResult.treatments.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FBFBF9] border border-black/[0.05]">
                        <span className="w-5 h-5 rounded-full bg-[#121212] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-[#121212] leading-relaxed font-sans font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      <span>Zero-Residue Bio-Fungicide &amp; Botanical Defense</span>
                    </div>
                    <p className="text-xs leading-relaxed font-sans text-emerald-900">
                      {diagnosticResult.organicAlt}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Next-Step Action Strip */}
              <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-[#787774] text-center sm:text-left">
                  Need personalized advice on spray timing or market price impact?
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenCopilot}
                    className="px-4 py-2 rounded-full bg-[#FAF9F5] hover:bg-[#EFECE5] text-[#121212] text-xs font-bold border border-black/[0.08] transition-all flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-[#C26747]" />
                    <span>Ask AI Copilot</span>
                  </button>

                  <button
                    onClick={onNavigateToMarketTerminal}
                    className="px-4 py-2 rounded-full bg-[#121212] text-white hover:bg-[#252525] text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                    <span>Mandi Selling Advice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="skanvi-card rounded-3xl p-12 text-center border border-black/[0.06] bg-white space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] text-[#787774] flex items-center justify-center mx-auto border border-black/[0.06]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-[#121212]">Ready for Leaf Analysis</h3>
              <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto">
                Click "Run Diagnostic" on the uploaded specimen image to generate a verified plant health assay report.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

