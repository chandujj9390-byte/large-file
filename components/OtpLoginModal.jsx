'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Mobile Number OTP Login Modal Component
 * 
 * - Step 1: Input registered mobile number -> sends verification code via supabase.auth.signInWithOtp({ phone })
 * - Step 2: Input 6-digit OTP -> verifies via supabase.auth.verifyOtp({ phone, token, type: 'sms' })
 * - Resend countdown timer & error handling
 * - Built with Tailwind CSS & Glassmorphism Design
 */
export default function OtpLoginModal({ isOpen, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset modal state on open/close
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setOtpCode('');
      setStep('phone');
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format Phone number with international standard (+91 / E.164)
  const getFormattedPhone = () => {
    const raw = phoneNumber.trim().replace(/\s+/g, '');
    if (raw.startsWith('+')) return raw;
    if (raw.length === 10) return `+91${raw}`;
    return `+${raw}`;
  };

  // Step 1: Send OTP to Client's Mobile Number
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const formatted = getFormattedPhone();
    if (!formatted || formatted.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formatted
      });

      if (error) throw error;

      setStep('otp');
      setResendTimer(45); // 45s resend cooldown
    } catch (err) {
      console.error('[Supabase OTP Send Error]', err);
      setErrorMsg(err.message || 'Failed to send OTP verification code. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const formatted = getFormattedPhone();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: otpCode.trim(),
        type: 'sms'
      });

      if (error) throw error;

      if (onSuccess) onSuccess(data?.session);
      onClose();
    } catch (err) {
      console.error('[Supabase OTP Verify Error]', err);
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#070b09] border border-[#00ff88]/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,255,136,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] flex items-center justify-center mx-auto mb-3 text-xl">
            {step === 'phone' ? '📱' : '🔒'}
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            {step === 'phone' ? 'MOBILE OTP LOGIN' : 'VERIFY CODE'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {step === 'phone'
              ? 'Enter your registered phone number to receive a secure login code'
              : `Enter the 6-digit code sent to ${getFormattedPhone()}`}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Phone Number Input Form */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Registered Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-sm outline-none placeholder-gray-600 transition-colors"
                  autoFocus
                  required
                />
              </div>
              <span className="block text-[10px] text-gray-500 mt-1">
                Include country code (e.g. +91 for India)
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-95 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending SMS OTP...</span>
                </>
              ) : (
                <span>Send Verification OTP ↗</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                placeholder="••••••"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-center text-lg tracking-[0.4em] font-mono outline-none placeholder-gray-700 transition-colors"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-95 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & Complete Login 🔒</span>
              )}
            </button>

            {/* Resend Code & Edit Number Controls */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtpCode(''); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Change Number
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleSendOtp}
                className="text-[#00ff88] hover:underline disabled:text-gray-600 disabled:no-underline font-medium"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
