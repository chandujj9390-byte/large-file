'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';

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
 * Modal Ambient Glow (Memoized)
 */
const ModalGlow = memo(function ModalGlow() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#00ff88]/10 blur-[160px] rounded-full pointer-events-none" />
  );
});

/**
 * Modal Step Progress Bar (Memoized)
 */
const ModalProgressBar = memo(function ModalProgressBar({ step }) {
  if (step >= 3) return null;
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
      <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
    </div>
  );
});

/**
 * BookingModal Review Details Card (Memoized)
 */
const ModalReviewCard = memo(function ModalReviewCard({ data }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3 text-xs divide-y divide-white/5">
      <div className="flex justify-between items-center pt-1 first:pt-0">
        <span className="text-gray-400 font-medium">Name:</span>
        <span className="font-bold text-white text-right">{data.fullName}</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Mobile Number:</span>
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
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Selected Date:</span>
        <span className="font-semibold text-gray-200 text-right">Immediate / Flexible</span>
      </div>
      <div className="flex justify-between items-center pt-3">
        <span className="text-gray-400 font-medium">Selected Slot:</span>
        <span className="font-semibold text-gray-200 text-right">Morning (10:00 AM - 01:00 PM)</span>
      </div>
      <div className="pt-3">
        <span className="block text-gray-400 font-medium mb-1">Project Brief:</span>
        <p className="text-gray-300 leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5">
          {data.requirements?.trim() || 'No additional requirements specified.'}
        </p>
      </div>
    </div>
  );
});

/**
 * BookingModal Success View (Memoized)
 */
const ModalSuccessView = memo(function ModalSuccessView({ data, onClose }) {
  return (
    <div className="text-center py-3 sm:py-5 space-y-4 animate-in fade-in">
      <div className="w-14 h-14 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/40 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_25px_rgba(0,255,136,0.3)] animate-pulse">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
          Booking Reference #{data.bookingId}
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Booking Submitted!
        </h2>
        <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
          We have received your request and our team will contact you shortly.
        </p>
      </div>

      {/* Direct WhatsApp Quick Action */}
      <div className="text-left my-2">
        <a
          href={`https://wa.me/919390662637?text=${encodeURIComponent(
            `Hi ARNE Works, I have submitted booking #${data.bookingId} for ${data.service}. Name: ${data.fullName}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <span className="block text-[9px] font-extrabold text-[#25D366] uppercase">Business WhatsApp</span>
              <span className="block text-sm font-bold text-white font-mono">+91 9390662637</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#25D366] text-right">Chat on WhatsApp ↗</span>
        </a>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer"
      >
        Done & Close
      </button>
    </div>
  );
});

/**
 * BookingModal — High-Performance Cinematic Next.js Booking Modal
 * Uses react-hook-form uncontrolled inputs to completely eliminate keystroke input lag.
 */
function BookingModal({ isOpen, onClose }) {
  // Step state: 1 = Form, 2 = Review Details, 3 = Success Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Uncontrolled form state
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
      mobile: '',
      email: '',
      service: '',
      requirements: ''
    }
  });

  // Manage body scroll lock and cleanup safely
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const servicesList = useMemo(() => ARNE_SERVICES, []);

  // Step 1 -> Step 2: Validate and Transition to Review Screen
  const handleProceedToReview = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(2);
  }, []);

  // Step 2 -> Step 1: Back to Edit Details (Preserves all state)
  const handleBackToEdit = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(1);
  }, []);

  // Step 2 -> Step 3: Confirm & Submit Verified Payload to Backend
  const handleFinalConfirmBooking = useCallback(async () => {
    setSubmissionError('');
    setLoading(true);

    const formValues = getValues();
    const cleanMobile = (formValues.mobile || '').replace(/\D/g, '');
    const formattedPhone = cleanMobile.startsWith('91') && cleanMobile.length === 12
      ? `+${cleanMobile}`
      : (cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile.slice(-10)}`);

    try {
      const response = await fetch('/api/complete-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formValues.fullName.trim(),
          mobile: formattedPhone,
          email: formValues.email.trim().toLowerCase(),
          service: formValues.service,
          requirements: formValues.requirements?.trim() || 'No specific requirements specified.'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking request.');
      }

      setBookingSuccessData({
        bookingId: data.bookingId || data.id || `ARNE-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: formValues.fullName.trim(),
        service: formValues.service,
        email: formValues.email.trim().toLowerCase(),
        mobile: formattedPhone,
        requirements: formValues.requirements?.trim() || ''
      });

      setCurrentStep(3);
    } catch (err) {
      console.error('[Booking Submit Error]:', err);
      setSubmissionError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getValues]);

  const handleModalClose = useCallback(() => {
    setSubmissionError('');
    setCurrentStep(1);
    setBookingSuccessData(null);
    reset();
    onClose?.();
  }, [onClose, reset]);

  const activeReviewData = useMemo(() => {
    return currentStep === 2 ? getValues() : null;
  }, [currentStep, getValues]);

  if (!isOpen) return null;

  const firstError = errors.fullName?.message || errors.mobile?.message || errors.email?.message || errors.service?.message || submissionError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Background Ambient Glow */}
      <ModalGlow />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-lg bg-[#0c100e]/95 border border-[#00ff88]/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(0,255,136,0.1)] text-white font-sans transition-all my-auto">
        
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step Progress Bar */}
        <ModalProgressBar step={currentStep} />

        {/* Error Alert Box */}
        {firstError && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{firstError}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CLIENT DETAILS FORM (react-hook-form Uncontrolled Inputs)          */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 mb-1.5">
                <span className="font-black text-xl tracking-[0.2em] text-white">ARNE STORIES</span>
                <span className="text-[#00ff88] text-xs">✦</span>
              </div>
              <h2 className="text-xl font-bold tracking-wide text-gray-100">
                Book a Creative Slot
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter your project details below, then review them before confirmation.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleProceedToReview)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Full Name <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...register('fullName', {
                    required: 'Please enter your full name.',
                    minLength: { value: 2, message: 'Name must be at least 2 characters.' }
                  })}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              {/* Mobile Number & Client Gmail (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                    Mobile Number <span className="text-[#00ff88]">*</span>
                  </label>
                  <div className="flex bg-white/[0.04] border border-white/10 focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88] rounded-xl overflow-hidden transition-colors">
                    <span className="px-3 py-3 text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border-r border-white/10 flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      inputMode="numeric"
                      {...register('mobile', {
                        required: 'Please enter your 10-digit mobile number.',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit mobile number.'
                        }
                      })}
                      className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
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
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Select Service <span className="text-[#00ff88]">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('service', { required: 'Please select a creative service.' })}
                    className="w-full bg-[#0c100e] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
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

              {/* Project Brief */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Project Brief / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your style, timeline, reference links..."
                  {...register('requirements')}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Step 1 Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black font-extrabold text-xs uppercase tracking-widest hover:opacity-95 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>Proceed to Review Details</span>
                <span>→</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: "CHECK AT ONCE" REVIEW SCREEN                                     */}
        {/* ========================================================================= */}
        {currentStep === 2 && activeReviewData && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-left mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-extrabold tracking-widest uppercase mb-1.5">
                <span>🔍</span> Step 2 of 2: Review Screen
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Review Details Before Confirmation
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Please check your information once before confirming.
              </p>
            </div>

            {/* Section Title & Divider */}
            <div className="mb-2 pb-2 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-extrabold tracking-wider uppercase text-gray-300">
                Client Details
              </h3>
              <button
                type="button"
                onClick={handleBackToEdit}
                className="text-[11px] font-bold text-[#00ff88] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>✏️</span> Edit Details
              </button>
            </div>

            {/* Summary Review Card */}
            <ModalReviewCard data={activeReviewData} />

            {/* Forwarding Options (WhatsApp & Gmail) */}
            <div className="pt-2">
              <p className="text-[11px] text-center text-gray-400 mb-3 font-medium">
                Forward your verified booking request via:
              </p>

              <div>
                {/* Button: WhatsApp (Solid Green) */}
                <button
                  type="button"
                  onClick={() => {
                    const formattedMsg = 
                      `📌 *New Slot Confirmed by Client*%0A` +
                      `• *Client:* ${encodeURIComponent(activeReviewData.fullName)}%0A` +
                      `• *Phone:* %2B91${encodeURIComponent(activeReviewData.mobile ? activeReviewData.mobile.replace(/\D/g, '').slice(-10) : '')}%0A` +
                      `• *Email:* ${encodeURIComponent(activeReviewData.email)}%0A` +
                      `• *Service:* ${encodeURIComponent(activeReviewData.service)}%0A` +
                      `• *Date:* Immediate%20%2F%20Flexible%0A` +
                      `• *Slot:* Morning%20(10:00%20AM%20-%2001:00%20PM)%0A` +
                      `• *Project Brief:* ${encodeURIComponent(activeReviewData.requirements?.trim() || 'No specific notes.')}`;
                    const waNum = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '919390662637';
                    window.open(`https://wa.me/${waNum}?text=${formattedMsg}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
                  </svg>
                  <span>Continue on WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Edit Details
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: FINAL SUCCESS CONFIRMATION SCREEN                                 */}
        {/* ========================================================================= */}
        {currentStep === 3 && bookingSuccessData && (
          <ModalSuccessView data={bookingSuccessData} onClose={handleModalClose} />
        )}

      </div>
    </div>
  );
}

export default memo(BookingModal);
