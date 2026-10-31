// src/assistant/cards/BookingCard.jsx
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingCard({ data, onAction }) {
  if (!data) return null;

  const {
    bookingId = null,
    mandi = 'Ludhiana APMC, Punjab',
    gate = 'Gate No. 2 (Bulk Grain Scales)',
    date = 'Tomorrow, 1 Nov 2026',
    timeSlot = '08:00 AM - 11:30 AM',
    commodity = 'Wheat (Sharbati)',
    quantity = 100,
    unit = 'Quintals',
    vehicleNo = 'PB-10-DT-4821',
    status = 'PENDING_CONFIRMATION', // 'AVAILABLE' | 'PENDING_CONFIRMATION' | 'CONFIRMED'
  } = data;

  const [confirmed, setConfirmed] = useState(status === 'CONFIRMED');
  const [activeBookingId, setActiveBookingId] = useState(bookingId || (status === 'CONFIRMED' ? 'SLOT-LDH-9821' : null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `SLOT-${mandi.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setActiveBookingId(generatedId);
      setConfirmed(true);
      setIsSubmitting(false);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } catch (err) {
        // safe fallback if canvas is not initialized
      }
      if (onAction) {
        onAction('SLOT_CONFIRMED', { bookingId: generatedId, mandi, date, timeSlot, commodity, quantity });
      }
    }, 600);
  };

  return (
    <div className="my-3 rounded-2xl bg-white border border-black/[0.08] p-5 shadow-xs hover:shadow-md transition-all max-w-lg">
      {/* Header */}
      <div className="pb-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between mb-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
            confirmed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
          }`}>
            <Calendar className="w-3 h-3" />
            <span>{confirmed ? 'Slot Confirmed & Reserved' : 'Slot Reservation Awaiting Confirmation'}</span>
          </span>

          {activeBookingId && (
            <span className="font-mono text-[11px] font-bold text-slate-700">
              ID: {activeBookingId}
            </span>
          )}
        </div>

        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#121212]">
          APMC Delivery Gate Booking
        </h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#C26747] shrink-0" />
          <span>{mandi} &bull; {gate}</span>
        </div>
      </div>

      {/* Booking Details Grid */}
      <div className="grid grid-cols-2 gap-3 py-3.5 border-b border-black/[0.06] text-xs">
        <div className="p-2.5 bg-[#FAF9F5] rounded-xl space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Date &amp; Window</span>
          <span className="font-bold text-slate-800 font-sans block">{date}</span>
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#C26747]" />
            <span>{timeSlot}</span>
          </span>
        </div>

        <div className="p-2.5 bg-[#FAF9F5] rounded-xl space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Produce &amp; Load</span>
          <span className="font-bold text-slate-800 font-sans block">{commodity}</span>
          <span className="text-[11px] text-emerald-700 font-mono font-bold">
            {quantity} {unit}
          </span>
        </div>
      </div>

      {vehicleNo && (
        <div className="py-2.5 flex items-center justify-between text-xs border-b border-black/[0.04]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span>Assigned Vehicle:</span>
          </span>
          <span className="font-mono font-bold text-slate-800">{vehicleNo}</span>
        </div>
      )}

      {/* Confirmation Area */}
      <div className="pt-3">
        {confirmed ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Weighbridge Priority Token Issued</span>
                  <span className="text-[10px] text-emerald-700">Present booking ID at APMC Gate 2 electronic weighment</span>
                </div>
              </div>
            </div>

            {onAction && (
              <button
                onClick={() => onAction('VIEW_CONTRACT_NOTE')}
                className="w-full py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs font-heading shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98]">
                <span>📋 View in Transactions &amp; Escrow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-[#FAF9F5] p-2.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Requires explicit authorization. Reserving this slot will commit truck arrival at the designated mandi scale.</span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#121212] hover:bg-emerald-700 text-white font-extrabold text-xs font-heading shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
              {isSubmitting ? (
                <span className="animate-spin">⌛ Reserving slot in APMC ledger...</span>
              ) : (
                <>
                  <span>Authorize &amp; Confirm Delivery Slot</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
