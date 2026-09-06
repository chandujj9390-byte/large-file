/**
 * ARNE Works — Complete Booking API Handler (/api/complete-booking)
 * 
 * Workflow:
 * 1. Inserts booking record into Supabase with status 'Pending Review'.
 * 2. Sends Instant Client Acknowledgment SMS via Twilio.
 * 3. Dispatches Admin Alert Email via Nodemailer for 1-hour review window.
 * 4. Returns confirmation response to frontend.
 */

const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Helper to send JSON responses reliably
function sendResponse(res, statusCode, data) {
    try {
        if (!res || res.headersSent) return;

        if (typeof res.setHeader === 'function') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }

        if (typeof res.status === 'function' && typeof res.json === 'function') {
            return res.status(statusCode).json(data);
        }
        if (typeof res.writeHead === 'function') {
            res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
        }
        if (typeof res.end === 'function') {
            res.end(JSON.stringify(data));
        }
    } catch (err) {
        console.error('[ARNE CompleteBooking sendResponse Error]', err);
        try {
            if (typeof res.end === 'function') res.end(JSON.stringify(data));
        } catch (_) {}
    }
}

async function parseRequestBody(req) {
    if (!req) return {};
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch (e) {
            return {};
        }
    }
    return new Promise((resolve) => {
        let rawData = '';
        let timer = setTimeout(() => resolve({}), 4000);
        if (typeof req.on !== 'function') {
            clearTimeout(timer);
            return resolve({});
        }
        req.on('data', chunk => { rawData += chunk; });
        req.on('end', () => {
            clearTimeout(timer);
            if (!rawData.trim()) return resolve({});
            try { resolve(JSON.parse(rawData)); } catch (_) { resolve({}); }
        });
        req.on('error', () => {
            clearTimeout(timer);
            resolve({});
        });
    });
}

function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

function formatInternationalPhone(phone) {
    const raw = (phone || '').replace(/[\s\-()]/g, '');
    if (!raw) return '';
    if (raw.startsWith('+91')) return raw;
    if (raw.startsWith('+')) return raw;
    const cleanDigits = raw.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
    return `+91${tenDigits}`;
}

async function handleCompleteBooking(reqData) {
    if (!reqData || typeof reqData !== 'object') {
        return { success: false, status: 400, message: 'Invalid or missing JSON payload.' };
    }

    const clientName = sanitizeInput(reqData.client_name || reqData.fullName || reqData.name);
    const clientEmail = sanitizeInput(reqData.client_email || reqData.email);
    const rawPhone = sanitizeInput(reqData.client_phone || reqData.mobile || reqData.phone);
    const clientPhone = formatInternationalPhone(rawPhone);
    const bookingDate = sanitizeInput(reqData.booking_date || reqData.prefDate || reqData.date);
    const bookingTime = sanitizeInput(reqData.booking_time || reqData.prefSlot || reqData.timeSlot || reqData.slot);
    const serviceType = sanitizeInput(reqData.service_type || reqData.serviceName || reqData.service || 'Creative Service');
    const projectDesc = sanitizeInput(reqData.project_desc || reqData.projectDesc || reqData.desc || 'No specific requirements.');
    const estBudget = sanitizeInput(reqData.est_budget || reqData.estBudget || 'Standard');
    const company = sanitizeInput(reqData.company || 'N/A');
    const location = sanitizeInput(reqData.location || 'N/A');
    const refLink = sanitizeInput(reqData.ref_link || reqData.refLink || 'None');

    if (!clientName) return { success: false, status: 400, message: 'Customer Name is required.' };
    if (!clientEmail) return { success: false, status: 400, message: 'Valid Email Address is required.' };
    if (!clientPhone || clientPhone.length < 10) return { success: false, status: 400, message: 'Valid 10-digit Phone Number is required.' };

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const bookingId = reqData.booking_id || reqData.id || `ARNE-2026-${randomCode}`;
    const createdAt = new Date().toISOString();

    // 1. SUPABASE DATABASE INSERTION (status: 'Pending Review')
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
    let dbSaved = false;

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { error: insertErr } = await supabase.from('bookings').upsert([{
            id: bookingId,
            client_name: clientName,
            customer_name: clientName,
            client_email: clientEmail,
            customer_email: clientEmail,
            client_phone: clientPhone,
            customer_phone: clientPhone,
            customer_whatsapp: clientPhone,
            company: company,
            location: location,
            service_type: serviceType,
            service_name: serviceType,
            project_desc: projectDesc,
            booking_date: bookingDate || null,
            booking_time: bookingTime || 'Flexible',
            time_slot: bookingTime || 'Flexible',
            status: 'Pending Review',
            booking_status: 'Pending Review',
            payment_status: 'Review Pending',
            ref_link: refLink,
            created_at: createdAt
        }]);

        if (insertErr) {
            console.error('[Supabase Insert Error]:', insertErr.message);
        } else {
            dbSaved = true;
            console.log(`[Supabase] Booking ${bookingId} saved with status 'Pending Review'.`);
        }

        // Upsert customer profile
        try {
            await supabase.from('customers').insert([{
                full_name: clientName,
                mobile: clientPhone,
                whatsapp: clientPhone,
                email: clientEmail,
                company: company,
                location: location
            }]);
        } catch (_) {}
    } catch (sbErr) {
        console.warn('[Supabase Client Error]:', sbErr.message);
    }

    // 2. INSTANT CLIENT ACKNOWLEDGMENT SMS (TWILIO)
    let smsSent = false;
    const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

    if (TWILIO_SID && TWILIO_AUTH && TWILIO_PHONE && !TWILIO_SID.startsWith('AC_YOUR')) {
        try {
            const twilio = require('twilio');
            const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);
            const clientMsg = `Hi ${clientName}, we received your booking request for ${serviceType}! Our team is reviewing schedule availability and will confirm your slot within 1 hour via SMS.`;

            await twilioClient.messages.create({
                body: clientMsg,
                from: TWILIO_PHONE,
                to: clientPhone
            });
            smsSent = true;
            console.log(`[Twilio SMS] Acknowledgment sent to ${clientPhone}`);
        } catch (twErr) {
            console.warn('[Twilio SMS Error]:', twErr.message);
        }
    }

    // 3. ADMIN NOTIFICATION EMAIL (NODEMAILER)
    let emailSent = false;
    const GMAIL_USER = process.env.GMAIL_USER || process.env.SMTP_USER || 'arneworks26@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    const ADMIN_EMAIL = process.env.BOOKING_NOTIFICATION_EMAIL || 'arneworks26@gmail.com';

    if (GMAIL_USER && GMAIL_PASS && !GMAIL_PASS.includes('xxxx')) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: GMAIL_USER,
                    pass: GMAIL_PASS.replace(/\s+/g, '')
                }
            });

            const emailSubject = `[Action Required] New Booking Request - 1 Hour Review Window (${bookingId})`;
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #0c100e; color: #ffffff; padding: 25px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #1f2a24;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="background: rgba(0, 255, 136, 0.15); color: #00ff88; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                            ⚡ Action Required • 1 Hour Review Window
                        </span>
                        <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 22px;">New Booking Slot Request</h2>
                        <p style="color: #8fa397; font-size: 13px; margin: 0;">Ref: <strong style="color: #00ff88;">${bookingId}</strong></p>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 18px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397; width: 40%;">Client Name:</td>
                                <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${clientName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397;">Mobile Number:</td>
                                <td style="padding: 6px 0; color: #00ff88; font-weight: 700;">${clientPhone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397;">Email Address:</td>
                                <td style="padding: 6px 0; color: #ffffff;">${clientEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397;">Service Requested:</td>
                                <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${serviceType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397;">Requested Date:</td>
                                <td style="padding: 6px 0; color: #ffffff;">${bookingDate || 'Flexible / As soon as available'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397;">Requested Time Slot:</td>
                                <td style="padding: 6px 0; color: #ffffff;">${bookingTime || 'Flexible'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #8fa397;">Project Details:</td>
                                <td style="padding: 6px 0; color: #ffffff;">${projectDesc}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 24px;">
                        <p style="font-size: 12px; color: #8fa397; margin-bottom: 12px;">
                            Please log into your Admin Dashboard within 1 hour to Approve or Decline this request.
                        </p>
                    </div>
                </div>
            `;

            await transporter.sendMail({
                from: `"ARNE Works Booking Portal" <${GMAIL_USER}>`,
                to: ADMIN_EMAIL,
                subject: emailSubject,
                html: emailHtml
            });
            emailSent = true;
            console.log(`[Nodemailer] Admin notification sent to ${ADMIN_EMAIL}`);
        } catch (mailErr) {
            console.warn('[Nodemailer Admin Notification Error]:', mailErr.message);
        }
    }

    return {
        success: true,
        status: 200,
        bookingId: bookingId,
        bookingStatus: 'Pending Review',
        message: 'Slot Request Submitted! We will review and confirm your slot via SMS within 1 hour.',
        client: {
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            service: serviceType,
            date: bookingDate,
            slot: bookingTime
        },
        dbSaved,
        smsSent,
        emailSent
    };
}

module.exports = async function handler(req, res) {
    if (!req || !res) return;

    if (req.method === 'OPTIONS') {
        return sendResponse(res, 204, {});
    }

    if (req.method !== 'POST') {
        return sendResponse(res, 405, { success: false, message: `Method ${req.method} not allowed.` });
    }

    try {
        const body = await parseRequestBody(req);
        const result = await handleCompleteBooking(body);
        return sendResponse(res, result.status || (result.success ? 200 : 400), result);
    } catch (err) {
        console.error('[ARNE CompleteBooking Fatal]', err);
        return sendResponse(res, 500, { success: false, message: 'Internal Server Error' });
    }
};

module.exports.handleCompleteBooking = handleCompleteBooking;
