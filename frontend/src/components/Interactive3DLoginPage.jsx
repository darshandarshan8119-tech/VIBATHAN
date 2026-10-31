// src/components/Interactive3DLoginPage.jsx
import React, { useState, useRef } from 'react';
import { 
  Tractor, Scale, ShieldCheck, Lock, ArrowRight, 
  X, Check, Smartphone, Key, Sparkles, Building2, 
  ShoppingBag, TrendingUp, TrendingDown, Tag, Truck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Interactive3DLoginPage({ isOpen, onClose, onLoginSuccess }) {
  const [role, setRole] = useState('farmer'); // 'farmer' | 'merchant'
  const [method, setMethod] = useState('otp'); // 'otp' | 'password'
  
  // Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 3D Parallax Tilt Physics on Login Card
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('perspective(1200px) rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // Max 6deg
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransformStyle(`perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`);
    setGlarePosition({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setOtp('5824'); // Demo autofill
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setIsLoading(false);
      onLoginSuccess({
        name: role === 'farmer' ? 'Harpreet Singh (Punjab Estate)' : 'ITC Agri Procurement',
        role: role,
        targetMode: role === 'farmer' ? 'store' : 'mandi',
        phone: phone || '+91 98765 43210'
      });
      onClose();
    }, 600);
  };

  // 1-Click Fast Demo Login
  const handleQuickDemoLogin = (demoRole) => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    onLoginSuccess({
      name: demoRole === 'farmer' ? 'Harpreet Singh (Punjab Estate)' : 'ITC Agri Procurement',
      role: demoRole,
      targetMode: demoRole === 'farmer' ? 'store' : 'mandi',
      phone: demoRole === 'farmer' ? '+91 98140 55219' : '+91 98220 11984'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      
      {/* 3D Tilted Dual-Vibe Glass Container */}
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: transformStyle, transition: 'transform 0.15s ease-out' }}
        className="relative w-full max-w-4xl bg-[#111315] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/15 grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Specular Glare Lighting Layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay z-30"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`
          }}
        />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: 8K Bespoke Autonomous Cockpit 3D Visual + Live Dual Tickers (5 Cols) */}
        <div className="hidden md:flex md:col-span-5 relative overflow-hidden bg-black flex-col justify-between p-8">
          <img 
            src="/images/login-3d-cockpit.jpg" 
            alt="AgriMart Autonomous Cockpit HUD" 
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-transparent to-[#111315]/40"></div>

          {/* Top Live Ticker Capsule (Stock Market Vibe) */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-[10px] font-mono text-[#10B981] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
              <span>LIVE APMC AGMARKNET FEED</span>
            </div>

            <div className="bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs font-mono space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/70">Wheat Sharbati:</span>
                <span className="font-bold text-white">₹2,450 <span className="text-[#10B981]">▲ +2.4%</span></span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/70">Mustard Sarson:</span>
                <span className="font-bold text-white">₹5,680 <span className="text-[#10B981]">▲ +1.8%</span></span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/70">Cotton Shankar:</span>
                <span className="font-bold text-white">₹7,140 <span className="text-[#EF4444]">▼ -0.6%</span></span>
              </div>
            </div>
          </div>

          {/* Bottom E-Commerce Assurance Capsule (E-Commerce Vibe) */}
          <div className="relative z-10 space-y-2 text-white">
            <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#D4A373] font-bold font-heading">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Kisan E-Commerce &amp; Fleet</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <Truck className="w-3.5 h-3.5 text-white/40" />
                <span>Free Doorstep Village Delivery over ₹499</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>98% Lab Purity &bull; 0% Mandi Brokerage</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login & Persona Forms (7 Cols) */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#141618]">
          
          <div>
            {/* Header with Dual Vibe Badges */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#D97706] uppercase font-bold">
                  Single Sign-On Gateway
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-[10px] font-mono text-[#10B981] font-bold">
                  E-Commerce + Mandi Stock Terminal
                </span>
              </div>
              <h3 className="text-2xl font-extrabold font-heading text-white">
                Access AgriMart &amp; AgriStock
              </h3>
              <p className="text-xs text-white/60 font-sans mt-0.5">
                Manage your machinery rentals, inputs orders, and real-time crop auction bids in one unified account.
              </p>
            </div>

            {/* Persona Switcher (Farmer / E-Commerce vs Merchant / Stock Market) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all ${
                  role === 'farmer' 
                    ? 'bg-[#D97706] text-[#111315] shadow-md font-black' 
                    : 'text-white/60 hover:text-white'
                }`}>
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold">
                  <Tractor className="w-3.5 h-3.5" />
                  <span>Kisan / Estate Owner</span>
                </div>
                <span className="text-[9px] font-sans opacity-80 mt-0.5">
                  Rent Tractors &bull; Buy Seeds &bull; Sell Lots
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('merchant')}
                className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all ${
                  role === 'merchant' 
                    ? 'bg-white text-[#111315] shadow-md font-black' 
                    : 'text-white/60 hover:text-white'
                }`}>
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold">
                  <Scale className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Mandi Trader / Buyer</span>
                </div>
                <span className="text-[9px] font-sans opacity-80 mt-0.5">
                  Order Book &bull; Real-Time Bids &bull; APMC
                </span>
              </button>
            </div>

            {/* Method Tabs (Mobile OTP vs Password) */}
            <div className="flex items-center gap-4 text-xs font-heading font-semibold border-b border-white/10 pb-2 mb-5">
              <button
                type="button"
                onClick={() => setMethod('otp')}
                className={`flex items-center gap-1.5 pb-1 transition-colors ${
                  method === 'otp' ? 'text-[#D97706] border-b-2 border-[#D97706]' : 'text-white/50 hover:text-white'
                }`}>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile OTP (Farmer Friendly)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('password')}
                className={`flex items-center gap-1.5 pb-1 transition-colors ${
                  method === 'password' ? 'text-[#D97706] border-b-2 border-[#D97706]' : 'text-white/50 hover:text-white'
                }`}>
                <Key className="w-3.5 h-3.5" />
                <span>Institutional Password</span>
              </button>
            </div>

            {/* Form Fields */}
            {method === 'otp' ? (
              <form onSubmit={otpSent ? handleSubmit : handleSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">
                    10-Digit Registered Mobile Number:
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-white/40 font-mono text-xs">+91</span>
                    <input 
                      type="tel"
                      required
                      maxLength={10}
                      autoComplete="username"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-white/70 font-semibold">Enter 4-Digit OTP:</label>
                      <span className="text-[10px] text-[#10B981] font-mono">Demo Auto-OTP: 5824</span>
                    </div>
                    <input 
                      type="text"
                      required
                      maxLength={4}
                      autoComplete="one-time-code"
                      placeholder="5824"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white font-mono font-bold text-center text-lg tracking-widest focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#111315] font-black text-xs font-heading transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2">
                  {isLoading ? (
                    <span className="animate-spin">⌛</span>
                  ) : (
                    <>
                      <span>{otpSent ? (role === 'farmer' ? 'Verify OTP & Launch Store / Rentals' : 'Verify OTP & Open Trading Floor') : 'Send One-Time Password (OTP)'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">Email / Member ID / APMC License No:</label>
                  <input 
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="kisan@agrimart.in or APMC-LIC-7821"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">Password:</label>
                  <input 
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#111315] font-black text-xs font-heading transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2">
                  <span>Sign In &amp; Launch {role === 'farmer' ? 'AgriMart Store' : 'AgriStock Terminal'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            )}
          </div>

          {/* Quick 1-Click Fast Demo Buttons with Dual Vibe Indicators */}
          <div className="pt-5 mt-5 border-t border-white/10">
            <span className="text-[10px] text-white/40 uppercase font-mono block mb-2 font-bold">
              Instant 1-Click Demo Testing:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('farmer')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left text-xs transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#D97706] font-bold">🌾 E-Commerce Farmer</span>
                  <span className="text-[9px] text-[#10B981] font-mono">Store + Rent</span>
                </div>
                <span className="text-white font-semibold block text-[11px] truncate">Harpreet Singh (Punjab)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('merchant')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left text-xs transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#10B981] font-bold">📈 Stock Mandi Trader</span>
                  <span className="text-[9px] text-white/50 font-mono">Order Book</span>
                </div>
                <span className="text-white font-semibold block text-[11px] truncate">ITC Agri Business</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
