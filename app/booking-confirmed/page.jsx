'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function BookingConfirmedPage() {
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get('id') : '';
  const clientName = searchParams ? searchParams.get('name') : '';

  return (
    <div className="min-h-screen bg-[#060907] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ambient Glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#00ff88]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg bg-[#0c100e]/95 border border-[#00ff88]/30 rounded-3xl p-8 sm:p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(0,255,136,0.1)]">
        <div className="w-16 h-16 rounded-full bg-[#00ff88]/15 border border-[#00ff88] text-[#00ff88] flex items-center justify-center text-3xl mx-auto mb-5 shadow-[0_0_25px_rgba(0,255,136,0.3)]">
          ✓
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-extrabold tracking-widest uppercase mb-3">
          Confirmed Slot {id ? `#${id}` : ''}
        </span>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
          Slot Successfully Confirmed {clientName ? `for ${clientName}` : ''}!
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm mx-auto mb-6">
          The booking status has been officially verified and locked in our production schedule. Our creative team will connect with you.
        </p>

        <a
          href="/"
          className="inline-block w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)]"
        >
          Return to Studio Home
        </a>
      </div>
    </div>
  );
}
