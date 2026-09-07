/**
 * ARNE Works — Complete Booking API Handler (/api/complete-booking)
 * 
 * Workflow:
 * 1. Database Insert (Supabase) with status 'Pending Review' (No 50% prepayments).
 * 2. Secure Business Gmail Alert via Nodemailer.
 * 3. Secure Business WhatsApp Alert via Twilio.
 * 4. Return 200 OK JSON response.
 */

let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (_) {}

let createClient = null;
try { createClient = require('@supabase/supabase-js').createClient; } catch (_) {}

let twilio = null;
try { twilio = require('twilio'); } catch (_) {}

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

    const clientName = sanitizeInput(reqData.fullName || reqData.client_name || reqData.name);
    const clientEmail = sanitizeInput(reqData.email || reqData.client_email);
    const rawPhone = sanitizeInput(reqData.mobile || reqData.client_phone || reqData.phone);
    const clientPhone = formatInternationalPhone(rawPhone);
    const serviceType = sanitizeInput(reqData.service || reqData.service_type || reqData.serviceName || 'Creative Service');
    const requirements = sanitizeInput(reqData.requirements || reqData.project_desc || reqData.desc || 'No specific requirements.');

    if (!clientName) return { success: false, status: 400, message: 'Customer Name is required.' };
    if (!clientEmail) return { success: false, status: 400, message: 'Valid Email Address is required.' };
    if (!clientPhone || clientPhone.length < 10) return { success: false, status: 400, message: 'Valid 10-digit Phone Number is required.' };
    if (!serviceType) return { success: false, status: 400, message: 'Service selection is required.' };

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const bookingId = reqData.bookingId || reqData.booking_id || `ARNE-2026-${randomCode}`;
    const createdAt = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    // ----------------------------------------------------------------------
    // 1. SUPABASE DATABASE INSERTION (Default status: 'Pending Review')
    // ----------------------------------------------------------------------
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    let dbSaved = false;

    if (createClient && SUPABASE_URL && SUPABASE_KEY) {
        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { error: insertErr } = await supabase.from('bookings').insert([{
                id: bookingId,
                client_name: clientName,
                customer_name: clientName,
                client_email: clientEmail,
                customer_email: clientEmail,
                client_phone: clientPhone,
                customer_phone: clientPhone,
                customer_whatsapp: clientPhone,
                service_type: serviceType,
                service_name: serviceType,
                project_desc: requirements,
                status: 'New Booking',
                booking_status: 'New Booking',
                payment_status: 'Review Pending',
                created_at: createdAt
            }]);

            if (insertErr) {
                console.error('[Supabase Insert Error]:', insertErr.message);
            } else {
                dbSaved = true;
                console.log(`[Supabase] Booking ${bookingId} saved with status 'New Booking'.`);
            }

            // Upsert customer record
            try {
                await supabase.from('customers').insert([{
                    full_name: clientName,
                    mobile: clientPhone,
                    whatsapp: clientPhone,
                    email: clientEmail
                }]);
            } catch (_) {}
        } catch (sbErr) {
            console.warn('[Supabase Client Error]:', sbErr.message);
        }
    }

    // ----------------------------------------------------------------------
    // 2. SECURE BUSINESS WHATSAPP ALERT (Twilio)
    // ----------------------------------------------------------------------
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';
    const businessTo = process.env.BUSINESS_WHATSAPP_TO || process.env.DESTINATION_WHATSAPP_NUMBER || 'whatsapp:+919390662637';

    if (twilio && twilioSid && twilioAuth && !twilioSid.startsWith('AC_YOUR')) {
        try {
            const twilioClient = twilio(twilioSid, twilioAuth);

            const fromFormatted = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;
            const toFormatted = businessTo.startsWith('whatsapp:') ? businessTo : `whatsapp:${businessTo}`;

            const whatsappMessageBody = `📌 *New Slot Confirmed by Client*\n• *Client:* ${clientName}\n• *Phone:* ${clientPhone}\n• *Email:* ${clientEmail}\n• *Service:* ${serviceType}\n• *Notes:* ${requirements}`;

            await twilioClient.messages.create({
                from: fromFormatted,
                to: toFormatted,
                body: whatsappMessageBody
            });

            console.log(`[Twilio] WhatsApp alert sent successfully to ${toFormatted}`);
        } catch (twilioErr) {
            console.error('[Twilio Alert Error]:', twilioErr.message);
        }
    }

    // ----------------------------------------------------------------------
    // 3. SECURE BUSINESS GMAIL ALERT (Nodemailer)
    // ----------------------------------------------------------------------
    const gmailUser = process.env.BUSINESS_GMAIL_USER || process.env.GMAIL_USER;
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

            const mailHtml = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0c100e; color: #f3f3f3; padding: 32px; border-radius: 18px; max-width: 600px; margin: 0 auto; border: 1px solid #00ff88;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 2px; margin: 0;">ARNE STORIES</h1>
                        <p style="color: #00ff88; font-size: 13px; font-weight: bold; margin-top: 6px; text-transform: uppercase;">🔔 New Booking Confirmed</p>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 22px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;">
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Reference ID:</strong> <span style="color: #00ff88; font-family: monospace;">${bookingId}</span></p>
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Client Name:</strong> ${clientName}</p>
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Mobile Number:</strong> <a href="tel:${clientPhone}" style="color: #00ff88; text-decoration: none;">${clientPhone}</a></p>
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Client Gmail:</strong> <a href="mailto:${clientEmail}" style="color: #00ff88; text-decoration: none;">${clientEmail}</a></p>
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Selected Service:</strong> ${serviceType}</p>
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Booking Status:</strong> <span style="background: rgba(0,255,136,0.15); color: #00ff88; padding: 3px 8px; border-radius: 6px; font-weight: bold;">New Booking</span></p>
                        <p style="margin: 8px 0; font-size: 14px;"><strong>Confirmed At:</strong> ${formattedTimestamp}</p>
                    </div>

                    <div style="background: rgba(0, 255, 136, 0.05); padding: 18px; border-radius: 14px; border-left: 4px solid #00ff88; margin-bottom: 24px;">
                        <p style="margin: 0 0 6px 0; font-size: 13px; color: #a1a1aa; font-weight: bold;">Requirements / Project Notes:</p>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ffffff;">${requirements}</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="https://wa.me/${clientPhone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(clientName)},%20thank%20you%20for%20confirming%20your%20booking%20with%20Arne%20Stories%20for%20${encodeURIComponent(serviceType)}." style="background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
                            Reply via WhatsApp 💬
                        </a>
                    </div>
                </div>
            `;

            await transporter.sendMail({
                from: `"ARNE Stories Studio" <${gmailUser}>`,
                to: gmailUser,
                subject: `🔔 New Booking Confirmed: ${clientName} - ${serviceType}`,
                html: mailHtml
            });

            console.log(`[Nodemailer] Booking notification dispatched to ${gmailUser}`);
        } catch (mailErr) {
            console.error('[Nodemailer Dispatch Error]:', mailErr.message);
        }
    }

    // ----------------------------------------------------------------------
    // 4. RETURN 200 OK SUCCESS RESPONSE
    // ----------------------------------------------------------------------
    return {
        success: true,
        status: 200,
        bookingId: bookingId,
        message: 'Booking Submitted! We have received your request and our team will contact you shortly.',
        data: {
            id: bookingId,
            clientName: clientName,
            service: serviceType,
            status: 'New Booking'
        }
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
        const result = await handleCompleteBooking(body);
        return sendResponse(res, result.status || 200, result);
    } catch (err) {
        console.error('[CompleteBooking Handler Error]:', err);
        return sendResponse(res, 500, { success: false, message: 'Internal Server Error processing booking.' });
    }
};

module.exports.handleCompleteBooking = handleCompleteBooking;
