"use client";

import React from "react";
import { motion } from "framer-motion";

// ============================================================================
// COMPARISON DATA
// Highly persuasive metric rows comparing Arne Stories vs alternatives
// ============================================================================
const COMPARISON_ROWS = [
  {
    feature: "Experience",
    featureDesc: "Proven hands-on editing & design track record",
    arne: {
      text: "4 Years Editing & Designing Expertise",
      status: "trophy",
      highlight: true,
    },
    freelancers: {
      text: "Varies Widely / Unverified",
      status: "warning",
    },
    agencies: {
      text: "Junior Talent / High Turnover",
      status: "warning",
    },
  },
  {
    feature: "Delivery Speed",
    featureDesc: "Guaranteed turnaround with zero delays",
    arne: {
      text: "Guaranteed On-Time Delivery (No Delays)",
      status: "check",
      highlight: true,
    },
    freelancers: {
      text: "Prone to Delays & Ghosting",
      status: "cross",
    },
    agencies: {
      text: "Slow Turnarounds / Bureaucracy",
      status: "cross",
    },
  },
  {
    feature: "Team Workflow",
    featureDesc: "Dedicated creative talent & sync",
    arne: {
      text: "Dedicated & Cohesive Team Workflow",
      status: "check",
      highlight: true,
    },
    freelancers: {
      text: "Solo / Overwhelmed Capacity",
      status: "cross",
    },
    agencies: {
      text: "Disconnected Sub-contractors",
      status: "cross",
    },
  },
  {
    feature: "Pricing Strategy",
    featureDesc: "Clear milestones with no hidden fees",
    arne: {
      text: "Budget-Friendly & Transparent Pricing",
      status: "check",
      highlight: true,
    },
    freelancers: {
      text: "Hidden Revisions Fees",
      status: "warning",
    },
    agencies: {
      text: "Expensive Retainers / Overpriced",
      status: "cross",
    },
  },
  {
    feature: "Creative Approach",
    featureDesc: "Original, tailor-made visual identities",
    arne: {
      text: "Highly Creative & Custom Output",
      status: "check",
      highlight: true,
    },
    freelancers: {
      text: "Basic Presets & Templates",
      status: "cross",
    },
    agencies: {
      text: "Factory-Line / Mass-Produced",
      status: "cross",
    },
  },
  {
    feature: "Watermark Policy",
    featureDesc: "Clean delivery with full creative ownership",
    arne: {
      text: "100% Watermark-Free Final Delivery & Clean Masters",
      status: "check",
      highlight: true,
    },
    freelancers: {
      text: "Obtrusive Watermarks / Extra Removal Fees",
      status: "cross",
    },
    agencies: {
      text: "Agency Branding Tagged / Restrictive Licensing",
      status: "cross",
    },
  },
];

// Helper to render vibrant glowing icons for Arne Stories vs subtle dimmed competition icons
function StatusIcon({ status }) {
  if (status === "trophy") {
    return (
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 flex items-center justify-center text-xs shadow-[0_0_12px_rgba(251,191,36,0.5)]">
        🏆
      </span>
    );
  }
  if (status === "check") {
    return (
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/60 text-[#00ff88] flex items-center justify-center shadow-[0_0_14px_rgba(0,255,136,0.45)]">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400/80 flex items-center justify-center">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400/70 flex items-center justify-center">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  );
}

export default function WhyChooseUs() {
  return (
    <section className="relative w-full bg-transparent text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-[#00ff88] selection:text-black">
      <div className="relative max-w-7xl mx-auto">
        {/* ================================================================== */}
        {/* 1. SECTION TITLE & TYPOGRAPHY                                      */}
        {/* ================================================================== */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00ff88]">
              Competitive Matrix
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white max-w-4xl leading-[1.08]"
          >
            WHY{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-500">
              ARNEWORKS?
            </span>
          </motion.h2>
        </div>

        {/* ================================================================== */}
        {/* 2. COMPARISON TABLE ARCHITECTURE (TRANSPARENT & MINIMAL)           */}
        {/* ================================================================== */}
        <div className="hidden lg:block relative">
          <div className="grid grid-cols-12 gap-0 rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-xl overflow-hidden">
            {/* ----------------- Table Header ----------------- */}
            <div className="col-span-3 p-6 flex flex-col justify-end border-b border-r border-white/[0.06]">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">
                Core Deliverables
              </span>
              <h3 className="text-base font-bold text-neutral-200 mt-1">Feature Comparison</h3>
            </div>

            {/* Column 2: ARNE STORIES (Highlight Column) */}
            <div className="col-span-4 p-6 border-b border-x border-[#00ff88]/25 bg-[#00ff88]/[0.02] relative">
              <div className="absolute top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 text-[9px] font-bold uppercase tracking-wider">
                Studio Standard
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] font-black flex items-center justify-center text-sm">
                  A
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    ARNE STORIES
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-[#00ff88] font-medium">Dedicated Creative Direction</p>
                </div>
              </div>
            </div>

            {/* Column 3: Other Freelancers */}
            <div className="col-span-2.5 p-6 border-b border-r border-white/[0.06]">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-neutral-400">
                Alternative
              </span>
              <h3 className="text-sm font-bold text-neutral-300 mt-1">Other Freelancers</h3>
              <p className="text-[11px] text-neutral-400">Marketplace hires</p>
            </div>

            {/* Column 4: Low-Budget Agencies */}
            <div className="col-span-2.5 p-6 border-b border-white/[0.06]">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-neutral-400">
                Traditional
              </span>
              <h3 className="text-sm font-bold text-neutral-300 mt-1">Low-Budget Agencies</h3>
              <p className="text-[11px] text-neutral-400">Volume-based outsourcing</p>
            </div>

            {/* ----------------- Table Rows ----------------- */}
            {COMPARISON_ROWS.map((row, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="col-span-12 grid grid-cols-12 group hover:bg-white/[0.02] transition-colors duration-150 border-b border-white/[0.04] last:border-b-0"
              >
                {/* Column 1: Feature */}
                <div className="col-span-3 p-5 flex flex-col justify-center border-r border-white/[0.06]">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-[#00ff88] transition-colors duration-150">
                    {row.feature}
                  </span>
                  <span className="text-[10.5px] text-neutral-400 mt-0.5 font-normal">
                    {row.featureDesc}
                  </span>
                </div>

                {/* Column 2: Arne Stories (Highlight) */}
                <div className="col-span-4 p-5 flex items-center gap-3 border-x border-[#00ff88]/20 bg-[#00ff88]/[0.015]">
                  <StatusIcon status={row.arne.status} />
                  <span className="text-xs font-semibold text-white leading-relaxed">
                    {row.arne.text}
                  </span>
                </div>

                {/* Column 3: Other Freelancers */}
                <div className="col-span-2.5 p-5 flex items-center gap-2.5 border-r border-white/[0.06]">
                  <StatusIcon status={row.freelancers.status} />
                  <span className="text-xs font-normal text-neutral-400 leading-relaxed">
                    {row.freelancers.text}
                  </span>
                </div>

                {/* Column 4: Low-Budget Agencies */}
                <div className="col-span-2.5 p-5 flex items-center gap-2.5">
                  <StatusIcon status={row.agencies.status} />
                  <span className="text-xs font-normal text-neutral-400 leading-relaxed">
                    {row.agencies.text}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* ----------------- Table Footer CTA ----------------- */}
            <div className="col-span-3 p-5 border-r border-white/[0.06] flex items-center">
              <span className="text-[11px] text-neutral-400">Strictly limited client slots per month.</span>
            </div>

            <div className="col-span-4 p-4 border-x border-[#00ff88]/20 bg-[#00ff88]/[0.02] flex justify-center items-center">
              <a
                href="#booking"
                className="w-full text-center py-2.5 px-5 rounded-full bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black border border-[#00ff88]/40 font-bold text-[11px] tracking-wider uppercase transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
              >
                SECURE YOUR SLOT →
              </a>
            </div>

            <div className="col-span-2.5 p-5 border-r border-white/[0.06] flex items-center justify-center">
              <span className="text-[11px] text-neutral-400">No guarantees</span>
            </div>

            <div className="col-span-2.5 p-5 flex items-center justify-center">
              <span className="text-[11px] text-neutral-400">Long contracts</span>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. MOBILE ADAPTIVE VIEW (< 1024px)                                 */}
        {/* ================================================================== */}
        <div className="block lg:hidden space-y-4">
          <div className="rounded-2xl border border-[#00ff88]/40 bg-[#00ff88]/[0.02] p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] font-black flex items-center justify-center text-xs">
                  A
                </div>
                <h3 className="text-base font-bold text-white">ARNE STORIES</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 text-[9px] font-bold uppercase">
                Studio Standard
              </span>
            </div>

            <div className="space-y-3.5">
              {COMPARISON_ROWS.map((row, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 pb-2.5 border-b border-white/[0.03] last:border-0 last:pb-0">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {row.feature}
                  </span>
                  <div className="flex items-center gap-2 text-right">
                    <StatusIcon status={row.arne.status} />
                    <span className="text-xs font-semibold text-white">
                      {row.arne.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#booking"
              className="mt-6 block w-full text-center py-2.5 px-4 rounded-full bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black border border-[#00ff88]/40 font-bold text-xs uppercase tracking-wider transition-all duration-200"
            >
              SECURE YOUR SLOT →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

