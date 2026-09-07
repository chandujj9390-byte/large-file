'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { printReceipt } from '../utils/generateReceipt';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ClientDashboard({ loginRedirectUrl = '/login' }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Verify User Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (typeof window !== 'undefined') {
            window.location.href = loginRedirectUrl;
          }
          return;
        }

        setSession(session);
        setUser(session.user);
        setLoadingAuth(false);
        fetchUserBookings(session.user.email);
      } catch (err) {
        console.error('[Auth Verification Error]:', err);
        if (typeof window !== 'undefined') {
          window.location.href = loginRedirectUrl;
        }
      }
    }

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession?.user) {
        if (typeof window !== 'undefined') {
          window.location.href = loginRedirectUrl;
        }
      } else {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    return () => subscription?.unsubscribe();
  }, [loginRedirectUrl]);

  // 2. Fetch User Bookings from Supabase
  const fetchUserBookings = async (userEmail) => {
    if (!userEmail) return;
    try {
      setLoadingBookings(true);

      // Query bookings matching either client_email or customer_email
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`client_email.ilike.${userEmail},customer_email.ilike.${userEmail}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Bookings Query Notice]:', error.message);
        // Fallback: fetch all and filter in memory if RLS/filter restriction
        const { data: fallbackData } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        
        const filtered = (fallbackData || []).filter(b => 
          (b.client_email && b.client_email.toLowerCase() === userEmail.toLowerCase()) ||
          (b.customer_email && b.customer_email.toLowerCase() === userEmail.toLowerCase())
        );
        setBookings(filtered);
      } else {
        setBookings(data || []);
      }
    } catch (err) {
      console.error('[Fetch Bookings Error]:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // 3. User Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = loginRedirectUrl;
    }
  };

  // Copy ID to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metric Computations
  const metrics = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => {
      const st = (b.status || b.booking_status || '').toUpperCase();
      return st === 'CONFIRMED' || st === 'SUCCESS' || st === 'PAID';
    }).length;

    const totalSpent = bookings.reduce((sum, b) => {
      const price = Number(b.amount_paid || b.prepaid_amount || b.total_price || 0);
      return sum + price;
    }, 0);

    return { totalBookings, confirmedBookings, totalSpent };
  }, [bookings]);

  // Filtered Bookings for Search
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter(b => 
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.transaction_id && b.transaction_id.toLowerCase().includes(q)) ||
      (b.service_name && b.service_name.toLowerCase().includes(q)) ||
      (b.service_type && b.service_type.toLowerCase().includes(q)) ||
      (b.status && b.status.toLowerCase().includes(q))
    );
  }, [bookings, searchQuery]);

  // Loading Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#060907] flex flex-col items-center justify-center text-white gap-4">
        <div className="w-10 h-10 border-3 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 tracking-wider uppercase font-semibold">Authenticating Client Portal...</p>
      </div>
    );
  }

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Client';
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-[#060907] text-white font-sans selection:bg-[#00ff88]/30 selection:text-white pb-20">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#00ff88]/10 via-[#06b6d4]/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#060907]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group text-white no-underline">
            <span className="font-extrabold text-2xl tracking-widest bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              ARNE
            </span>
            <span className="text-[#00ff88] text-sm group-hover:scale-125 transition-transform">✦</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
              Client Portal
            </span>
          </a>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full object-cover border border-[#00ff88]/40" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#00ff88]/20 text-[#00ff88] font-bold text-xs flex items-center justify-center border border-[#00ff88]/40">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">{userName}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{userEmail}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 transition-all duration-200 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-white via-[#00ff88] to-[#06b6d4] bg-clip-text text-transparent">{userName}</span>
          </h1>
          <p className="text-sm text-gray-400">
            View your studio bookings, milestones, and download official 100% watermark-free delivery receipts.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          
          {/* Metric 1: Total Bookings */}
          <div className="bg-[#0a0f0c]/70 border border-white/10 hover:border-[#00ff88]/30 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Bookings</span>
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
                📁
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics.totalBookings}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime studio orders</p>
          </div>

          {/* Metric 2: Confirmed Slots */}
          <div className="bg-[#0a0f0c]/70 border border-white/10 hover:border-[#00ff88]/30 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00ff88]">Active / Confirmed</span>
              <div className="w-9 h-9 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88]">
                ✓
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{metrics.confirmedBookings}</div>
            <p className="text-xs text-gray-500 mt-1">Verified milestones & slots</p>
          </div>

          {/* Metric 3: Total Value */}
          <div className="bg-[#0a0f0c]/70 border border-white/10 hover:border-[#00ff88]/30 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Total Spent</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                ₹
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              ₹{metrics.totalSpent.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">50% prepaid milestones cleared</p>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-[#0a0f0c]/85 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          
          {/* Header Bar with Search & Refresh */}
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Transaction & Booking History</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30">
                  {filteredBookings.length} {filteredBookings.length === 1 ? 'Record' : 'Records'}
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Official transaction ledger associated with {userEmail}
              </p>
            </div>

            {/* Search Input & Action */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search by ID, service, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00ff88] rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={() => fetchUserBookings(userEmail)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh ledger"
              >
                <svg className={`w-4 h-4 ${loadingBookings ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loadingBookings ? (
              <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs uppercase tracking-wider font-semibold">Loading ledger records...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-4 text-gray-500">
                  📄
                </div>
                <h3 className="text-base font-bold text-white mb-1">No Transactions Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                  {searchQuery 
                    ? `No records match your search query "${searchQuery}".` 
                    : `You don't have any bookings logged with ${userEmail} yet.`}
                </p>
                <a
                  href="/#booking"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#00ff88] to-[#10b981] text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-200"
                >
                  Book a Studio Slot ↗
                </a>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">S.No</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Transaction / Booking ID</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Booking Date</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Service Name</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">Amount</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Status</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredBookings.map((b, index) => {
                    const bookingId = b.id || b.transaction_id || `ARNE-${index + 1}`;
                    const rawStatus = (b.status || b.booking_status || 'CONFIRMED').toUpperCase();
                    
                    const isSuccess = rawStatus === 'CONFIRMED' || rawStatus === 'SUCCESS' || rawStatus === 'PAID';
                    const isFailed = rawStatus === 'FAILED' || rawStatus === 'DECLINED' || rawStatus === 'CANCELLED';
                    const isPending = !isSuccess && !isFailed;

                    const dateStr = b.booking_date 
                      ? new Date(b.booking_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                      : new Date(b.created_at || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

                    const amountValue = Number(b.amount_paid || b.prepaid_amount || b.total_price || 0);

                    return (
                      <tr key={bookingId + index} className="hover:bg-white/[0.03] transition-colors">
                        
                        {/* 1. S.No */}
                        <td className="py-4 px-4 font-mono text-gray-400">
                          {index + 1}
                        </td>

                        {/* 2. Transaction / Booking ID */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white tracking-wider">
                              {bookingId}
                            </span>
                            <button
                              onClick={() => handleCopyId(bookingId)}
                              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              title="Copy Transaction ID"
                            >
                              {copiedId === bookingId ? (
                                <span className="text-[#00ff88] text-[10px]">✓</span>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {b.transaction_id && b.transaction_id !== b.id && (
                            <span className="text-[10px] text-gray-500 font-mono block">
                              Txn: {b.transaction_id}
                            </span>
                          )}
                        </td>

                        {/* 3. Booking Date */}
                        <td className="py-4 px-4 text-gray-300">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                            </svg>
                            <span>{dateStr}</span>
                          </div>
                          {b.booking_time && (
                            <span className="text-[10px] text-gray-500 block ml-5">
                              {b.booking_time}
                            </span>
                          )}
                        </td>

                        {/* 4. Service Name */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-white block">
                            {b.service_name || b.service_type || 'Custom Studio Production'}
                          </span>
                          {b.project_desc && (
                            <span className="text-[10px] text-gray-400 block max-w-xs truncate">
                              {b.project_desc}
                            </span>
                          )}
                        </td>

                        {/* 5. Amount */}
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-white text-sm">
                            {amountValue > 0 ? `₹${amountValue.toLocaleString('en-IN')}` : 'Custom Quote'}
                          </span>
                          {b.prepaid_amount > 0 && (
                            <span className="text-[10px] text-gray-400 block">
                              50% Advance
                            </span>
                          )}
                        </td>

                        {/* 6. Status Badge */}
                        <td className="py-4 px-4 text-center">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                              {rawStatus}
                            </span>
                          )}
                          {isFailed && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/10 border border-red-500/30 text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              {rawStatus}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              {rawStatus}
                            </span>
                          )}
                        </td>

                        {/* 7. Receipt Action */}
                        <td className="py-4 px-4 text-right">
                          {isSuccess ? (
                            <button
                              onClick={() => printReceipt(b, user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#00ff88]/20 border border-white/10 hover:border-[#00ff88]/50 text-gray-200 hover:text-[#00ff88] font-semibold text-xs transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(0,255,136,0.1)] group"
                              title="Download / Print PDF Receipt"
                            >
                              <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Receipt</span>
                            </button>
                          ) : (
                            <span className="text-gray-600 text-[11px] italic">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>ARNE Works Secure Client Portal • All final masters delivered 100% watermark-free upon milestone completion.</p>
        </div>
      </main>
    </div>
  );
}
