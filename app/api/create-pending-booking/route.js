import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

/**
 * Next.js App Router API Route: /api/create-pending-booking
 * 
 * 1. Generates unique booking_id and cryptographic confirmation_token.
 * 2. Saves pending record into Supabase `bookings` table.
 * 3. Builds secure One-Click Owner Confirmation URL.
 * 4. Dispatches via WhatsApp payload or Nodemailer Gmail with "CONFIRM THIS SLOT" button.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName,
      mobile,
      email,
      service,
      date,
      timeSlot,
      requirements,
      channel = 'whatsapp'
    } = body;

    // Validate Required Inputs
    if (!fullName || !mobile || !email || !service) {
      return NextResponse.json(
        { success: false, message: 'Full Name, Mobile Number, Email, and Service are required.' },
        { status: 400 }
      );
    }

    // 1. Generate Unique ID and Cryptographic Token
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const bookingId = body.bookingId || `ARNE-2026-${randomCode}`;
    const confirmationToken = crypto.randomBytes(24).toString('hex');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();
    const cleanService = service.trim();
    const cleanDate = date && date.trim() ? date.trim() : 'Immediate / Flexible';
    const cleanSlot = timeSlot && timeSlot.trim() ? timeSlot.trim() : 'Morning (10:00 AM - 01:00 PM)';
    const cleanNotes = requirements && requirements.trim() ? requirements.trim() : 'No additional requirements specified.';

    // Determine Base Domain for Confirmation Link
    const host = req.headers.get('host') || 'localhost:8765';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const domain = `${protocol}://${host}`;
    const confirmationUrl = `${domain}/api/confirm-booking?id=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(confirmationToken)}`;

    // 2. Insert Pending Record into Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
    
    let dbSuccess = false;
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { error: insertError } = await supabase.from('bookings').upsert([
          {
            id: bookingId,
            client_name: cleanName,
            customer_name: cleanName,
            client_email: cleanEmail,
            customer_email: cleanEmail,
            client_phone: cleanMobile,
            customer_phone: cleanMobile,
            customer_whatsapp: cleanMobile,
            service_type: cleanService,
            service_name: cleanService,
            booking_date: cleanDate,
            booking_time: cleanSlot,
            time_slot: cleanSlot,
            project_desc: cleanNotes,
            status: 'pending',
            booking_status: 'pending',
            payment_status: 'Review Pending',
            confirmation_token: confirmationToken,
            created_at: new Date().toISOString()
          }
        ]);

        if (insertError) {
          console.error('[Supabase Insert Error]:', insertError.message);
        } else {
          dbSuccess = true;
          console.log(`[Supabase] Booking ${bookingId} created with status 'pending' and confirmation token.`);
        }

        // Upsert customer profile
        try {
          await supabase.from('customers').insert([
            {
              full_name: cleanName,
              mobile: cleanMobile,
              whatsapp: cleanMobile,
              email: cleanEmail
            }
          ]);
        } catch (_) {}
      } catch (sbErr) {
        console.warn('[Supabase Notice]:', sbErr.message);
      }
    }

    const businessWhatsApp = process.env.BUSINESS_WHATSAPP_TO || process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '919390662637';
    const cleanWaNum = businessWhatsApp.replace(/\D/g, '');

    // 3. CHANNEL: WHATSAPP DISPATCH
    if (channel === 'whatsapp') {
      const whatsappText = 
        `📌 *New Slot Confirmed by Client*\n` +
        `• *Client:* ${cleanName}\n` +
        `• *Phone:* ${cleanMobile}\n` +
        `• *Email:* ${cleanEmail}\n` +
        `• *Service:* ${cleanService}\n` +
        `• *Slot:* ${cleanDate} (${cleanSlot})\n` +
        `• *Brief:* ${cleanNotes}\n\n` +
        `⚡ *Owner One-Click Confirmation Link:*\n${confirmationUrl}`;

      const whatsappUrl = `https://wa.me/${cleanWaNum}?text=${encodeURIComponent(whatsappText)}`;

      return NextResponse.json({
        success: true,
        bookingId,
        channel: 'whatsapp',
        confirmationUrl,
        whatsappText,
        whatsappUrl,
        message: 'Pending booking created! Redirecting to WhatsApp...'
      });
    }

    // 4. CHANNEL: GMAIL DISPATCH (Nodemailer)
    const gmailUser = process.env.BUSINESS_GMAIL_USER || process.env.GMAIL_USER || 'arneworks26@gmail.com';
    const gmailPass = process.env.BUSINESS_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass && !gmailPass.includes('xxxx')) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass.replace(/\s+/g, '')
          }
        });

        const emailHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0c100e; color: #f3f3f3; padding: 32px; border-radius: 18px; max-width: 600px; margin: 0 auto; border: 1px solid #00ff88;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0;">ARNE STORIES</h1>
              <p style="color: #00ff88; font-size: 13px; font-weight: bold; margin-top: 6px; text-transform: uppercase;">🔔 New Booking Request Pending Confirmation</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;">
              <p style="margin: 8px 0; font-size: 14px;"><strong>Reference ID:</strong> <span style="color: #00ff88; font-family: monospace;">${bookingId}</span></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Client Name:</strong> ${cleanName}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Mobile:</strong> <a href="tel:${cleanMobile}" style="color: #00ff88; text-decoration: none;">${cleanMobile}</a></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Client Email:</strong> <a href="mailto:${cleanEmail}" style="color: #00ff88; text-decoration: none;">${cleanEmail}</a></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Service:</strong> ${cleanService}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Requested Date:</strong> ${cleanDate}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Preferred Slot:</strong> ${cleanSlot}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Status:</strong> <span style="background: rgba(255,193,7,0.2); color: #ffc107; padding: 3px 8px; border-radius: 6px; font-weight: bold;">Pending Approval</span></p>
            </div>

            <div style="background: rgba(0, 255, 136, 0.05); padding: 18px; border-radius: 14px; border-left: 4px solid #00ff88; margin-bottom: 24px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #a1a1aa; font-weight: bold;">Project Requirements / Brief:</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ffffff;">${cleanNotes}</p>
            </div>

            <!-- ONE-CLICK OWNER CONFIRMATION BUTTON -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" target="_blank" style="background: linear-gradient(135deg, #00ff88 0%, #10b981 100%); color: #000000; text-decoration: none; padding: 16px 36px; border-radius: 12px; font-weight: 900; font-size: 16px; letter-spacing: 1px; display: inline-block; box-shadow: 0 0 25px rgba(0,255,136,0.5);">
                ✓ CONFIRM THIS SLOT
              </a>
            </div>

            <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
              <p style="font-size: 11px; color: #71717a; margin: 0;">Clicking the button will update the status to 'confirmed' and invalidate this security token.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"ARNE Stories Studio" <${gmailUser}>`,
          to: gmailUser,
          subject: `🔔 Pending Booking: ${cleanName} - ${cleanService} [Action Required]`,
          html: emailHtml
        });

        console.log(`[Nodemailer] Booking notification with confirmation link sent to ${gmailUser}`);
      } catch (mailErr) {
        console.error('[Nodemailer Dispatch Error]:', mailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      channel: 'gmail',
      confirmationUrl,
      message: 'Details forwarded via Gmail! We will confirm your slot shortly.'
    });

  } catch (error) {
    console.error('[Create Pending Booking Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing booking request.' },
      { status: 500 }
    );
  }
}
