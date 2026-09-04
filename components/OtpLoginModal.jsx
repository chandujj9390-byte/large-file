'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Compact & Professional Mobile Number OTP Login Modal Component
 * 
 * - Max Width: 390px (Small, sleek & elegant)
 * - Country Code prefix pill (+91)
 * - Error resilience for Supabase SMS provider setup
 */
export default function OtpLoginModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPhoneNumber('');
      setOtpCode('');
      setStep('phone');
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format phone with mandatory international country code (+91)
  const getFormattedPhone = (inputPhone) => {
    const raw = (inputPhone || phoneNumber || '').trim().replace(/[\s\-()]/g, '');
    if (!raw) return '';
    if (raw.startsWith('+')) return raw;
    if (raw.length === 10) return `+91${raw}`;
    if (raw.length === 12 && raw.startsWith('91')) return `+${raw}`;
    return `+91${raw}`;
  };

  // Step 1: Send OTP to Client Mobile Number
  const handleSendOtp = async (e) => {
    // 1. Prevent Default Behavior as absolute first step
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setErrorMsg('');

    // 1. Validate Gmail Address
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid Gmail / email address.');
      return;
    }

    // 2. Enforce Country Code (+91 default)
    const formatted = getFormattedPhone(phoneNumber);
    const numericOnly = formatted.replace(/\D/g, '');
    if (!formatted || numericOnly.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    setLoading(true);

    // 3. Strict Try/Catch Block around Supabase Authentication
    try {
      let sent = false;
      try {
        const formattedPhoneNumber = formatted;
        console.log("SENDING TO:", formattedPhoneNumber);
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhoneNumber
        });
        if (error) {
          console.error("SUPABASE OTP ERROR:", error.message, error.status);
          alert(error.message);
        } else {
          sent = true;
        }
      } catch (sbErr) {
        console.error("SUPABASE OTP ERROR:", sbErr.message, sbErr.status);
        alert(sbErr.message);
      }

      if (!sent) {
        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formatted, digits: 6 })
        });
        const resData = await res.json();
        if (resData && resData.success) {
          sent = true;
        }
      }

      setStep('otp');
      setResendTimer(45);
    } catch (err) {
      console.error('[OTP Send Error]:', err);
      setErrorMsg(err.message || 'Failed to send OTP verification SMS. Please verify your phone number.');
    } finally {
      // 4. Guaranteed Loading State Reset (Never hangs in loading state)
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const formatted = getFormattedPhone();
    const clientEmail = (email || '').trim().toLowerCase() || `client.${formatted.replace(/\D/g, '')}@gmail.com`;
    let verified = false;
    let authUser = null;

    try {
      // 1. Attempt Supabase direct verify
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formatted,
          token: otpCode.trim(),
          type: 'sms'
        });
        if (!error && data?.user) {
          verified = true;
          authUser = data.user;
        }
      } catch (_) {}

      // 2. Attempt Serverless Verify
      if (!verified) {
        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formatted, otp: otpCode.trim() })
        });
        const data = await res.json();
        if (data && data.success) {
          verified = true;
          authUser = data.user || {
            id: `client_${formatted.replace(/\D/g, '').slice(-10)}`,
            phone: formatted,
            email: clientEmail,
            role: 'authenticated'
          };
        } else {
          throw new Error(data?.message || 'Invalid or expired 6-digit verification code.');
        }
      }

      if (authUser) {
        authUser.email = clientEmail;
      }
    } catch (err) {
      console.error('[Verify OTP Error]', err);
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
      setLoading(false);
      return;
    }

    if (verified) {
      // Save client profile to Supabase
      try {
        const displayName = clientEmail.includes('@') ? clientEmail.split('@')[0] : `Client (${formatted.slice(-4)})`;
        await supabase.from('customers').insert([{
          full_name: displayName,
          mobile: formatted,
          whatsapp: formatted,
          email: clientEmail
        }]);
      } catch (_) {}

      if (onSuccess) onSuccess({ user: authUser });
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[390px] bg-gradient-to-b from-[#090e0b] to-[#040605] border border-[#00ff88]/30 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(0,255,136,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/25 text-[#00ff88] flex items-center justify-center mx-auto mb-2.5 text-xs font-black tracking-widest font-mono">
            {step === 'phone' ? 'ARNE' : '🔒'}
          </div>
          <h2 className="text-lg font-black tracking-wide text-white">
            {step === 'phone' ? 'CLIENT ACCESS PORTAL' : 'VERIFY CODE'}
          </h2>
          <p className="text-[11px] text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
            {step === 'phone'
              ? 'Enter your registered mobile number to receive a 6-digit OTP verification code.'
              : `Enter the 6-digit code sent via SMS to ${getFormattedPhone()}`}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Phone & Email Form */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Gmail Address *
              </label>
              <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88] transition-all overflow-hidden">
                <span className="px-3 py-3 text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border-r border-white/10 whitespace-nowrap">
                  ✉️
                </span>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Registered Mobile Number *
              </label>
              <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-[#00ff88] focus-within:ring-1 focus-within:ring-[#00ff88] transition-all overflow-hidden">
                <span className="px-3 py-3 text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 border-r border-white/10 whitespace-nowrap">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  placeholder="ENTER MOBILE NUMBER"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-3 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                  required
                />
              </div>
              <span className="block text-[10px] text-gray-500 mt-1">
                Instant secure SMS verification code
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-95 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP ↗'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Enter 6-Digit SMS Code *
              </label>
              <input
                type="text"
                placeholder="••••••"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] text-white text-center text-lg tracking-[0.4em] font-mono font-bold outline-none placeholder-gray-700 transition-colors"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:opacity-95 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Code...' : 'Verify & Complete Login 🔒'}
            </button>

            <div className="flex items-center justify-between text-[11px] pt-1">
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
                className="text-[#00ff88] hover:underline disabled:text-gray-600 disabled:no-underline font-semibold"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
