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

const TIME_SLOTS = [
  'Morning (10:00 AM - 01:00 PM)',
  'Afternoon (02:00 PM - 05:00 PM)',
  'Evening (06:00 PM - 09:00 PM)',
  'Flexible / All Day'
];

/**
 * WhatsApp SVG Icon
 */
function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Mail / Gmail SVG Icon
 */
function MailIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/**
 * BookingVerificationFlow Component
 * Step 1: Input Form (Action: "Review Details")
 * Step 2: "Verify Details" Screen (Actions: "Send via WhatsApp" & "Send via Gmail")
 * Step 3: Confirmation Screen
 */
export default function BookingVerificationFlow({ className = '', onComplete }) {
  const [currentStep, setCurrentStep] = useState(1); // 1 = Form, 2 = Verify, 3 = Confirmation

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    service: '',
    date: '',
    timeSlot: 'Morning (10:00 AM - 01:00 PM)',
    requirements: ''
  });

  const [loadingChannel, setLoadingChannel] = useState(null); // 'whatsapp' | 'gmail' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage('');

    if (name === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Step 1 -> Step 2: Review Details
  const handleProceedToReview = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { fullName, mobile, email, service } = formData;

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!service) {
      setErrorMessage('Please select a creative service.');
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 -> Step 1: Edit Details (State preserved)
  const handleBackToEdit = () => {
    setErrorMessage('');
    setCurrentStep(1);
  };

  // Dispatch via /api/create-pending-booking with Token Security
  const handleDispatchBooking = async (channel) => {
    setErrorMessage('');
    setLoadingChannel(channel);

    const { fullName, mobile, email, service, date, timeSlot, requirements } = formData;
    const cleanMobile = mobile.replace(/\D/g, '');
    const formattedPhone = cleanMobile.startsWith('91') && cleanMobile.length === 12
      ? `+${cleanMobile}`
      : `+91${cleanMobile.slice(-10)}`;

    try {
      const response = await fetch('/api/create-pending-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: formattedPhone,
          email: email.trim().toLowerCase(),
          service: service,
          date: date ? date.trim() : 'Immediate / Flexible',
          timeSlot: timeSlot || 'Morning (10:00 AM - 01:00 PM)',
          requirements: requirements.trim() || 'No additional requirements specified.',
          channel: channel
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to process booking request.');
      }

      // If WhatsApp: Open chat link
      if (channel === 'whatsapp' && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      // If Gmail: Open Google Gmail Web Composer in browser directly (bypasses Outlook)
      if (channel === 'gmail') {
        const gmSubject = `🎬 ARNE Booking Request: ${data.bookingId} - ${fullName} (${service})`;
        const gmBody = `Hi ARNE Works Team,\n\nI have submitted my creative project booking on your studio website.\n\nBooking ID: ${data.bookingId}\nClient Name: ${fullName}\nSelected Service: ${service}\nMobile: ${formattedPhone}\nEmail: ${email}\nSlot: ${date || 'Flexible'} (${timeSlot})\n\nProject Requirements / Notes:\n${requirements}\n\nLooking forward to hearing from you!`;
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=arneworks26@gmail.com&su=${encodeURIComponent(gmSubject)}&body=${encodeURIComponent(gmBody)}`,
          '_blank',
          'noopener,noreferrer'
        );
      }

      setBookingSuccessInfo({
        bookingId: data.bookingId,
        channel: channel,
        fullName: fullName.trim(),
        service: service,
        date: date || 'Flexible',
        timeSlot: timeSlot,
        email: email.trim(),
        mobile: formattedPhone,
        message: data.message || (channel === 'gmail' 
          ? 'Details forwarded via Gmail! We will confirm your slot shortly.' 
          : 'Details forwarded via WhatsApp!')
      });

      setCurrentStep(3);

      if (typeof onComplete === 'function') {
        onComplete(data);
      }
    } catch (err) {
      console.error('[Dispatch Error]:', err);
      setErrorMessage(err.message || 'An error occurred while dispatching booking details.');
    } finally {
      setLoadingChannel(null);
    }
  };

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#00ff88]/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,255,136,0.08)] text-white font-sans transition-all">
        
        {/* Step Progress Indicator */}
        {currentStep < 3 && (
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-white/10'}`} />
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: BOOKING DETAILS INPUT FORM                                        */}
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
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Fill in your project details below, then review them before forwarding.
              </p>
            </div>

            <form onSubmit={handleProceedToReview} className="space-y-4">
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
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all"
                />
              </div>

              {/* Field 2 & 3: Mobile & Email */}
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
                      name="mobile"
                      placeholder="9390662637"
                      maxLength={10}
                      inputMode="numeric"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[#00ff88]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Field 4: Service Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Service Selection <span className="text-[#00ff88]">*</span>
                </label>
                <div className="relative">
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-500">-- Select a Creative Service --</option>
                    {ARNE_SERVICES.map((srv, idx) => (
                      <option key={idx} value={srv} className="text-white bg-[#0a0a0a]">{srv}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Field 5 & 6: Date & Preferred Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Time Slot
                  </label>
                  <div className="relative">
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none transition-all appearance-none cursor-pointer"
                    >
                      {TIME_SLOTS.map((slot, idx) => (
                        <option key={idx} value={slot} className="text-white bg-[#0a0a0a]">{slot}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 7: Project Requirements */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Project Requirements / Notes
                </label>
                <textarea
                  name="requirements"
                  rows={3}
                  placeholder="Describe your project style, timeline, reference links, etc."
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-all resize-none"
                />
              </div>

              {/* CTA Button: Review Details */}
              <button
                type="submit"
                className="w-full mt-3 py-4 px-6 rounded-xl font-extrabold text-xs uppercase tracking-widest bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black hover:opacity-95 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Review Details</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: "VERIFY DETAILS" REVIEW SCREEN                                    */}
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
                Please confirm your information before forwarding.
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
                <span>✏️</span> Edit
              </button>
            </div>

            {/* Review Card */}
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
                <span className="font-semibold text-gray-200 text-right">{formData.date || 'Immediate / Flexible'}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-400 font-medium">Selected Slot:</span>
                <span className="font-semibold text-gray-200 text-right">{formData.timeSlot}</span>
              </div>
              <div className="pt-3">
                <span className="block text-gray-400 font-medium mb-1">Project Requirements:</span>
                <p className="text-gray-300 leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5 break-words">
                  {formData.requirements.trim() || 'No additional requirements specified.'}
                </p>
              </div>
            </div>

            {/* Primary Forwarding Button (WhatsApp) */}
            <div className="pt-2">
              <p className="text-[11px] text-center text-gray-400 mb-3 font-medium">
                Forward your booking request for studio confirmation:
              </p>

              <div>
                {/* Button: WhatsApp (Solid Green) */}
                <button
                  type="button"
                  onClick={() => handleDispatchBooking('whatsapp')}
                  disabled={loadingChannel !== null}
                  className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loadingChannel === 'whatsapp' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening...</span>
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      <span>Send via WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Back to Edit Details */}
            <div className="text-center pt-1">
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
        {/* STEP 3: SUCCESS CONFIRMATION SCREEN                                       */}
        {/* ========================================================================= */}
        {currentStep === 3 && bookingSuccessInfo && (
          <div className="text-center py-2 space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/40 flex items-center justify-center mx-auto text-[#00ff88] shadow-[0_0_25px_rgba(0,255,136,0.3)]">
              ✓
            </div>
            
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold tracking-widest uppercase">
                Booking Reference #{bookingSuccessInfo.bookingId}
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Request Forwarded!
              </h2>
              <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                {bookingSuccessInfo.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setBookingSuccessInfo(null);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] cursor-pointer mt-2"
            >
              Submit Another Booking
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
