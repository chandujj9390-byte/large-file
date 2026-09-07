import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

/**
 * Next.js App Router Backend API Route: /api/complete-booking
 * Secure Server-Side execution: Supabase DB ('New Booking'), Twilio WhatsApp, Nodemailer Gmail.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, mobile, email, service, requirements } = body;

    // Validate Required Inputs
    if (!fullName || !mobile || !email || !service) {
      return NextResponse.json(
        { success: false, message: 'Full Name, Mobile Number, Client Gmail, and Service are required.' },
        { status: 400 }
      );
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const bookingId = body.bookingId || `ARNE-2026-${randomCode}`;
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const clientNotes = requirements && requirements.trim() ? requirements.trim() : 'No additional requirements specified.';

    // ----------------------------------------------------------------------
    // 1. SUPABASE DATABASE RECORD (status: 'New Booking')
    // ----------------------------------------------------------------------
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        const { error: insertError } = await supabase.from('bookings').insert([
          {
            id: bookingId,
            client_name: fullName.trim(),
            customer_name: fullName.trim(),
            client_email: email.trim().toLowerCase(),
            customer_email: email.trim().toLowerCase(),
            client_phone: mobile.trim(),
            customer_phone: mobile.trim(),
            customer_whatsapp: mobile.trim(),
            service_type: service.trim(),
            service_name: service.trim(),
            project_desc: clientNotes,
            status: 'New Booking',
            booking_status: 'New Booking',
            payment_status: 'Review Pending',
            created_at: new Date().toISOString()
          }
        ]);

        if (insertError) {
          console.error('[Supabase Insert Error]:', insertError.message);
        } else {
          console.log(`[Supabase] Booking ${bookingId} saved with status 'New Booking'.`);
        }

        // Upsert customer profile
        try {
          await supabase.from('customers').insert([
            {
              full_name: fullName.trim(),
              mobile: mobile.trim(),
              whatsapp: mobile.trim(),
              email: email.trim().toLowerCase()
            }
          ]);
        } catch (_) {}
      } catch (sbErr) {
        console.warn('[Supabase Notice]:', sbErr.message);
      }
    }

    // ----------------------------------------------------------------------
    // 2. SEND TO BUSINESS WHATSAPP (Twilio WhatsApp API)
    // ----------------------------------------------------------------------
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';
    const businessTo = process.env.BUSINESS_WHATSAPP_TO || process.env.DESTINATION_WHATSAPP_NUMBER || 'whatsapp:+919390662637';

    if (twilioSid && twilioAuth && !twilioSid.startsWith('AC_YOUR')) {
      try {
        const client = twilio(twilioSid, twilioAuth);

        const fromFormatted = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;
        const toFormatted = businessTo.startsWith('whatsapp:') ? businessTo : `whatsapp:${businessTo}`;

        const whatsappBody = `📌 *New Slot Confirmed by Client*\n• *Client:* ${fullName.trim()}\n• *Phone:* ${mobile.trim()}\n• *Email:* ${email.trim()}\n• *Service:* ${service.trim()}\n• *Notes:* ${clientNotes}`;

        await client.messages.create({
          from: fromFormatted,
          to: toFormatted,
          body: whatsappBody
        });

        console.log(`[Twilio] Business WhatsApp alert dispatched to ${toFormatted}`);
      } catch (twilioErr) {
        console.error('[Twilio WhatsApp Error]:', twilioErr.message);
      }
    }

    // ----------------------------------------------------------------------
    // 3. SEND TO BUSINESS GMAIL (Nodemailer)
    // ----------------------------------------------------------------------
    const gmailUser = process.env.BUSINESS_GMAIL_USER || process.env.GMAIL_USER;
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

        const mailHtml = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0c100e; color: #f3f3f3; padding: 32px; border-radius: 18px; max-width: 600px; margin: 0 auto; border: 1px solid #00ff88;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0;">ARNE STORIES</h1>
              <p style="color: #00ff88; font-size: 13px; font-weight: bold; margin-top: 6px; text-transform: uppercase;">🔔 New Booking Confirmed</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;">
              <p style="margin: 8px 0; font-size: 14px;"><strong>Reference ID:</strong> <span style="color: #00ff88; font-family: monospace;">${bookingId}</span></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Client Name:</strong> ${fullName}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Mobile Number:</strong> <a href="tel:${mobile}" style="color: #00ff88; text-decoration: none;">${mobile}</a></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Client Gmail:</strong> <a href="mailto:${email}" style="color: #00ff88; text-decoration: none;">${email}</a></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Selected Service:</strong> ${service}</p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Booking Status:</strong> <span style="background: rgba(0,255,136,0.15); color: #00ff88; padding: 3px 8px; border-radius: 6px; font-weight: bold;">New Booking</span></p>
              <p style="margin: 8px 0; font-size: 14px;"><strong>Confirmed At:</strong> ${timestamp}</p>
            </div>

            <div style="background: rgba(0, 255, 136, 0.05); padding: 18px; border-radius: 14px; border-left: 4px solid #00ff88; margin-bottom: 24px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #a1a1aa; font-weight: bold;">Requirements / Project Notes:</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ffffff;">${clientNotes}</p>
            </div>

            <div style="text-align: center;">
              <a href="https://wa.me/${mobile.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(fullName)},%20thank%20you%20for%20confirming%20your%20booking%20with%20Arne%20Stories%20for%20${encodeURIComponent(service)}." style="background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                Reply via WhatsApp 💬
              </a>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"ARNE Stories Studio" <${gmailUser}>`,
          to: gmailUser,
          subject: `🔔 New Booking Confirmed: ${fullName} - ${service}`,
          html: mailHtml
        });

        console.log(`[Nodemailer] Booking notification email sent successfully to ${gmailUser}`);
      } catch (mailErr) {
        console.error('[Nodemailer Error]:', mailErr.message);
      }
    }

    // ----------------------------------------------------------------------
    // 4. RETURN 200 OK SUCCESS RESPONSE
    // ----------------------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        bookingId: bookingId,
        message: 'Booking Submitted! We have received your request and our team will contact you shortly.',
        data: {
          id: bookingId,
          clientName: fullName,
          service: service,
          status: 'New Booking'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Complete Booking API Route Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing booking request.' },
      { status: 500 }
    );
  }
}
