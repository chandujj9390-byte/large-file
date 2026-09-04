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
 * - Full Name, Gmail Address, Mobile (+91 formatted), Select Service
 * - Strict Gmail & 10-digit Indian Mobile Validation
 * - Direct Supabase `bookings` table insertion
 * - Frosted glass dark-mode UI with crisp typography
 * - Try/catch error alerting and "Saving Details..." state
 */
export default function BookingForm({ onProceedToPayment, className = '' }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    service: ''
  });

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successSaved, setSuccessSaved] = useState(false);

  // Format Mobile with +91 Country Code for Twilio / SMS Gateways
  const formatMobileNumber = (input) => {
    const raw = (input || '').replace(/[\s\-()]/g, '');
    if (!raw) return '';
    if (raw.startsWith('+91')) {
      return `+91${raw.slice(3).replace(/\D/g, '').slice(0, 10)}`;
    }
    if (raw.startsWith('+')) {
      return raw;
    }
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length <= 10) {
      return `+91${cleanDigits}`;
    }
    if (cleanDigits.startsWith('91')) {
      return `+${cleanDigits.slice(0, 12)}`;
    }
    return `+91${cleanDigits.slice(0, 10)}`;
  };

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
    // 1. Prevent default page reload
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setValidationError('');

    const { fullName, email, mobile, service } = formData;

    // 2. Validate Full Name
    if (!fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    // 3. Strict Gmail / Email Validation
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setValidationError('Please provide a valid email address.');
      return;
    }
    if (!cleanEmail.endsWith('@gmail.com')) {
      setValidationError('Please enter a valid Gmail address ending with @gmail.com.');
      return;
    }

    // 4. Strict Mobile Validation (+91 10-digit number)
    const rawDigits = mobile.replace(/\D/g, '');
    const clean10Digits = rawDigits.startsWith('91') && rawDigits.length === 12 
      ? rawDigits.slice(2) 
      : rawDigits.slice(-10);

    if (clean10Digits.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formattedPhoneNumber = `+91${clean10Digits}`;

    // 5. Validate Service Selection
    if (!service) {
      setValidationError('Please select a service to proceed.');
      return;
    }

    // 6. Set Loading State
    setLoading(true);

    try {
      // Generate Unique Booking Reference
      const bookingId = `ARNE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Prepare Supabase Payload
      const bookingPayload = {
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
        status: 'pending_payment',
        booking_status: 'Pending Payment',
        payment_status: 'Pending',
        created_at: new Date().toISOString()
      };

      console.log('Inserting booking details into Supabase:', bookingPayload);

      // Insert into Supabase 'bookings' table
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select();

      if (error) {
        console.error('Supabase Booking Insert Error:', error.message, error);
        alert(`Booking failed to save in Supabase: ${error.message}`);
        throw error;
      }

      // Also register or update customer record
      try {
        await supabase.from('customers').insert([{
          full_name: fullName.trim(),
          mobile: formattedPhoneNumber,
          whatsapp: formattedPhoneNumber,
          email: cleanEmail
        }]);
      } catch (_) {
        // Non-blocking if customer record already exists
      }

      setSuccessSaved(true);

      // Transition to Payment or Callback
      if (typeof onProceedToPayment === 'function') {
        onProceedToPayment({
          bookingId,
          ...bookingPayload
        });
      } else {
        // If standalone, trigger payment modal or redirect to payment page
        if (typeof window !== 'undefined' && window.openPaymentModal) {
          window.draftBooking = {
            id: bookingId,
            serviceName: service,
            clientName: fullName.trim(),
            clientEmail: cleanEmail,
            clientPhone: formattedPhoneNumber,
            totalPrice: 1049
          };
          window.openPaymentModal();
        } else if (typeof window !== 'undefined') {
          sessionStorage.setItem('current_booking', JSON.stringify(bookingPayload));
          // Redirect to payment.html if present
          window.location.href = `/payment.html?id=${bookingId}&service=${encodeURIComponent(service)}&amount=1049`;
        }
      }
    } catch (err) {
      console.error('[Booking Error]:', err);
      alert(err.message || 'An unexpected error occurred while saving your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Cinematic Glowing Background Border */}
      <div className="relative rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_35px_rgba(0,255,136,0.08)] transition-all">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[11px] font-bold tracking-widest uppercase mb-3">
            <span>✨</span> Instant Booking Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            BOOK YOUR SESSION
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed">
            Fill in your details below to log your order into our system and proceed to secure payment.
          </p>
        </div>

        {/* Validation Alert Box */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Success Notice */}
        {successSaved && (
          <div className="mb-4 p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs flex items-center gap-2.5 animate-in fade-in">
            <span>✓</span>
            <span className="font-medium">Details logged successfully! Proceeding to payment...</span>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-[#00ff88]">*</span>
            </label>
            <div className="relative">
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
          </div>

          {/* Field 2: Gmail Address */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Gmail Address <span className="text-[#00ff88]">*</span>
            </label>
            <div className="relative">
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
            <span className="block text-[10px] text-gray-500 mt-1">
              Must end with @gmail.com for instant delivery updates
            </span>
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
              Auto-formatted with +91 for Twilio SMS verification
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

          {/* Submit & Proceed Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black hover:opacity-95 hover:shadow-[0_0_25px_rgba(0,255,136,0.35)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <span>PROCEED TO PAYMENT</span>
                <span className="text-base leading-none">→</span>
              </>
            )}
          </button>
        </form>

        {/* Trust Badges Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-[#00ff88]">🔒</span> 256-Bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#00ff88]">⚡</span> Instant Slot Confirmation
          </span>
        </div>
      </div>
    </div>
  );
}
