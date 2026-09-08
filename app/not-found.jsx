'use client';

import React from 'react';

/**
 * Next.js App Router 404 Not Found Page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060907] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#00ff88]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#0c100e]/95 border border-[#00ff88]/30 rounded-3xl p-8 sm:p-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(0,255,136,0.1)]">
        <span className="text-4xl font-black text-[#00ff88] tracking-widest block mb-2 font-mono">
          404
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Page Not Found
        </h1>

        <p className="text-xs text-gray-400 leading-relaxed mb-6 max-w-xs mx-auto">
          The requested page or resource could not be found in our studio directory.
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
