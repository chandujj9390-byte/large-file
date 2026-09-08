'use client';

import React, { useEffect } from 'react';

/**
 * Global Next.js Error Boundary Component
 * Catches runtime crashes and prevents blank white screen failures.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log error securely
    console.error('[Global Application Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060907] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0c100e]/95 border border-red-500/30 rounded-3xl p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(239,68,68,0.1)]">
        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4">
          ⚠️
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          Something went wrong
        </h2>

        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          An unexpected interface error occurred. You can safely try again or return to the studio homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer"
          >
            Try Again ↻
          </button>

          <a
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
