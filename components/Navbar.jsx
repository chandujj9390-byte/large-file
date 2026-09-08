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

        {/* Top-Right Action Area: Book a Slot CTA & Client Login */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenBookingModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Book a Slot"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Book a Slot ↗</span>
          </button>

          {/* Direct WhatsApp Chat Action Button */}
          <a
            href="https://wa.me/919390662637?text=Hi%20Arne%2C%20I%27d%20like%20to%20know%20more%20about%20your%20services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 hover:border-[#25D366] shadow-[0_0_12px_rgba(37,211,102,0.25)] hover:shadow-[0_0_22px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp with Arne (+91 9390662637)"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>

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

export default React.memo(Navbar);

