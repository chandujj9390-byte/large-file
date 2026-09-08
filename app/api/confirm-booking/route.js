import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Next.js App Router API Route: GET /api/confirm-booking
 * 
 * 1. Validates `id` and `token` from query parameters.
 * 2. Checks Supabase `bookings` table for matching ID and confirmation_token.
 * 3. Updates `status` to 'confirmed' and invalidates the token (sets to null).
 * 4. Renders a cinematic landing response.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  // 1. Validate Input Query Params
  if (!id || !token) {
    return new Response(renderConfirmationHtml({
      success: false,
      title: 'Invalid Confirmation Link',
      message: 'The confirmation URL is missing required security parameters.',
      bookingId: id || 'N/A'
    }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yjgbzipdvhgdftxdlccx.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9fjwQtl2NjYC7OYLmy1pVw_oyc4ru2C';

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 2. Query Supabase for matching record
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('confirmation_token', token)
      .single();

    if (fetchError || !booking) {
      return new Response(renderConfirmationHtml({
        success: false,
        title: 'Confirmation Failed',
        message: 'This booking link is invalid or has already been confirmed.',
        bookingId: id
      }), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 3. Update status to 'confirmed' and invalidate token
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        booking_status: 'confirmed',
        confirmation_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Supabase Update Error]:', updateError.message);
      return new Response(renderConfirmationHtml({
        success: false,
        title: 'Update Error',
        message: 'Database error while marking booking as confirmed. Please try again.',
        bookingId: id
      }), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    console.log(`[Supabase] Booking ${id} successfully confirmed by owner.`);

    // 4. Return Success Landing View
    return new Response(renderConfirmationHtml({
      success: true,
      title: `Slot Successfully Confirmed for ${booking.client_name || booking.customer_name || 'Client'}!`,
      message: 'The slot status has been marked as CONFIRMED in your system and the security token is now deactivated.',
      bookingId: id,
      clientName: booking.client_name || booking.customer_name,
      service: booking.service_type || booking.service_name,
      date: booking.booking_date,
      time: booking.booking_time || booking.time_slot,
      phone: booking.client_phone || booking.customer_phone,
      email: booking.client_email || booking.customer_email
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (err) {
    console.error('[Confirm Booking Error]:', err);
    return new Response(renderConfirmationHtml({
      success: false,
      title: 'Server Error',
      message: 'An unexpected internal error occurred during confirmation.',
      bookingId: id
    }), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

/**
 * Render Standalone Cinematic Responsive HTML View
 */
function renderConfirmationHtml({ success, title, message, bookingId, clientName, service, date, time, phone, email }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? 'Slot Confirmed' : 'Confirmation Status'} — ARNE Stories</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #060907;
      color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
    }
    .glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, ${success ? 'rgba(0,255,136,0.12)' : 'rgba(239,68,68,0.12)'} 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    }
    .card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 540px;
      background: rgba(12, 16, 14, 0.95);
      border: 1px solid ${success ? 'rgba(0, 255, 136, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
      border-radius: 28px;
      padding: 40px 32px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9), 0 0 40px ${success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
      text-align: center;
    }
    .badge-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${success ? 'rgba(0, 255, 136, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
      border: 1px solid ${success ? '#00ff88' : '#ef4444'};
      color: ${success ? '#00ff88' : '#ef4444'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto 20px auto;
    }
    h1 {
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.3;
      margin-bottom: 12px;
    }
    p.desc {
      font-size: 13px;
      color: #a1a1aa;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .details-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 20px;
      text-align: left;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-row:first-child { padding-top: 0; }
    .detail-label { color: #71717a; }
    .detail-value { color: #ffffff; font-weight: 600; text-align: right; }
    .status-tag {
      background: rgba(0, 255, 136, 0.15);
      color: #00ff88;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 14px 24px;
      background: ${success ? 'linear-gradient(135deg, #00ff88 0%, #10b981 100%)' : 'rgba(255,255,255,0.08)'};
      color: ${success ? '#000000' : '#ffffff'};
      border: 1px solid ${success ? 'transparent' : 'rgba(255,255,255,0.15)'};
      border-radius: 14px;
      font-weight: 800;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="card">
    <div class="badge-icon">${success ? '✓' : '⚠️'}</div>
    <h1>${title}</h1>
    <p class="desc">${message}</p>

    ${success && clientName ? `
    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Reference ID:</span>
        <span class="detail-value" style="font-family: monospace; color: #00ff88;">${bookingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Client Name:</span>
        <span class="detail-value">${clientName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service:</span>
        <span class="detail-value">${service || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Slot:</span>
        <span class="detail-value">${date || 'Flexible'} (${time || 'N/A'})</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="status-tag">CONFIRMED</span>
      </div>
    </div>
    ` : ''}

    <a href="/" class="btn">Return to Studio Home</a>
  </div>
</body>
</html>`;
}
