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

        {/* Top-Right Action Area (CTA + Strictly Right-Aligned Auth Icon) */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Primary CTA (Hidden on tiny mobile) */}
          <button
            onClick={onOpenBookingModal}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-300"
          >
            <span>Book Slot ↗</span>
          </button>

          {/* DYNAMIC TOP-RIGHT USER AUTH PROFILE ICON & DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              // Logged In: Active Avatar Icon with Dropdown Toggle
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00ff88] to-[#10b981] text-black font-extrabold text-sm flex items-center justify-center border-2 border-white/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,136,0.5)] transition-all duration-200"
                aria-label="User account menu"
                aria-expanded={dropdownOpen}
              >
                {avatarLetter}
              </button>
            ) : (
              // Logged Out: User Profile Login Icon
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#00ff88]/50 text-gray-200 hover:text-[#00ff88] text-xs font-semibold tracking-wider uppercase transition-all duration-200"
                aria-label="Login with Mobile Number"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden xs:inline">Login</span>
              </button>
            )}

            {/* Authenticated User Dropdown Menu */}
            {user && dropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-[#0c120e]/95 backdrop-blur-2xl border border-[#00ff88]/30 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{userIdentifier}</p>
                  <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] text-[#00ff88] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span>
                    Verified Client
                  </span>
                </div>

                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => { setDropdownOpen(false); onOpenBookingModal?.(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>📊</span>
                    <span>My Bookings</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle (Positioned cleanly beside user icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
