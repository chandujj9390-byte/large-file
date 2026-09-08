/**
 * ARNE Works — Create Pending Booking Backend API (/api/create-pending-booking)
 * 
 * 1. Generates unique booking_id and cryptographic confirmation_token.
 * 2. Saves pending record into Supabase `bookings` table.
 * 3. Constructs One-Click Owner Confirmation URL.
 * 4. Dispatches via WhatsApp or Nodemailer Gmail.
 */

const crypto = require('crypto');
let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (_) {}

let createClient = null;
try { createClient = require('@supabase/supabase-js').createClient; } catch (_) {}

function sendResponse(res, statusCode, data) {
    try {
        if (!res || res.headersSent) return;
        if (typeof res.setHeader === 'function') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
        console.error('[create-pending-booking sendResponse Error]', err);
    }
}

async function parseRequestBody(req) {
    if (!req) return {};
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch (_) { return {}; }
    }
    return new Promise((resolve) => {
        let rawData = '';
        const timer = setTimeout(() => resolve({}), 4000);
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

async function handleCreatePendingBooking(reqData, req) {
    if (!reqData || typeof reqData !== 'object') {
        return { success: false, status: 400, message: 'Invalid JSON payload.' };
    }

    const fullName = sanitizeInput(reqData.fullName || reqData.client_name || reqData.name);
    const email = sanitizeInput(reqData.email || reqData.client_email);
    const rawMobile = sanitizeInput(reqData.mobile || reqData.client_phone || reqData.phone);
    const service = sanitizeInput(reqData.service || reqData.service_type || 'Creative Service');
    const date = sanitizeInput(reqData.date || reqData.booking_date || 'Immediate / Flexible');
    const timeSlot = sanitizeInput(reqData.timeSlot || reqData.booking_time || 'Morning (10:00 AM - 01:00 PM)');
    const requirements = sanitizeInput(reqData.requirements || reqData.project_desc || 'No specific requirements.');
    const channel = reqData.channel === 'gmail' ? 'gmail' : 'whatsapp';

    if (!fullName) return { success: false, status: 400, message: 'Full Name is required.' };
    if (!email) return { success: false, status: 400, message: 'Valid email is required.' };
    if (!rawMobile || rawMobile.length < 10) return { success: false, status: 400, message: 'Valid 10-digit mobile number is required.' };
    if (!service) return { success: false, status: 400, message: 'Service selection is required.' };

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const bookingId = reqData.bookingId || `ARNE-2026-${randomCode}`;
    const confirmationToken = crypto.randomBytes(24).toString('hex');

    // Determine host & protocol
    let host = 'localhost:8765';
    let protocol = 'http';
    if (req && req.headers) {
        host = req.headers['host'] || host;
        protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    }
    const domain = `${protocol}://${host}`;
    const confirmationUrl = `${domain}/api/confirm-booking?id=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(confirmationToken)}`;

    // 1. Supabase Record
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yjgbzipdvhgdftxdlccx.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9fjwQtl2NjYC7OYLmy1pVw_oyc4ru2C';

    if (createClient && SUPABASE_URL && SUPABASE_KEY) {
        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { error: insertErr } = await supabase.from('bookings').upsert([{
                id: bookingId,
                client_name: fullName,
                customer_name: fullName,
                client_email: email,
                customer_email: email,
                client_phone: rawMobile,
                customer_phone: rawMobile,
                customer_whatsapp: rawMobile,
                service_type: service,
                service_name: service,
                booking_date: date,
                booking_time: timeSlot,
                time_slot: timeSlot,
                project_desc: requirements,
                status: 'pending',
                booking_status: 'pending',
                payment_status: 'Review Pending',
                confirmation_token: confirmationToken,
                created_at: new Date().toISOString()
            }]);

            if (insertErr) {
                console.error('[Supabase Insert Error]:', insertErr.message);
            } else {
                console.log(`[Supabase] Booking ${bookingId} saved with status 'pending' and confirmation token.`);
            }

            try {
                await supabase.from('customers').insert([{
                    full_name: fullName,
                    mobile: rawMobile,
                    whatsapp: rawMobile,
                    email: email
                }]);
            } catch (_) {}
        } catch (sbErr) {
            console.warn('[Supabase Client Error]:', sbErr.message);
        }
    }

    const businessWhatsApp = process.env.BUSINESS_WHATSAPP_TO || process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '919390662637';
    const cleanWaNum = businessWhatsApp.replace(/\D/g, '');

    // 2. Channel WhatsApp
    if (channel === 'whatsapp') {
        const whatsappText = 
            `📌 *New Slot Confirmed by Client*\n` +
            `• *Client:* ${fullName}\n` +
            `• *Phone:* ${rawMobile}\n` +
            `• *Email:* ${email}\n` +
            `• *Service:* ${service}\n` +
            `• *Slot:* ${date} (${timeSlot})\n` +
            `• *Brief:* ${requirements}\n\n` +
            `⚡ *Owner One-Click Confirmation Link:*\n${confirmationUrl}`;

        const whatsappUrl = `https://wa.me/${cleanWaNum}?text=${encodeURIComponent(whatsappText)}`;

        return {
            success: true,
            status: 200,
            bookingId,
            channel: 'whatsapp',
            confirmationUrl,
            whatsappText,
            whatsappUrl,
            message: 'Pending booking created! Redirecting to WhatsApp...'
        };
    }

    // 3. Channel Gmail
    const gmailUser = process.env.BUSINESS_GMAIL_USER || process.env.GMAIL_USER || 'arneworks26@gmail.com';
    const gmailPass = process.env.BUSINESS_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

    if (nodemailer && gmailUser && gmailPass && !gmailPass.includes('xxxx')) {
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
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Client Name:</strong> ${fullName}</p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Mobile:</strong> <a href="tel:${rawMobile}" style="color: #00ff88; text-decoration: none;">${rawMobile}</a></p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Client Email:</strong> <a href="mailto:${email}" style="color: #00ff88; text-decoration: none;">${email}</a></p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Service:</strong> ${service}</p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Requested Date:</strong> ${date}</p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Preferred Slot:</strong> ${timeSlot}</p>
                  <p style="margin: 8px 0; font-size: 14px;"><strong>Status:</strong> <span style="background: rgba(255,193,7,0.2); color: #ffc107; padding: 3px 8px; border-radius: 6px; font-weight: bold;">Pending Approval</span></p>
                </div>

                <div style="background: rgba(0, 255, 136, 0.05); padding: 18px; border-radius: 14px; border-left: 4px solid #00ff88; margin-bottom: 24px;">
                  <p style="margin: 0 0 6px 0; font-size: 13px; color: #a1a1aa; font-weight: bold;">Project Requirements / Brief:</p>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ffffff;">${requirements}</p>
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
                subject: `🔔 Pending Booking: ${fullName} - ${service} [Action Required]`,
                html: emailHtml
            });

            console.log(`[Nodemailer] Booking notification with confirmation link sent to ${gmailUser}`);
        } catch (mailErr) {
            console.error('[Nodemailer Dispatch Error]:', mailErr.message);
        }
    }

    return {
        success: true,
        status: 200,
        bookingId,
        channel: 'gmail',
        confirmationUrl,
        message: 'Details forwarded via Gmail! We will confirm your slot shortly.'
    };
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        if (typeof res.setHeader === 'function') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        if (typeof res.writeHead === 'function') res.writeHead(204);
        if (typeof res.end === 'function') res.end();
        return;
    }

    if (req.method !== 'POST') {
        return sendResponse(res, 405, { success: false, message: 'Method Not Allowed. Use POST.' });
    }

    try {
        const body = await parseRequestBody(req);
        const result = await handleCreatePendingBooking(body, req);
        return sendResponse(res, result.status || 200, result);
    } catch (err) {
        console.error('[create-pending-booking Handler Error]:', err);
        return sendResponse(res, 500, { success: false, message: 'Internal Server Error.' });
    }
};

module.exports.handleCreatePendingBooking = handleCreatePendingBooking;
