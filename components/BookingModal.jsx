'use client';

import React, { useState } from 'react';

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
 * BookingModal — 2-Step Cinematic Next.js Booking Flow with Review Screen
 * Step 1: Client Details Form
 * Step 2: "Check at Once" Review Screen (Edit Details / Confirm & Book Now)
 * Step 3: Final Confirmation Screen
 */
export default function BookingModal({ isOpen, onClose }) {
  // Step state: 1 = Form, 2 = Review Details, 3 = Success Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    service: '',
    requirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');

    if (name === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Step 1 -> Step 2: Validate and Transition to Review Screen
  const handleProceedToReview = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setError('');

    const { fullName, mobile, email, service } = formData;

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid Gmail / email address.');
      return;
    }

    if (!service) {
      setError('Please select a creative service.');
      return;
    }

    // Advance to Step 2 Review
    setCurrentStep(2);
  };

  // Step 2 -> Step 1: Back to Edit Details (Preserves all state)
  const handleBackToEdit = () => {
    setError('');
    setCurrentStep(1);
  };

  // Step 2 -> Step 3: Confirm & Submit Verified Payload to Backend
  const handleFinalConfirmBooking = async () => {
    setError('');
    setLoading(true);

    const { fullName, mobile, email, service, requirements } = formData;
    const cleanMobile = mobile.replace(/\D/g, '');
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
          fullName: fullName.trim(),
          mobile: formattedPhone,
          email: email.trim().toLowerCase(),
          service: service,
          requirements: requirements.trim() || 'No specific requirements specified.'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking request.');
      }

      // Successful Booking -> Switch to Step 3
      setBookingSuccessData({
        bookingId: data.bookingId || data.id || `ARNE-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: fullName.trim(),
        service: service,
        email: email.trim().toLowerCase(),
        mobile: formattedPhone,
        requirements: requirements.trim()
      });

      setCurrentStep(3);
    } catch (err) {
      console.error('[Booking Submit Error]:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError('');
    setCurrentStep(1);
    setBookingSuccessData(null);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#00ff88]/10 blur-[160px] rounded-full pointer-events-none" />

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
        {currentStep < 3 && (
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CLIENT DETAILS FORM                                               */}
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

            <form onSubmit={handleProceedToReview} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Full Name <span className="text-[#00ff88]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
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
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      inputMode="numeric"
                      required
                      className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                    Client Gmail / Email <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@gmail.com"
                    required
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Selected Service */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Selected Service <span className="text-[#00ff88]">*</span>
                </label>
                <div className="relative">
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0c100e] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a creative service...</option>
                    {ARNE_SERVICES.map((srv, idx) => (
                      <option key={idx} value={srv} className="bg-[#0c100e] text-white">
                        {srv}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1.5">
                  Requirements / Project Notes
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your project style, footage length, references, etc."
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Step 1 CTA: Review Booking Details */}
              <button
                type="submit"
                className="w-full mt-2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] hover:opacity-95 text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,136,0.35)] hover:shadow-[0_0_35px_rgba(0,255,136,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Review Booking Details</span>
                <span className="text-base font-bold">→</span>
              </button>

              <p className="text-[11px] text-center text-gray-500 mt-2">
                🔒 You can review and verify all details in the next step before final submission.
              </p>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: "VERIFY DETAILS" SCREEN (FORWARD TO WHATSAPP / GMAIL)              */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-extrabold tracking-widest uppercase mb-2">
                <span>🔍</span> Step 2 of 2
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Verify Details
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Please double-check your booking details before forwarding.
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
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3 text-xs divide-y divide-white/5">
              <div className="flex justify-between items-center pt-1 first:pt-0">
                <span className="text-gray-400 font-medium">Name:</span>
                <span className="font-bold text-white text-right">{formData.fullName}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-400 font-medium">Mobile Number:</span>
                <span className="font-mono font-bold text-[#00ff88] text-right">
                  +91 {formData.mobile.slice(-10)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-400 font-medium">Email:</span>
                <span className="font-medium text-gray-200 text-right">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-400 font-medium">Service:</span>
                <span className="font-bold text-white text-right">{formData.service}</span>
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
                  {formData.requirements.trim() || 'No additional requirements specified.'}
                </p>
              </div>
            </div>

            {/* Forwarding Options (WhatsApp & Gmail) */}
            <div className="pt-2">
              <p className="text-[11px] text-center text-gray-400 mb-3 font-medium">
                Forward your verified booking request via:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Button 1: WhatsApp (Solid Green) */}
                <button
                  type="button"
                  onClick={() => {
                    const formattedMsg = 
                      `📌 *New Slot Confirmed by Client*%0A` +
                      `• *Client:* ${encodeURIComponent(formData.fullName)}%0A` +
                      `• *Phone:* %2B91${encodeURIComponent(formData.mobile.slice(-10))}%0A` +
                      `• *Email:* ${encodeURIComponent(formData.email)}%0A` +
                      `• *Service:* ${encodeURIComponent(formData.service)}%0A` +
                      `• *Date:* Immediate%20%2F%20Flexible%0A` +
                      `• *Slot:* Morning%20(10:00%20AM%20-%2001:00%20PM)%0A` +
                      `• *Project Brief:* ${encodeURIComponent(formData.requirements.trim() || 'No specific notes.')}`;
                    const waNum = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '919390662637';
                    window.open(`https://wa.me/${waNum}?text=${formattedMsg}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Button 2: Gmail (Solid Red) */}
                <button
                  type="button"
                  onClick={handleFinalConfirmBooking}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-700/60 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>Gmail</span>
                    </>
                  )}
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
          <div className="text-center py-3 sm:py-5 space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/40 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_25px_rgba(0,255,136,0.3)] animate-pulse">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                Booking Reference #{bookingSuccessData.bookingId}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
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
                  `Hi ARNE Works, I have submitted booking #${bookingSuccessData.bookingId} for ${bookingSuccessData.service}. Name: ${bookingSuccessData.fullName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] transition-all"
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
                  `ARNE Booking: ${bookingSuccessData.bookingId} - ${bookingSuccessData.fullName}`
                )}&body=${encodeURIComponent(
                  `Hi ARNE Works Team,\n\nI have submitted my booking #${bookingSuccessData.bookingId} for ${bookingSuccessData.service}.\nClient Name: ${bookingSuccessData.fullName}\nPhone: ${bookingSuccessData.mobile}\nEmail: ${bookingSuccessData.email}\n\nLooking forward to hearing from you!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-3 rounded-xl bg-[#ea4335]/10 border border-[#ea4335]/30 hover:border-[#ea4335] transition-all"
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
              onClick={handleModalClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
