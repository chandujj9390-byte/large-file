'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Arne Stories Curated Production Services
const ARNE_SERVICES = [
  { id: 'video-editing', name: 'Video Editing (4K / Cinematic)', price: '₹1,049' },
  { id: 'photo-editing', name: 'Photo Retouching & Color Grading', price: '₹599' },
  { id: 'reels-editing', name: 'Reels & Shorts Viral Editing', price: '₹799' },
  { id: 'poster-design', name: 'Poster & Title Card Designing', price: '₹529' },
  { id: 'album-design', name: 'Cinematic Photo Album Layout', price: '₹1,299' },
  { id: 'color-grading', name: 'DaVinci Resolve Color Grading', price: '₹599' },
  { id: 'cinematic-shoot', name: 'Cinematic Production Shoot', price: '₹4,999' },
  { id: 'web-design', name: 'Website Designing & Development', price: '₹4,999' }
];

/**
 * Arne Stories — Premium Cinematic Booking Form Component
 * 
 * Features:
 * - 1-Hour Review & Slot Confirmation Flow (No 50% advance / Razorpay required)
 * - Direct Supabase & /api/complete-booking submission with status: 'Pending Review'
 * - Instant Twilio SMS acknowledgment & Admin Nodemailer alert
 * - Dark frosted glass aesthetic with emerald accents
 */
export default function BookingForm({ onSlotRequested, className = '' }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    service: '',
    prefDate: '',
    prefSlot: 'Morning (10:00 AM - 01:00 PM)',
    projectDesc: ''
  });

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValidationError('');

    if (name === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setValidationError('');

    const { fullName, email, mobile, service, prefDate, prefSlot, projectDesc } = formData;

    // Validate Full Name
    if (!fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    // Strict Gmail / Email Validation
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setValidationError('Please provide a valid email address.');
      return;
    }

    // Validate Mobile (+91 10-digit number)
    const rawDigits = mobile.replace(/\D/g, '');
    const clean10Digits = rawDigits.startsWith('91') && rawDigits.length === 12 
      ? rawDigits.slice(2) 
      : rawDigits.slice(-10);

    if (clean10Digits.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formattedPhoneNumber = `+91${clean10Digits}`;

    // Validate Service Selection
    if (!service) {
      setValidationError('Please select a service to proceed.');
      return;
    }

    setLoading(true);

    try {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const bookingId = `ARNE-2026-${randomCode}`;

      const bookingPayload = {
        booking_id: bookingId,
        id: bookingId,
        client_name: fullName.trim(),
        customer_name: fullName.trim(),
        client_email: cleanEmail,
        customer_email: cleanEmail,
        client_phone: formattedPhoneNumber,
        customer_phone: formattedPhoneNumber,
        customer_whatsapp: formattedPhoneNumber,
        service_type: service,
        service_name: service,
        booking_date: prefDate || null,
        booking_time: prefSlot || 'Flexible',
        time_slot: prefSlot || 'Flexible',
        project_desc: projectDesc || 'No additional requirements.',
        status: 'Pending Review',
        booking_status: 'Pending Review',
        payment_status: 'Review Pending',
        created_at: new Date().toISOString()
      };

      // 1. Direct Supabase Insert
      try {
        await supabase.from('bookings').insert([bookingPayload]);
        await supabase.from('customers').insert([{
          full_name: fullName.trim(),
          mobile: formattedPhoneNumber,
          whatsapp: formattedPhoneNumber,
          email: cleanEmail
        }]);
      } catch (sbErr) {
        console.warn('[Supabase Direct Notice]:', sbErr.message);
      }

      // 2. Dispatch to Backend API for Twilio SMS & Nodemailer Admin Alert
      try {
        await fetch('/api/complete-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });
      } catch (apiErr) {
        console.warn('[Backend API Notice]:', apiErr.message);
      }

      setBookingRef(bookingId);
      setRequestSubmitted(true);

      if (typeof onSlotRequested === 'function') {
        onSlotRequested(bookingPayload);
      }
    } catch (err) {
      console.error('[Booking Error]:', err);
      setValidationError(err.message || 'An unexpected error occurred while saving your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (requestSubmitted) {
    return (
      <div className={`relative w-full max-w-lg mx-auto ${className}`}>
        <div className="relative rounded-3xl bg-black/85 backdrop-blur-2xl border border-[#00ff88]/30 p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,255,136,0.15)] text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(0,255,136,0.2)]">
            ✓
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[11px] font-bold tracking-widest uppercase mb-2">
            Request Logged • Ref #{bookingRef}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            SLOT REQUEST SUBMITTED!
          </h2>
          <p className="text-sm text-gray-300 mt-3 leading-relaxed max-w-md mx-auto">
            We will review schedule availability and <strong className="text-[#00ff88]">confirm your slot via SMS within 1 hour</strong>.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Client Name:</span>
              <span className="text-white font-semibold">{formData.fullName}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Service:</span>
              <span className="text-white font-semibold">{formData.service}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>SMS Contact:</span>
              <span className="text-[#00ff88] font-mono font-semibold">+91 {formData.mobile}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setRequestSubmitted(false); setBookingRef(''); }}
            className="mt-6 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            ← Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Cinematic Glowing Background Border */}
      <div className="relative rounded-3xl bg-black/70 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_35px_rgba(0,255,136,0.08)] transition-all">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[11px] font-bold tracking-widest uppercase mb-3">
            <span>⚡</span> 1-Hour Slot Confirmation
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            REQUEST YOUR SLOT
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed">
            Fill in your details below. Our production team will review schedule availability and confirm your slot via SMS within 1 hour.
          </p>
        </div>

        {/* Validation Alert Box */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-[#00ff88]">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all disabled:opacity-50"
            />
          </div>

          {/* Field 2: Gmail Address */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Gmail / Email Address <span className="text-[#00ff88]">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="yourname@gmail.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all disabled:opacity-50"
            />
          </div>

          {/* Field 3: Mobile Number */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-[#00ff88]">*</span>
            </label>
            <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88] transition-all overflow-hidden">
              <span className="px-3.5 py-3 text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border-r border-white/10 whitespace-nowrap select-none">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                name="mobile"
                placeholder="93906 62637"
                maxLength={10}
                value={formData.mobile}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-3.5 py-3 bg-transparent text-white text-sm outline-none placeholder-gray-600 disabled:opacity-50"
              />
            </div>
            <span className="block text-[10px] text-gray-500 mt-1">
              Your 1-hour slot confirmation will be sent directly via SMS
            </span>
          </div>

          {/* Field 4: Select Service Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Select Service <span className="text-[#00ff88]">*</span>
            </label>
            <div className="relative">
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#111614] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled className="text-gray-500 bg-[#111614]">
                  -- Select a Production Service --
                </option>
                {ARNE_SERVICES.map((srv) => (
                  <option key={srv.id} value={srv.name} className="text-white bg-[#111614]">
                    {srv.name} ({srv.price})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Field 5: Project Requirements */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Project Requirements / Notes
            </label>
            <textarea
              name="projectDesc"
              rows={3}
              placeholder="Describe your project vision, timeline, or references..."
              value={formData.projectDesc}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all disabled:opacity-50 resize-none"
            />
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black hover:opacity-95 hover:shadow-[0_0_25px_rgba(0,255,136,0.35)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <span>REQUEST SLOT</span>
                <span className="text-base leading-none">→</span>
              </>
            )}
          </button>
        </form>

        {/* Trust Badges Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-[#00ff88]">⚡</span> Rapid 1-Hour Review Window
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#00ff88]">💬</span> Direct Twilio SMS Confirmation
          </span>
        </div>
      </div>
    </div>
  );
}
