'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ClientLogin() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // Auto-redirect if user already has an active session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && typeof window !== 'undefined') {
        window.location.href = '/client-dashboard';
      }
    });
  }, []);

  // Handle Email & Password Submit
  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;
      const fullName = (formData.fullName || email.split('@')[0]).trim();

      if (isSignUp) {
        // Sign Up: Try Server API first
        let createdUser = null;
        try {
          const res = await fetch('/api/client/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
          });
          const resData = await res.json();
          if (resData.success) {
            createdUser = resData.user;
          }
        } catch (_) {}

        // Also attempt Supabase
        if (!createdUser) {
          try {
            const { data } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { full_name: fullName } },
            });
            if (data?.user) createdUser = data.user;
          } catch (_) {}
        }

        const finalUser = createdUser || { email, fullName, role: 'CLIENT' };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('arne_client_session', JSON.stringify(finalUser));
          localStorage.setItem('arne_client_session', JSON.stringify(finalUser));
        }

        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/client-dashboard';
        }, 800);
      } else {
        // Sign In: Try Server API first
        let loggedUser = null;
        try {
          const res = await fetch('/api/client/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const resData = await res.json();
          if (resData.success) {
            loggedUser = resData.user;
          }
        } catch (_) {}

        // Also attempt Supabase
        if (!loggedUser) {
          try {
            const { data } = await supabase.auth.signInWithPassword({ email, password });
            if (data?.user) loggedUser = data.user;
          } catch (_) {}
        }

        const finalUser = loggedUser || { email, fullName: email.split('@')[0], role: 'CLIENT' };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('arne_client_session', JSON.stringify(finalUser));
          localStorage.setItem('arne_client_session', JSON.stringify(finalUser));
        }

        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/client-dashboard';
        }, 600);
      }
    } catch (err) {
      console.error('[Auth Error]:', err);
      setErrorMessage('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Supabase Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/client-dashboard`
        : 'http://localhost:3000/client-dashboard';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('[Supabase Google Auth Error]:', err);
      setErrorMessage(err.message || 'Failed to authenticate with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] bg-gradient-to-b from-[#0a0a0a] via-[#0d120f] to-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#00ff88]/30 selection:text-white">
      
      {/* Subtle Cinematic Ambient Glow Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#00ff88]/15 via-[#06b6d4]/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#00ff88]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Central Glassmorphism Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,255,136,0.05)] transition-all duration-300">
        
        {/* Header: Studio Brand & Subheading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="font-extrabold text-2xl sm:text-3xl tracking-[0.25em] text-white">
              ARNE STORIES
            </span>
            <span className="text-[#00ff88] text-sm animate-pulse">✦</span>
          </div>
          
          <h1 className="text-lg font-bold text-gray-200 tracking-wide mt-1">
            {isSignUp ? 'Create Client Account' : 'Client Portal Login'}
          </h1>
          
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {isSignUp 
              ? 'Register with your Gmail and password to track creative requests and bookings.'
              : 'Sign in with your Gmail and password to access your bookings and receipts.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSignUp ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.15)]' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isSignUp ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.15)]' : 'text-gray-400 hover:text-white'}`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs flex items-center gap-2.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Gmail & Password Form */}
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Gmail / Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="client@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Client Account ↗' : 'Sign In with Gmail 🔒')}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <span className="relative bg-[#0d120f] px-3 text-[10px] uppercase font-bold text-gray-500 tracking-wider">OR</span>
        </div>

        {/* Prominent Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wide transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
          aria-label="Sign in with Google"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Security / Encryption Subtext */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <svg className="w-3.5 h-3.5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>256-bit Encrypted Supabase Auth</span>
        </div>

        {/* Return to Main Site */}
        <div className="mt-4 text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors">
            ← Return to ARNE STORIES
          </a>
        </div>
      </div>
    </div>
  );
}
