/**
 * ARNE Works — Complete Booking API Handler (/api/complete-booking)
 * 
 * Workflow:
 * 1. Inserts booking record into Supabase with status 'New Booking'.
 * 2. Triggers Business WhatsApp Alert via Twilio WhatsApp API (to 9390662637).
 * 3. Dispatches Business Gmail Alert via Nodemailer (to arneworks26@gmail.com).
 * 4. Returns confirmation response to frontend.
 */

let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (_) {}

let createClient = null;
try { createClient = require('@supabase/supabase-js').createClient; } catch (_) {}

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
    const projectDesc = sanitizeInput(reqData.project_desc || reqData.projectDesc || reqData.requirements || reqData.desc || 'No additional requirements.');
    const estBudget = sanitizeInput(reqData.est_budget || reqData.estBudget || 'Standard');
    const company = sanitizeInput(reqData.company || 'N/A');
    const location = sanitizeInput(reqData.location || 'N/A');
    const refLink = sanitizeInput(reqData.ref_link || reqData.refLink || 'None');

    // 50% Prepaid + 50% Postpaid Financial Calculations
    let totalPrice = reqData.total_price !== undefined ? Number(reqData.total_price) : (reqData.totalPrice !== undefined ? Number(reqData.totalPrice) : null);
    if (totalPrice === null) {
        const SERVICE_PRICE_MAP = {
            'Video Editing': 1049,
            'Photo Editing': 599,
            'Website Design': 4999,
            'Reel / Shorts Editing': 799,
            'Poster Designing': 529,
            'Album Designing': 1299,
            'Color Grading': 599,
            'Other': 0
        };
        const isOther = serviceType === 'Other' || (serviceType && serviceType.toLowerCase() === 'other');
        totalPrice = isOther ? 0 : (SERVICE_PRICE_MAP[serviceType] !== undefined ? SERVICE_PRICE_MAP[serviceType] : 0);
    }

    const prepaidAmount = Number(reqData.prepaid_amount !== undefined ? reqData.prepaid_amount : (reqData.prepaidAmount !== undefined ? reqData.prepaidAmount : Math.round(totalPrice * 0.5)));
    const postpaidAmount = Number(reqData.postpaid_amount !== undefined ? reqData.postpaid_amount : (reqData.postpaidAmount !== undefined ? reqData.postpaidAmount : (totalPrice - prepaidAmount)));
    const paymentStatus = sanitizeInput(reqData.payment_status || (prepaidAmount > 0 ? '50% Prepaid Paid' : 'Requirement Submitted'));
    const bookingStatus = sanitizeInput(reqData.status || reqData.booking_status || 'Confirmed');

    if (!clientName) return { success: false, status: 400, message: 'Customer Name is required.' };
    if (!clientEmail) return { success: false, status: 400, message: 'Valid Email Address is required.' };
    if (!clientPhone || clientPhone.length < 10) return { success: false, status: 400, message: 'Valid 10-digit Phone Number is required.' };

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const bookingId = reqData.booking_id || reqData.id || `ARNE-2026-${randomCode}`;
    const createdAt = new Date().toISOString();
    const formattedTimestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    // 1. SUPABASE DATABASE INSERTION (50% Prepaid & 50% Postpaid, status: 'Confirmed')
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
    let dbSaved = false;

    try {
        if (createClient) {
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
                total_price: totalPrice,
                prepaid_amount: prepaidAmount,
                postpaid_amount: postpaidAmount,
                amount_paid: prepaidAmount,
                amount_remaining: postpaidAmount,
                payment_method: 'UPI / Razorpay (50% Advance)',
                status: bookingStatus,
                booking_status: bookingStatus,
                payment_status: paymentStatus,
                ref_link: refLink,
                created_at: createdAt
            }]);

            if (insertErr) {
                console.error('[Supabase Insert Error]:', insertErr.message);
            } else {
                dbSaved = true;
                console.log(`[Supabase] Booking ${bookingId} saved with 50% Prepaid (₹${prepaidAmount}) + 50% Postpaid (₹${postpaidAmount}) and status '${bookingStatus}'.`);
            }

            // Upsert customer profile
            try {
                await supabase.from('customers').insert([{
                    full_name: clientName,
                    mobile: clientPhone,
                    whatsapp: clientPhone,
                    email: clientEmail,
                    company: company,
                    location: location,
                    total_spent: prepaidAmount,
                    pending_amount: postpaidAmount
                }]);
            } catch (_) {}

            // Upsert payment ledger entry
            try {
                await supabase.from('payments').insert([{
                    booking_id: bookingId,
                    customer_name: clientName,
                    total_amount: totalPrice,
                    prepaid_amount: prepaidAmount,
                    postpaid_amount: postpaidAmount,
                    amount_paid: prepaidAmount,
                    amount_remaining: postpaidAmount,
                    payment_method: 'UPI / Razorpay',
                    status: 'Partially Paid (50% Deposit Confirmed)'
                }]);
            } catch (_) {}
        }
    } catch (sbErr) {
        console.warn('[Supabase Client Error]:', sbErr.message);
    }

    // 2. BUSINESS WHATSAPP ALERT (TWILIO WHATSAPP API)
    let whatsappSent = false;
    const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';
    const BUSINESS_WHATSAPP_TO = process.env.DESTINATION_WHATSAPP_NUMBER || 'whatsapp:+919390662637';

    // Format WhatsApp message strictly with 50% prepaid and 50% postpaid details:
    const whatsappMessageBody = [
        `📌 *Confirmed Slot Booking Alert (50% Advance Paid)!*`,
        `*Client Name:* ${clientName}`,
        `*Mobile Number:* ${clientPhone}`,
        `*Email:* ${clientEmail}`,
        `*Selected Service:* ${serviceType}`,
        `*Total Package Price:* ₹${totalPrice.toLocaleString('en-IN')}`,
        `*50% Prepaid Advance (Paid):* ₹${prepaidAmount.toLocaleString('en-IN')}`,
        `*50% Postpaid Balance (Due on Delivery):* ₹${postpaidAmount.toLocaleString('en-IN')}`,
        `*Requirements / Notes:* ${projectDesc}`,
        `*Time of Booking:* ${formattedTimestamp} (Ref: ${bookingId})`
    ].join('\n');

    if (TWILIO_SID && TWILIO_AUTH && !TWILIO_SID.startsWith('AC_YOUR')) {
        try {
            const twilio = require('twilio');
            const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);

            const fromNumber = TWILIO_WHATSAPP_FROM.startsWith('whatsapp:') ? TWILIO_WHATSAPP_FROM : `whatsapp:${TWILIO_WHATSAPP_FROM}`;
            const toNumber = BUSINESS_WHATSAPP_TO.startsWith('whatsapp:') ? BUSINESS_WHATSAPP_TO : `whatsapp:${BUSINESS_WHATSAPP_TO}`;

            await twilioClient.messages.create({
                body: whatsappMessageBody,
                from: fromNumber,
                to: toNumber
            });
            whatsappSent = true;
            console.log(`[Twilio WhatsApp] Alert sent to ${toNumber}`);
        } catch (twErr) {
            console.warn('[Twilio WhatsApp Error]:', twErr.message);
            // Fallback: Also attempt Twilio SMS if WhatsApp sandbox fails
            const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
            if (TWILIO_PHONE) {
                try {
                    const twilio = require('twilio');
                    const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);
                    await twilioClient.messages.create({
                        body: whatsappMessageBody,
                        from: TWILIO_PHONE,
                        to: '+919390662637'
                    });
                    console.log('[Twilio SMS Fallback] Alert sent to business phone +919390662637');
                } catch (_) {}
            }
        }
    } else {
        console.log('[Twilio WhatsApp Note] Twilio credentials pending in .env. Formatted message ready:\n' + whatsappMessageBody);
    }

    // 3. BUSINESS GMAIL ALERT (NODEMAILER)
    let emailSent = false;
    const GMAIL_USER = process.env.GMAIL_USER || process.env.SMTP_USER || 'arneworks26@gmail.com';
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
    const BUSINESS_GMAIL = process.env.BOOKING_NOTIFICATION_EMAIL || 'arneworks26@gmail.com';

    const emailSubject = `🎉 Booking Confirmed (50% Advance Paid): ${clientName} - ${serviceType}`;
    const emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #0c100e; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 600px; margin: auto; border: 1px solid #1f2a24; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="background: rgba(0, 255, 136, 0.15); color: #00ff88; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
                    🎉 Booking Confirmed • 50% Advance Paid
                </span>
                <h2 style="color: #ffffff; margin: 14px 0 6px 0; font-size: 24px; font-weight: 800;">Confirmed Client Booking</h2>
                <p style="color: #8fa397; font-size: 13px; margin: 0;">Booking Ref: <strong style="color: #00ff88;">${bookingId}</strong> • Status: <span style="color: #00ff88; font-weight: 700;">Confirmed (50% Deposit Paid)</span></p>
            </div>

            <!-- Financial 50% Split Card -->
            <div style="background: rgba(0, 255, 136, 0.08); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #a1b0a6;">
                    <span>Total Package Price:</span>
                    <strong style="color: #ffffff; font-size: 15px;">₹${totalPrice.toLocaleString('en-IN')}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
                    <span style="color: #00ff88; font-weight: 700;">✓ 50% Prepaid Advance (Paid):</span>
                    <strong style="color: #00ff88; font-size: 15px;">₹${prepaidAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                    <span style="color: #fbbf24; font-weight: 700;">⏳ 50% Postpaid Balance (Due on Delivery):</span>
                    <strong style="color: #fbbf24; font-size: 15px;">₹${postpaidAmount.toLocaleString('en-IN')}</strong>
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; width: 38%; font-weight: 500;">Client Name:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 700;">${clientName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500;">Mobile Number:</td>
                        <td style="padding: 8px 0; color: #00ff88; font-weight: 700;"><a href="tel:${clientPhone}" style="color: #00ff88; text-decoration: none;">${clientPhone}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500;">Email Address:</td>
                        <td style="padding: 8px 0; color: #ffffff;"><a href="mailto:${clientEmail}" style="color: #6ee7b7; text-decoration: none;">${clientEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500;">Selected Service:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 700;">${serviceType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500;">Preferred Date:</td>
                        <td style="padding: 8px 0; color: #ffffff;">${bookingDate || 'Flexible / As soon as available'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500;">Preferred Slot:</td>
                        <td style="padding: 8px 0; color: #ffffff;">${bookingTime || 'Flexible'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500; vertical-align: top;">Requirements / Notes:</td>
                        <td style="padding: 8px 0; color: #e2e8f0; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 6px 8px;">${projectDesc}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #8fa397; font-weight: 500;">Time of Booking:</td>
                        <td style="padding: 8px 0; color: #8fa397; font-size: 12px;">${formattedTimestamp}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                <a href="https://wa.me/${clientPhone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(clientName)},%20your%20booking%20for%20${encodeURIComponent(serviceType)}%20is%20CONFIRMED%20with%2050%25%20advance%20deposit." style="display: inline-block; background: #25D366; color: #000000; font-weight: 700; font-size: 12px; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-right: 10px;">
                    Chat on WhatsApp
                </a>
                <a href="mailto:${clientEmail}?subject=Re:%20ARNE%20Works%20Confirmed%20Booking%20-%20${encodeURIComponent(serviceType)}" style="display: inline-block; background: rgba(255,255,255,0.08); color: #ffffff; font-weight: 600; font-size: 12px; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255,255,255,0.15);">
                    Reply via Email
                </a>
            </div>
        </div>
    `;

    if (GMAIL_USER && GMAIL_PASS && !GMAIL_PASS.includes('xxxx')) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: GMAIL_USER,
                    pass: GMAIL_PASS.replace(/\s+/g, '')
                }
            });

            await transporter.sendMail({
                from: `"ARNE Works Booking Portal" <${GMAIL_USER}>`,
                to: BUSINESS_GMAIL,
                subject: emailSubject,
                html: emailHtml
            });
            emailSent = true;
            console.log(`[Nodemailer] Admin notification sent to ${BUSINESS_GMAIL}`);
        } catch (mailErr) {
            console.warn('[Nodemailer Admin Notification Error]:', mailErr.message);
        }
    } else {
        console.log('[Nodemailer Note] Gmail App Password not configured in .env. Email formatted and ready.');
    }

    return {
        success: true,
        status: 200,
        bookingId: bookingId,
        bookingStatus: bookingStatus,
        paymentStatus: paymentStatus,
        totalPrice: totalPrice,
        prepaidAmount: prepaidAmount,
        postpaidAmount: postpaidAmount,
        message: `Booking Confirmed! 50% advance deposit of ₹${prepaidAmount.toLocaleString('en-IN')} paid. Remaining 50% balance (₹${postpaidAmount.toLocaleString('en-IN')}) is due on project delivery.`,
        client: {
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            service: serviceType,
            date: bookingDate,
            slot: bookingTime,
            requirements: projectDesc
        },
        dbSaved,
        whatsappSent,
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
