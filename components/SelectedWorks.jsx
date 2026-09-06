"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 1. DATA STRUCTURE (Mock Portfolio Items)
// Easily swap in your own videos, images, titles, and URLs
// ============================================================================
const PORTFOLIO_PROJECTS = [
  {
    id: "proj-1",
    title: "Nocturnal Visions – Cinematic Commercial",
    category: "Video Editing",
    subtitle: "High-octane color grading & rhythmic cuts for luxury automotive",
    mediaType: "image", // "image" | "video"
    mediaSrc: "images/nocturnal-visions.jpg",
    tags: ["4K HDR", "DaVinci Resolve", "Sound Design"],
    year: "2024",
    link: "#",
  },
  {
    id: "proj-2",
    title: "Urban Rhythm – High-Energy Reel",
    category: "Video Editing",
    subtitle: "Dynamic streetwear and lifestyle commercial campaign",
    mediaType: "image",
    mediaSrc: "images/urban-rhythm.jpg",
    tags: ["Motion Graphics", "Speed Ramps", "Viral Beat Sync"],
    year: "2024",
    link: "#",
  },
  {
    id: "proj-3",
    title: "Cyberpunk Aesthetic Poster & Visuals",
    category: "Photo Editing",
    subtitle: "Editorial visual composite and neon atmospheric lighting",
    mediaType: "image",
    mediaSrc: "images/cyberpunk-poster.jpg",
    tags: ["Photoshop Composite", "Color Grading", "Key Visual"],
    year: "2024",
    link: "#",
  },
  {
    id: "proj-4",
    title: "High-End Beauty & Fashion Retouching",
    category: "Photo Editing",
    subtitle: "Micro skin texture preservation & studio frequency separation",
    mediaType: "image",
    mediaSrc: "images/IMG_0298.JPG.jpeg",
    tags: ["Editorial", "Frequency Separation", "8K Master"],
    year: "2024",
    link: "#",
  },
  {
    id: "proj-5",
    title: "Arne Creative Studio – 3D Web Architecture",
    category: "Web Development",
    subtitle: "Next.js 14, WebGL shaders & high-conversion interactive UI",
    mediaType: "image",
    mediaSrc: "images/website-design-showcase.jpg",
    tags: ["Next.js", "Tailwind CSS", "Framer Motion", "GSAP"],
    year: "2024",
    link: "#",
  },
  {
    id: "proj-6",
    title: "Fintech SaaS Platform & Design System",
    category: "Web Development",
    subtitle: "Real-time analytics dashboard with sub-second latency",
    mediaType: "image",
    mediaSrc: "images/brand-design-system.jpg",
    tags: ["React", "TypeScript", "Tailwind", "REST API"],
    year: "2024",
    link: "#",
  },
  {
    id: "proj-7",
    title: "Hyper-Personalized Mobile Experience",
    category: "App Development",
    subtitle: "Cross-platform iOS & Android mobile ecosystem with offline AI sync",
    mediaType: "image",
    mediaSrc: "images/IMG_0277.PNG",
    tags: ["Flutter", "React Native", "SwiftUI", "Coming Soon"],
    year: "2025",
    link: "#",
  },
];

// ============================================================================
// 2. CATEGORIES CONFIGURATION
// ============================================================================
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "video", label: "Video Editing", filterKey: "Video Editing" },
  { id: "photo", label: "Photo Editing", filterKey: "Photo Editing" },
  { id: "web", label: "Web Development", filterKey: "Web Development" },
  {
    id: "app",
    label: "App Development",
    filterKey: "App Development",
    isUpcoming: true,
    badgeText: "Upcoming",
    tooltip: "App Development service launching soon in Q3 2025",
  },
];

export default function SelectedWorks() {
  const [activeTab, setActiveTab] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Filter projects according to the active tab
  const filteredProjects = PORTFOLIO_PROJECTS.filter((project) => {
    if (activeTab === "all") return true;
    const currentCategory = CATEGORIES.find((c) => c.id === activeTab);
    return currentCategory ? project.category === currentCategory.filterKey : true;
  });

  return (
    <section className="relative w-full bg-[#0a0a0a] text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-12 overflow-hidden selection:bg-[#00ff88] selection:text-black">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#00ff88]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* ================================================================== */}
        {/* SECTION HEADER & TYPOGRAPHY                                        */}
        {/* ================================================================== */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6 shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#00ff88]">
              Curated Portfolio
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white max-w-4xl leading-[1.05]"
          >
            WORK THAT SPEAKS{" "}
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              WITHOUT WORDS
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl font-normal leading-relaxed"
          >
            Precision craftsmanship across commercial video editing, editorial retouching, 
            and modern high-performance web architecture.
          </motion.p>
        </div>

        {/* ================================================================== */}
        {/* CATEGORY FILTER NAVIGATION                                         */}
        {/* ================================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-18">
          {CATEGORIES.map((category) => {
            const isActive = activeTab === category.id;

            if (category.isUpcoming) {
              return (
                <div key={category.id} className="relative group">
                  <button
                    type="button"
                    disabled
                    className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide 
                               bg-white/[0.02] border border-white/10 text-neutral-500 cursor-not-allowed opacity-60 backdrop-blur-md transition-all duration-300"
                    aria-label={`${category.label} - Coming Soon`}
                  >
                    {/* Lock Icon */}
                    <svg
                      className="w-3.5 h-3.5 text-neutral-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>

                    <span>{category.label}</span>

                    {/* Upcoming pill badge */}
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                      {category.badgeText}
                    </span>
                  </button>

                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap">
                    <div className="bg-[#141414] border border-white/10 text-neutral-300 text-[11px] px-3 py-1.5 rounded-lg shadow-2xl backdrop-blur-md">
                      {category.tooltip}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`relative px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 backdrop-blur-md
                  ${
                    isActive
                      ? "bg-[#00ff88] text-black shadow-[0_0_25px_rgba(0,255,136,0.35)] scale-105"
                      : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20"
                  }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* GRID LAYOUT WITH FRAMER MOTION                                     */}
        {/* ================================================================== */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredCard(project.id)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group relative rounded-2xl bg-[#111111] border border-white/10 hover:border-[#00ff88]/50 
                           overflow-hidden shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
              >
                {/* 16:9 Aspect Ratio Media Container */}
                <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden">
                  {project.mediaType === "video" ? (
                    <video
                      src={project.mediaSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={project.mediaSrc}
                      alt={project.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Gradient Vignette over thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/30 to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

                  {/* Top category & year pill */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-black/70 text-[#00ff88] border border-[#00ff88]/30 backdrop-blur-md">
                      {project.category}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400 bg-black/60 px-2.5 py-0.5 rounded-md border border-white/5 backdrop-blur-md">
                      {project.year}
                    </span>
                  </div>

                  {/* Interactive Quick-view Icon on Hover */}
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-[#00ff88] text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.5)]">
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M17 7H7M17 7V17"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="relative p-5 sm:p-6 flex-1 flex flex-col justify-between z-10 bg-[#111111]">
                  <div>
                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors duration-300 line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Brief one-line description */}
                    <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed font-normal">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Bottom Tags */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {project.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-2.5 py-1 rounded-md text-[10px] font-medium text-neutral-400 bg-white/[0.03] border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subtle outer neon edge glow on hover */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[#00ff88]/30 via-cyan-500/20 to-[#00ff88]/30 opacity-0 group-hover:opacity-100 -z-10 blur-[2px] transition-opacity duration-500" />
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ================================================================== */}
        {/* BOTTOM CTA                                                         */}
        {/* ================================================================== */}
        <div className="mt-16 sm:mt-24 text-center">
          <p className="text-xs sm:text-sm text-neutral-400 mb-4">
            Have a project in mind or need tailored studio production?
          </p>
          <a
            href="#booking"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#00ff88] text-black font-bold text-sm tracking-wider uppercase 
                       hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] hover:scale-105 transition-all duration-300"
          >
            <span>Start a Project</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
