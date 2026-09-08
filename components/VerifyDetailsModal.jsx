'use client';

import React, { useEffect, useCallback, memo } from 'react';

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
 * Displays verified details with direct WhatsApp and direct mailto: Gmail compose.
 */
function VerifyDetailsModal({
  isOpen = true,
  onClose,
  onEdit,
  bookingData = {}
}) {
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

  // Extract and normalize booking details
  const name = bookingData.name || bookingData.fullName || 'Client';
  const mobile = bookingData.mobile || bookingData.phone || '+91 93906 62637';
  const email = bookingData.email || 'client@gmail.com';
  const service = bookingData.service || 'Video Editing (4K / Cinematic)';
  const selectedDate = bookingData.selectedDate || bookingData.date || 'Immediate / Flexible';
  const selectedSlot = bookingData.selectedSlot || bookingData.slot || 'Morning (10:00 AM - 01:00 PM)';
  const projectBrief = bookingData.projectBrief || bookingData.requirements || bookingData.notes || 'No additional notes specified.';

  // 1. ACTION: Forward via WhatsApp
  const handleWhatsAppForward = useCallback(() => {
    const destinationWhatsApp = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '919390662637';
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
  }, [name, mobile, email, service, selectedDate, selectedSlot, projectBrief]);

  if (!isOpen) return null;

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
            aria-label="Close details modal"
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-xs"
          >
            ✕
          </button>
        )}

        {/* 1. Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 mb-3 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
            <CheckCircleIcon className="w-6 h-6 text-[#00ff88]" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white uppercase">
            Verify Your Booking
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Please review the details below before forwarding your slot confirmation.
          </p>
        </div>

        {/* 2. Compact Booking Metadata Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/[0.03] border border-white/5 rounded-2xl mb-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-gray-300">
            <span className="text-gray-500">ID:</span>
            <span className="text-[#00ff88] font-bold">{bookingId}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Studio:</span>
            <span className="text-white font-semibold">ARNE Works</span>
          </div>
        </div>

        {/* 3. Detailed Data Summary Container */}
        <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 text-xs divide-y divide-white/5">
          {/* Row: Client Name */}
          <div className="flex justify-between items-center pb-1">
            <span className="text-gray-400 font-medium">Client Name:</span>
            <span className="font-bold text-white text-right">{name}</span>
          </div>

          {/* Row: Mobile Number */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Contact Number:</span>
            <span className="font-bold text-[#00ff88] font-mono text-right">{mobile}</span>
          </div>

          {/* Row: Email */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Email Address:</span>
            <span className="font-medium text-gray-200 text-right">{email}</span>
          </div>

          {/* Row: Service */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Service Selected:</span>
            <span className="font-bold text-white text-right">{service}</span>
          </div>

          {/* Row: Date */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Preferred Date:</span>
            <span className="font-semibold text-gray-200 text-right">{selectedDate}</span>
          </div>

          {/* Row: Slot */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-400 font-medium">Preferred Slot:</span>
            <span className="font-semibold text-gray-200 text-right">{selectedSlot}</span>
          </div>

          {/* Row: Project Brief / Notes */}
          <div className="pt-3">
            <span className="block text-gray-400 font-medium mb-1">Project Brief / Notes:</span>
            <p className="text-gray-300 leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
              {projectBrief}
            </p>
          </div>
        </div>

        {/* 4. Action Button (WhatsApp Direct) */}
        <div className="mt-6 pt-2">
          <p className="text-[11px] text-center text-gray-400 mb-3 font-medium">
            Forward your verified booking request via:
          </p>

          <div>
            {/* Button: WhatsApp (Solid Green) */}
            <button
              type="button"
              onClick={handleWhatsAppForward}
              className="w-full py-3.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Continue via WhatsApp</span>
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
