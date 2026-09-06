'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization (using environment variables or default keys)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Global Responsive Navbar with Top-Right Dynamic Supabase Auth State
 * Styled with Tailwind CSS & Glassmorphism Theme
 */
export default function Navbar({ onOpenLoginModal, onOpenBookingModal }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Listen for Supabase Authentication State Changes
  useEffect(() => {
    // Fetch active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Real-time auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle Logout
  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
  };

  // Format phone number or email for display
  const userIdentifier = user?.phone || user?.email || 'Client';
  const avatarLetter = user?.phone 
    ? user.phone.slice(-2) 
    : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#050706]/85 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group text-white no-underline">
          <span className="font-extrabold text-2xl tracking-widest bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            ARNE
          </span>
          <span className="text-[#00ff88] text-sm group-hover:scale-125 transition-transform duration-300">✦</span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 bg-white/[0.03] border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
          <a href="#hero" className="text-sm font-medium text-gray-300 hover:text-[#00ff88] transition-colors">Home</a>
          <a href="#services" className="text-sm font-medium text-gray-300 hover:text-[#00ff88] transition-colors">Services</a>
          <a href="#work" className="text-sm font-medium text-gray-300 hover:text-[#00ff88] transition-colors">Work</a>
          <a href="#about" className="text-sm font-medium text-gray-300 hover:text-[#00ff88] transition-colors">About</a>
          <a href="#contact" className="text-sm font-medium text-gray-300 hover:text-[#00ff88] transition-colors">Contact</a>
        </nav>

        {/* Top-Right Action Area: Book a Slot CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenBookingModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Book a Slot"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Book a Slot ↗</span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070b09]/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Home</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Services</a>
          <a href="#work" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Work</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">About</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Contact</a>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenBookingModal?.(); }}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-bold uppercase text-xs tracking-wider text-center"
          >
            Book Slot ↗
          </button>
        </div>
      )}
    </header>
  );
}
