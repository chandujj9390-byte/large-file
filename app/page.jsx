'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ThreeScene from '../ThreeScene';
import WhyChooseUs from '../components/WhyChooseUs';
import SelectedWorks from '../components/SelectedWorks';
import BookingForm from '../components/BookingForm';
import BookingModal from '../components/BookingModal';
import OtpLoginModal from '../components/OtpLoginModal';
import TrustBox from '../components/TrustBox';

export default function HomePage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060907] text-white selection:bg-[#00ff88] selection:text-black">
      {/* 1. Global Navigation Bar */}
      <Navbar
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* 2. Hero Section with 3D Cinematic Background */}
      <ThreeScene>
        <section id="hero" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-extrabold uppercase tracking-widest text-gray-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse" />
            <span>High-End Video Editing, Design & Web Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 max-w-4xl">
            <span>WE CREATE </span>
            <span className="bg-gradient-to-r from-[#00ff88] via-[#10b981] to-cyan-400 bg-clip-text text-transparent">
              VISUALS THAT
            </span>
            <span> MOVE PEOPLE.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Cinematic shoots, professional color grading, viral reels, and modern web development — all crafted through one studio.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="py-4 px-8 rounded-full bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              BOOK A SLOT ↗
            </button>

            <a
              href="#work"
              className="py-4 px-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-widest backdrop-blur-md transition-all duration-300"
            >
              VIEW OUR WORK
            </a>
          </div>

          {/* Social Proof & Trust Box */}
          <div className="w-full max-w-sm mx-auto">
            <TrustBox />
          </div>
        </section>
      </ThreeScene>

      {/* 3. Selected Portfolio Showcase */}
      <section id="work">
        <SelectedWorks />
      </section>

      {/* 4. Why Choose Us (Comparison Metrics) */}
      <section id="about">
        <WhyChooseUs />
      </section>

      {/* 5. Direct Booking Form Section */}
      <section id="booking" className="py-24 px-4 sm:px-6 relative bg-gradient-to-b from-[#0a0a0a] via-[#080d0a] to-[#060907]">
        <div className="max-w-lg mx-auto">
          <BookingForm />
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-white/10 py-12 px-6 text-center text-xs text-gray-500 bg-[#040605]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-white tracking-widest uppercase">ARNE WORKS</span>
          <span>© {new Date().getFullYear()} ARNE Stories Studio. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {/* Booking Modal Dialog */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* OTP Login Modal Dialog */}
      <OtpLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
