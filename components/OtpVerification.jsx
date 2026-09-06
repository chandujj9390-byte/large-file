'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialization
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Premium Dark Cinematic OTP Verification Component
 * 
 * Props:
 * - phoneNumber: string (e.g. "9390662637" or "+919390662637")
 * - onSuccess: function(sessionData) - Callback invoked on successful verification
 * - onBack: function() - Callback to go back to previous phone entry step
 * - redirectUrl: string (optional, e.g. "/confirmation" or "/booking-success")
 */
export default function OtpVerification({
  phoneNumber = '',
  onSuccess,
  onBack,
  redirectUrl = '/confirmation'
}) {
  // 6-digit state array for individual digit boxes
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(60); // 60s Resend Timer

  // Input refs for auto-focusing between boxes
  const inputRefs = useRef([]);

  // Ensure phone has +91 prefix
  const formatPhoneNumber = (phone) => {
    const raw = (phone || '').replace(/[\s\-()]/g, '');
    if (!raw) return '+91';
    if (raw.startsWith('+91')) return raw;
    if (raw.startsWith('+')) return raw;
    const cleanDigits = raw.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
    return `+91${tenDigits}`;
  };

  const formattedPhone = formatPhoneNumber(phoneNumber);

  // 60-Second Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus the first input box on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle single digit typing & auto-focus shift
  const handleDigitChange = (index, value) => {
    setErrorMsg('');
    const cleanVal = value.replace(/\D/g, '');

    // If typing/replacing single digit
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal ? cleanVal.slice(-1) : '';
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace, Arrow Keys & Navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedText) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedText.length; i++) {
      newDigits[i] = pastedText[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pastedText.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Submit & Verify OTP via Supabase Auth
  const handleVerifyOtp = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setErrorMsg('');
    setSuccessMsg('');

    const enteredOtp = otpDigits.join('');

    // Client-side length validation
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Call Supabase verifyOtp API
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: enteredOtp,
        type: 'sms'
      });

      if (error) {
        console.error('[Supabase OTP Verification Error]:', error.message);
        throw new Error(error.message || 'Invalid OTP, please try again.');
      }

      // 2. Verification Successful
      setSuccessMsg('Phone verified successfully! Redirecting...');
      console.log('[Supabase Auth Success]:', data);

      // Trigger custom success callback or Next.js navigation
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      } else {
        // Next.js / Browser client navigation fallback
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl;
          }
        }, 800);
      }
    } catch (err) {
      console.error('[OTP Verify Error]:', err);
      // Clean readable error message display without crashing
      const message = err.message || '';
      if (message.toLowerCase().includes('expired')) {
        setErrorMsg('OTP code has expired. Please click Resend OTP.');
      } else if (message.toLowerCase().includes('invalid')) {
        setErrorMsg('Invalid OTP code. Please double-check and try again.');
      } else {
        setErrorMsg(message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP via Twilio / Supabase
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;

    setErrorMsg('');
    setSuccessMsg('');
    setResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('A new 6-digit OTP code has been sent via SMS.');
      setCountdown(60); // Reset 60-second timer
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('[Resend OTP Error]:', err);
      setErrorMsg(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const isComplete = otpDigits.every((d) => d !== '');

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Dark Cinematic Frosted Glass Card */}
      <div className="relative rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(0,255,136,0.08)]">
        
        {/* Glow Accent Circle */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#00ff88]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xl mb-3 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
            🔒
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            Verify Your Number
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            We sent a 6-digit verification code to
          </p>
          <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white font-mono text-xs font-semibold">
            <span>🇮🇳</span> {formattedPhone}
          </div>
        </div>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="text-sm">✓</span>
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {/* 6-Digit Individual Boxes */}
          <div className="flex justify-between items-center gap-2 sm:gap-3">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`w-11 sm:w-12 h-14 text-center text-xl font-bold font-mono rounded-xl bg-white/[0.04] text-white border transition-all duration-200 outline-none
                  ${digit ? 'border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_15px_rgba(0,255,136,0.15)]' : 'border-white/10 hover:border-white/20 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]'}
                  disabled:opacity-50`}
              />
            ))}
          </div>

          {/* Verify & Proceed Button */}
          <button
            type="submit"
            disabled={loading || !isComplete}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-[#00ff88] via-[#10b981] to-[#00cc6a] text-black hover:opacity-95 hover:shadow-[0_0_25px_rgba(0,255,136,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Confirm & Proceed</span>
                <span className="text-base leading-none">→</span>
              </>
            )}
          </button>

          {/* Navigation & 60-Second Resend Countdown */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
            {typeof onBack === 'function' ? (
              <button
                type="button"
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Edit Number
              </button>
            ) : (
              <span />
            )}

            <div className="text-right">
              {countdown > 0 ? (
                <span className="text-gray-500 font-mono">
                  Resend code in <strong className="text-gray-300">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[#00ff88] font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend OTP ↻'}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Security Badge */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-500">
          <span>🔒</span> End-to-end 256-bit encrypted authentication via Supabase & Twilio
        </div>
      </div>
    </div>
  );
}
