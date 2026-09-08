'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';

/**
 * WhatsApp Icon SVG Component
 */
const WhatsAppIcon = memo(function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
});

/**
 * Mail / Gmail Icon SVG Component
 */
const MailIcon = memo(function MailIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
});

/**
 * VerifyDetailsModal Component
 */
function VerifyDetailsModal({
  isOpen = true,
  onClose,
  onEdit,
  bookingData = {}
}) {
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null); // { success: boolean, message: string }

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

  if (!isOpen) return null;

  // Extract and normalize booking details
  const name = bookingData.name || bookingData.fullName || 'Rahul Sharma';
  const mobile = bookingData.mobile || bookingData.phone || '+91 93906 62637';
  const email = bookingData.email || 'client@gmail.com';
  const service = bookingData.service || 'Video Editing (4K / Cinematic)';
  const selectedDate = bookingData.selectedDate || bookingData.date || 'Immediate / Flexible';
  const selectedSlot = bookingData.selectedSlot || bookingData.slot || 'Morning (10:00 AM - 01:00 PM)';
  const projectBrief = bookingData.projectBrief || bookingData.requirements || bookingData.notes || 'Cinematic reel editing with color grading and sound design.';

  // Format clean international phone for WhatsApp URL
  const destinationWhatsApp = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '919390662637';

  // 1. ACTION: Forward via WhatsApp
  const handleWhatsAppForward = () => {
    // Construct beautifully formatted message with URI encoded line breaks (%0A)
    const formattedMessage = 
      `📌 *New Slot Confirmed by Client*%0A` +
      `• *Client:* ${encodeURIComponent(name)}%0A` +
      `• *Phone:* ${encodeURIComponent(mobile)}%0A` +
      `• *Email:* ${encodeURIComponent(email)}%0A` +
      `• *Service:* ${encodeURIComponent(service)}%0A` +
      `• *Date:* ${encodeURIComponent(selectedDate)}%0A` +
      `• *Slot:* ${encodeURIComponent(selectedSlot)}%0A` +
      `• *Project Brief:* ${encodeURIComponent(projectBrief)}`;

    const whatsappUrl = `https://wa.me/${destinationWhatsApp}?text=${formattedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. ACTION: Forward via Gmail (Nodemailer Backend Dispatch)
  const handleGmailForward = async () => {
    setIsSendingGmail(true);
    setGmailStatus(null);

    try {
      const response = await fetch('/api/complete-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: name,
          mobile: mobile,
          email: email,
          service: service,
          selectedDate: selectedDate,
          selectedSlot: selectedSlot,
          requirements: projectBrief,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGmailStatus({
          success: true,
          message: 'Booking details dispatched to business Gmail successfully!'
        });

        // Open directly in Google Gmail Web Composer (bypasses Outlook / desktop apps)
        const gmSubject = `🎬 ARNE Booking Request: ${name} (${service})`;
        const gmBody = `Hi ARNE Works Team,\n\nI have submitted my booking request on your studio website.\n\nClient Name: ${name}\nMobile: ${mobile}\nEmail: ${email}\nService: ${service}\nSlot: ${selectedDate} (${selectedSlot})\n\nProject Brief / Notes:\n${projectBrief}\n\nLooking forward to your response.`;
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=arneworks26@gmail.com&su=${encodeURIComponent(gmSubject)}&body=${encodeURIComponent(gmBody)}`,
          '_blank',
          'noopener,noreferrer'
        );
      } else {
        throw new Error(data.message || 'Failed to dispatch Gmail notification.');
      }
    } catch (err) {
      console.error('[Gmail Forward Error]:', err);
      setGmailStatus({
        success: false,
        message: err.message || 'Network error sending details to Gmail. Please try WhatsApp.'
      });
    } finally {
      setIsSendingGmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#00ff88]/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,255,136,0.08)] text-white font-sans my-auto transition-all">
        
        {/* Top Close / Dismiss Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {/* 1. Centered Header */}
        <div className="text-center mb-6">
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

        {/* 2. Section Title & Divider */}
        <div className="mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-wider uppercase text-gray-300">
            Client Details
          </h3>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-[11px] font-bold text-[#00ff88] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>✏️</span> Edit
            </button>
          )}
        </div>

        {/* 3. Data Display List */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 text-xs space-y-3 divide-y divide-white/5">
          {/* Name */}
          <div className="flex justify-between items-center pt-1 first:pt-0">
            <span className="text-gray-400 font-medium">Name:</span>
            <span className="font-bold text-white text-right">{name}</span>
          </div>

          {/* Mobile Number */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Mobile Number:</span>
            <span className="font-mono font-bold text-[#00ff88] text-right">{mobile}</span>
          </div>

          {/* Email */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Email:</span>
            <span className="font-medium text-gray-200 text-right truncate max-w-[200px]">{email}</span>
          </div>

          {/* Service */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Service:</span>
            <span className="font-bold text-white text-right">{service}</span>
          </div>

          {/* Selected Date */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Selected Date:</span>
            <span className="font-semibold text-gray-200 text-right">{selectedDate}</span>
          </div>

          {/* Selected Slot */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Selected Slot:</span>
            <span className="font-semibold text-gray-200 text-right">{selectedSlot}</span>
          </div>

          {/* Project Brief */}
          <div className="pt-3">
            <span className="block text-gray-400 font-medium mb-1.5">Project Brief:</span>
            <p className="text-gray-300 leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5 break-words">
              {projectBrief}
            </p>
          </div>
        </div>

        {/* Gmail Status Alert */}
        {gmailStatus && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
            gmailStatus.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span>{gmailStatus.success ? '✓' : '⚠️'}</span>
            <span className="font-medium">{gmailStatus.message}</span>
          </div>
        )}

        {/* 4. Action Buttons (Side-by-Side: WhatsApp & Gmail) */}
        <div className="mt-6 pt-2">
          <p className="text-[11px] text-center text-gray-400 mb-3 font-medium">
            Forward your verified booking request via:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: WhatsApp (Green) */}
            <button
              type="button"
              onClick={handleWhatsAppForward}
              className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </button>

            {/* Button 2: Gmail (Emerald Green) */}
            <button
              type="button"
              onClick={handleGmailForward}
              disabled={isSendingGmail}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700/60 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
            >
              {isSendingGmail ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <MailIcon className="w-4 h-4 text-white" />
                  <span>Gmail</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Back / Edit Action */}
        {onEdit && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Edit Details
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default memo(VerifyDetailsModal);
