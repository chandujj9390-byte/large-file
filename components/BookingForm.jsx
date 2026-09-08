'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjgbzipdvhgdftxdlccx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9fjwQtl2NjYC7OYLmy1pVw_oyc4ru2C';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Arne Stories Curated Production Services
const ARNE_SERVICES = [
  'Video Editing (4K / Cinematic)',
  'Photo Retouching & Color Grading',
  'Reels & Shorts Viral Editing',
  'Poster & Title Card Designing',
  'Cinematic Photo Album Layout',
  'DaVinci Resolve Color Grading',
  'Website Designing & Development',
  'Other Creative Service'
];

/**
 * Ambient Glow Subcomponent (Memoized to prevent repaints)
 */
const AmbientGlow = memo(function AmbientGlow() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/10 blur-[150px] rounded-full pointer-events-none" />
  );
});

/**
 * Step Progress Indicator Subcomponent (Memoized)
 */
const StepProgressBar = memo(function StepProgressBar({ step }) {
  if (step >= 3) return null;
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
      <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
    </div>
  );
});

/**
 * Summary Review Card (Step 2 - Memoized)
 */
const ReviewCard = memo(function ReviewCard({ data }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3 text-xs divide-y divide-white/5">
      <div className="flex justify-between items-center pt-1 first:pt-0">
        <span className="text-gray-400 font-medium">Name:</span>
        <span className="font-bold text-white text-right">{data.fullName}</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Phone:</span>
        <span className="font-mono font-bold text-[#00ff88] text-right">
          +91 {data.mobile ? data.mobile.replace(/\D/g, '').slice(-10) : ''}
        </span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Email:</span>
        <span className="font-medium text-gray-200 text-right">{data.email}</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Service:</span>
        <span className="font-bold text-white text-right">{data.service}</span>
      </div>
      <div className="pt-3">
        <span className="block text-gray-400 font-medium mb-1">Notes:</span>
        <p className="text-gray-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
          {data.requirements?.trim() || 'No additional requirements specified.'}
        </p>
      </div>
    </div>
  );
});

/**
 * Success Screen (Step 3 - Memoized)
 */
const SuccessConfirmation = memo(function SuccessConfirmation({ successData, onReset }) {
  return (
    <div className="text-center py-2 space-y-4 animate-in fade-in">
      <div className="w-14 h-14 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/40 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_25px_rgba(0,255,136,0.3)]">
        ✓
      </div>
      
      <div className="space-y-1">
        <span className="inline-block px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold tracking-widest uppercase">
          Booking Reference #{successData.bookingId}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Booking Submitted!
        </h2>
        <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
          We have received your request and our team will contact you shortly.
        </p>
      </div>

      {/* Direct WhatsApp & Gmail Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left my-2">
        <a
          href={`https://wa.me/919390662637?text=${encodeURIComponent(
            `Hi ARNE Works, I have submitted booking #${successData.bookingId} for ${successData.service}. Name: ${successData.fullName}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] transition-all text-decoration-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💬</span>
            <div>
              <span className="block text-[9px] font-extrabold text-[#25D366] uppercase">Business WhatsApp</span>
              <span className="block text-xs font-bold text-white font-mono">+91 9390662637</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#25D366] text-right mt-1">Chat on WhatsApp ↗</span>
        </a>

        <a
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=arneworks26@gmail.com&su=${encodeURIComponent(
            `ARNE Booking: ${successData.bookingId} - ${successData.fullName}`
          )}&body=${encodeURIComponent(
            `Hi ARNE Works Team,\n\nI have submitted my booking #${successData.bookingId} for ${successData.service}.\nClient Name: ${successData.fullName}\nPhone: ${successData.mobile}\nEmail: ${successData.email}\n\nLooking forward to hearing from you!`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between p-3 rounded-xl bg-[#ea4335]/10 border border-[#ea4335]/30 hover:border-[#ea4335] transition-all text-decoration-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✉️</span>
            <div>
              <span className="block text-[9px] font-extrabold text-[#ff7b72] uppercase">Business Gmail</span>
              <span className="block text-[11px] font-bold text-white truncate max-w-[130px]">arneworks26@gmail.com</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#ff7b72] text-right mt-1">Open Gmail ↗</span>
        </a>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer"
      >
        Submit Another Booking
      </button>
    </div>
  );
});

/**
 * Arne Stories — Highly Optimized 2-Step Booking Form
 * Uses react-hook-form to isolate input state and eliminate keystroke re-rendering lag.
 */
function BookingForm({ onSlotRequested, className = '' }) {
  // 1 = Form, 2 = Review, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Uncontrolled form state via react-hook-form
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      service: '',
      requirements: ''
    }
  });

  // Services memo
  const servicesList = useMemo(() => ARNE_SERVICES, []);

  // Step 1 -> Step 2: Validate via react-hook-form and advance
  const handleProceedToReview = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(2);
  }, []);

  // Step 2 -> Step 1: Return to edit without losing form values
  const handleBackToEdit = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(1);
  }, []);

  // Step 2 -> Step 3: Confirm & Submit Verified Payload to Backend
  const handleFinalConfirmBooking = useCallback(async () => {
    setSubmissionError('');
    setLoading(true);

    const formValues = getValues();
    const rawDigits = (formValues.mobile || '').replace(/\D/g, '');
    const clean10Digits = rawDigits.startsWith('91') && rawDigits.length === 12 
      ? rawDigits.slice(2) 
      : rawDigits.slice(-10);
    const formattedPhoneNumber = `+91${clean10Digits}`;
    const cleanEmail = (formValues.email || '').trim().toLowerCase();
    const cleanNotes = (formValues.requirements || '').trim() || 'No additional requirements specified.';

    try {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const bookingId = `ARNE-2026-${randomCode}`;

      const bookingPayload = {
        bookingId: bookingId,
        id: bookingId,
        fullName: formValues.fullName.trim(),
        client_name: formValues.fullName.trim(),
        email: cleanEmail,
        client_email: cleanEmail,
        mobile: formattedPhoneNumber,
        client_phone: formattedPhoneNumber,
        service: formValues.service,
        service_type: formValues.service,
        requirements: cleanNotes,
        status: 'New Booking',
        booking_status: 'New Booking'
      };

      // 1. Direct Supabase Upsert
      try {
        await supabase.from('bookings').upsert([{
          id: bookingId,
          client_name: formValues.fullName.trim(),
          customer_name: formValues.fullName.trim(),
          client_email: cleanEmail,
          customer_email: cleanEmail,
          client_phone: formattedPhoneNumber,
          customer_phone: formattedPhoneNumber,
          customer_whatsapp: formattedPhoneNumber,
          service_type: formValues.service,
          service_name: formValues.service,
          project_desc: cleanNotes,
          status: 'New Booking',
          booking_status: 'New Booking',
          payment_status: 'Review Pending',
          created_at: new Date().toISOString()
        }]);
      } catch (sbErr) {
        console.warn('[Supabase Direct Notice]:', sbErr.message);
      }

      // 2. Dispatch to Backend API
      const response = await fetch('/api/complete-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking request.');
      }

      setBookingSuccessData({
        bookingId: data.bookingId || bookingId,
        fullName: formValues.fullName.trim(),
        service: formValues.service,
        email: cleanEmail,
        mobile: formattedPhoneNumber,
        requirements: cleanNotes
      });

      setCurrentStep(3);

      if (typeof onSlotRequested === 'function') {
        onSlotRequested(bookingPayload);
      }
    } catch (err) {
      console.error('[Booking Error]:', err);
      setSubmissionError(err.message || 'An unexpected error occurred while saving your request. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getValues, onSlotRequested]);

  const handleReset = useCallback(() => {
    reset();
    setBookingSuccessData(null);
    setCurrentStep(1);
  }, [reset]);

  const activeReviewData = useMemo(() => {
    return currentStep === 2 ? getValues() : null;
  }, [currentStep, getValues]);

  // First field error helper
  const firstError = errors.fullName?.message || errors.mobile?.message || errors.email?.message || errors.service?.message || submissionError;

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Background Ambient Glow */}
      <AmbientGlow />

      {/* Main Container */}
      <div className="relative rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(0,255,136,0.1)] transition-all">
        
        {/* Step Progress Indicator */}
        <StepProgressBar step={currentStep} />

        {/* Validation Alert Box */}
        {firstError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{firstError}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CLIENT DETAILS FORM (react-hook-form Uncontrolled Inputs)          */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[11px] font-bold tracking-widest uppercase mb-2">
                <span>⚡</span> Step 1 of 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                BOOK YOUR SLOT
              </h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Fill in your details below, then review them before final confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleProceedToReview)} className="space-y-4">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...register('fullName', {
                    required: 'Please enter your full name.',
                    minLength: { value: 2, message: 'Full name must be at least 2 characters.' }
                  })}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all"
                />
              </div>

              {/* Field 2 & 3: Mobile Number & Client Gmail (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-[#00ff88]">*</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88] transition-all overflow-hidden">
                    <span className="px-3 py-3 text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border-r border-white/10 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9390662637"
                      maxLength={10}
                      inputMode="numeric"
                      {...register('mobile', {
                        required: 'Please enter your 10-digit mobile number.',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit mobile number.'
                        }
                      })}
                      className="w-full px-3 py-3 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Client Gmail <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    {...register('email', {
                      required: 'Please enter your email address.',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Please enter a valid Gmail / email address.'
                      }
                    })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Field 4: Select Service */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Select Service <span className="text-[#00ff88]">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('service', { required: 'Please select a creative service.' })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c100e] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-500">-- Select a Creative Service --</option>
                    {servicesList.map((srv, idx) => (
                      <option key={idx} value={srv} className="text-white bg-[#0c100e]">
                        {srv}
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
                  Requirements / Project Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your project style, timeline, reference links, etc."
                  {...register('requirements')}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all resize-none"
                />
              </div>

              {/* Step 1 CTA: Review Booking Details */}
              <button
                type="submit"
                className="w-full mt-3 py-4 px-6 rounded-xl font-extrabold text-xs uppercase tracking-widest bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black hover:opacity-95 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Review Booking Details</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: "CHECK AT ONCE" REVIEW SCREEN                                     */}
        {/* ========================================================================= */}
        {currentStep === 2 && activeReviewData && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-extrabold tracking-widest uppercase mb-2">
                <span>🔍</span> Step 2 of 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Please Review Your Details
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Please check your information once before confirming.
              </p>
            </div>

            {/* Summary Review Card */}
            <ReviewCard data={activeReviewData} />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToEdit}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                ← Edit Details
              </button>

              <button
                type="button"
                onClick={handleFinalConfirmBooking}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] hover:opacity-95 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Sending Confirmation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Book Now</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINAL SUCCESS CONFIRMATION SCREEN                                 */}
        {/* ========================================================================= */}
        {currentStep === 3 && bookingSuccessData && (
          <SuccessConfirmation successData={bookingSuccessData} onReset={handleReset} />
        )}

      </div>
    </div>
  );
}

export default memo(BookingForm);
