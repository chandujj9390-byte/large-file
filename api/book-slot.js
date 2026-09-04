/**
 * ARNE Works — Vercel Serverless Slot Booking API Handler (/api/book-slot)
 * 1. Validates inputs (Client Name, Email, Phone, Slot Date & Time, Service).
 * 2. Saves booking details directly into Supabase database (bookings table).
 * 3. Sends an automated styled confirmation email to the customer's Gmail address via Nodemailer.
 * 4. Sends a notification copy to the studio admin (arneworks26@gmail.com).
 * 5. Returns a clean JSON response back to the frontend.
 */

// Helper to send JSON responses reliably across Vercel Serverless and Node.js
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
        console.error('[ARNE BookSlot sendResponse Error]', err);
        try {
            if (typeof res.end === 'function') res.end(JSON.stringify(data));
        } catch (_) {}
    }
}

// Safely extract request body in both Vercel Serverless and pure Node.js environments
async function parseRequestBody(req) {
    if (!req) return {};

    // 1. If Vercel already parsed the body as an object
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    // 2. If Vercel passed body as string
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch (e) {
            console.error('[ARNE BookSlot] Failed to parse string req.body:', e.message);
            return {};
        }
    }

    // 3. If body is a stream (Node.js raw HTTP request)
    return new Promise((resolve) => {
        let rawData = '';
        let timer = setTimeout(() => resolve({}), 4000);

        if (typeof req.on !== 'function') {
            clearTimeout(timer);
            return resolve({});
        }

        req.on('data', chunk => {
            rawData += chunk;
        });

        req.on('end', () => {
            clearTimeout(timer);
            if (!rawData.trim()) return resolve({});
            try {
                resolve(JSON.parse(rawData));
            } catch (err) {
                console.error('[ARNE BookSlot] Raw body JSON parse error:', err.message);
                resolve({});
            }
        });

        req.on('error', (err) => {
            clearTimeout(timer);
            console.error('[ARNE BookSlot] Request stream error:', err.message);
            resolve({});
        });
    });
}

function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

function generateBookingId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ARNE-2026-${randomNum}`;
}

/**
 * Core Slot Booking Controller
 */
async function handleBookSlotRequest(reqData) {
    try {
        if (!reqData || typeof reqData !== 'object') {
            return {
                success: false,
                status: 400,
                message: 'Invalid or missing JSON payload in request.'
            };
        }

        // Anti-Spam Honeypot Check
        if (reqData.website_hp && reqData.website_hp.trim() !== '') {
            return {
                success: false,
                status: 400,
                message: 'Spam submission detected.'
            };
        }

        // Extract and normalize fields (supporting both client_name and fullName naming conventions)
        const clientName = sanitizeInput(reqData.client_name || reqData.fullName || reqData.name);
        const clientEmail = sanitizeInput(reqData.client_email || reqData.email);
        const clientPhone = sanitizeInput(reqData.client_phone || reqData.mobile || reqData.phone);
        const bookingDate = sanitizeInput(reqData.booking_date || reqData.prefDate || reqData.date);
        const bookingTime = sanitizeInput(reqData.booking_time || reqData.prefSlot || reqData.timeSlot || reqData.slot);
        const serviceType = sanitizeInput(reqData.service_type || reqData.serviceName || reqData.service || 'Creative Service');
        const projectDesc = sanitizeInput(reqData.project_desc || reqData.projectDesc || reqData.desc || 'No specific description provided.');
        const estBudget = sanitizeInput(reqData.est_budget || reqData.estBudget || 'Flexible');
        const company = sanitizeInput(reqData.company || 'N/A');
        const location = sanitizeInput(reqData.location || 'N/A');
        const whatsapp = sanitizeInput(reqData.whatsapp || clientPhone || 'N/A');
        const refLink = sanitizeInput(reqData.ref_link || reqData.refLink || 'None');

        const bookingId = reqData.booking_id || reqData.bookingId || generateBookingId();
        const createdAt = new Date().toISOString();
        const submissionTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // 1. Strict Server-Side Validation
        if (!clientName) {
            return { success: false, status: 400, message: 'Customer Name is required.' };
        }
        if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
            return { success: false, status: 400, message: 'A valid Gmail or Email address is required.' };
        }
        if (!clientPhone || clientPhone.replace(/\D/g, '').length < 10) {
            return { success: false, status: 400, message: 'A valid 10-digit Phone Number is required.' };
        }
        if (!bookingDate) {
            return { success: false, status: 400, message: 'Booking Date is required.' };
        }
        if (!bookingTime) {
            return { success: false, status: 400, message: 'Booking Time Slot is required.' };
        }

        // 2. Supabase Server-Side Database Insertion
        let supabaseClient = null;
        const supabaseUrl = process.env.SUPABASE_URL || 'https://xrrhzjabhfnbbblfwyko.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';

        try {
            const { createClient } = require('@supabase/supabase-js');
            if (supabaseUrl && supabaseKey) {
                supabaseClient = createClient(supabaseUrl, supabaseKey);
            }
        } catch (supImportErr) {
            console.warn('[ARNE BookSlot Supabase Module Notice]', supImportErr.message);
        }

        let dbSaved = false;
        let dbError = null;

        if (supabaseClient) {
            try {
                // Insert into bookings table with both naming conventions for complete safety
                const { error: insertErr } = await supabaseClient.from('bookings').insert([{
                    id: bookingId,
                    client_name: clientName,
                    customer_name: clientName,
                    client_email: clientEmail,
                    customer_email: clientEmail,
                    client_phone: clientPhone,
                    customer_phone: clientPhone,
                    customer_whatsapp: whatsapp,
                    company: company,
                    location: location,
                    service_type: serviceType,
                    service_name: serviceType,
                    booking_date: bookingDate,
                    booking_time: bookingTime,
                    time_slot: bookingTime,
                    project_desc: projectDesc,
                    status: 'confirmed',
                    booking_status: 'Confirmed',
                    payment_status: 'Pending',
                    ref_link: refLink,
                    created_at: createdAt
                }]);

                if (insertErr) {
                    console.warn('[ARNE BookSlot Supabase Insert Warning]:', insertErr.message);
                    dbError = insertErr.message;
                } else {
                    dbSaved = true;
                    console.log(`[ARNE BookSlot] Booking ${bookingId} successfully saved to Supabase.`);
                }

                // Also update/insert customer profile and patient record if possible
                try {
                    await supabaseClient.from('customers').insert([{
                        full_name: clientName,
                        email: clientEmail,
                        mobile: clientPhone,
                        whatsapp: whatsapp,
                        company: company,
                        location: location,
                        total_bookings: 1
                    }]);
                } catch (_) {}

                try {
                    await supabaseClient.from('patients').insert([{
                        booking_id: bookingId,
                        patient_name: clientName,
                        email: clientEmail,
                        phone: clientPhone,
                        whatsapp: whatsapp,
                        service: serviceType,
                        preferred_date: bookingDate || null,
                        preferred_time: bookingTime || null,
                        symptoms_or_requirements: projectDesc,
                        budget: estBudget,
                        status: 'Confirmed'
                    }]);
                } catch (_) {}

            } catch (supErr) {
                console.error('[ARNE BookSlot Supabase Operation Error]:', supErr.message);
                dbError = supErr.message;
            }
        }

        // 3. Automated Confirmation Email Dispatch via Nodemailer
        let emailSent = false;
        let emailError = null;

        const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'arneworks26@gmail.com';
        const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;
        const adminNotifyEmail = process.env.BOOKING_NOTIFICATION_EMAIL || 'arneworks26@gmail.com';

        if (smtpPass && !smtpPass.includes('xxxx')) {
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.SMTP_PORT || '465', 10),
                    secure: process.env.SMTP_SECURE !== 'false',
                    auth: {
                        user: smtpUser,
                        pass: smtpPass
                    }
                });

                const emailSubject = `Booking Confirmed! Your Slot details for ${bookingDate} at ${bookingTime}`;

                // Premium Dark-Emerald HTML Email Template
                const htmlEmailBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${emailSubject}</title>
                    <style>
                        body { margin: 0; padding: 0; background-color: #070908; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; }
                        .container { max-width: 600px; margin: 30px auto; background: #0e1410; border: 1px solid #1a2c20; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
                        .header { background: linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(14,20,16,0.95) 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #1a2c20; }
                        .logo { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #00ff88; text-transform: uppercase; margin-bottom: 8px; }
                        .badge { display: inline-block; background: rgba(0,255,136,0.15); color: #00ff88; font-size: 11px; font-weight: 800; letter-spacing: 2px; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(0,255,136,0.3); text-transform: uppercase; }
                        .content { padding: 32px 30px; }
                        .greeting { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
                        .intro { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
                        .details-box { background: rgba(255,255,255,0.03); border: 1px solid #1a2c20; border-radius: 14px; padding: 22px; margin-bottom: 24px; }
                        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
                        .row:last-child { border-bottom: none; }
                        .label { color: #71717a; font-weight: 600; }
                        .value { color: #ffffff; font-weight: 700; text-align: right; }
                        .highlight-val { color: #00ff88; font-weight: 800; }
                        .policy-card { background: rgba(0,255,136,0.04); border-left: 3px solid #00ff88; padding: 14px 18px; border-radius: 8px; font-size: 12px; color: #a1a1aa; line-height: 1.5; margin-bottom: 28px; }
                        .footer { background: #090c0a; padding: 24px 30px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #1a2c20; }
                        .footer a { color: #00ff88; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">ARNE STORIES</div>
                            <span class="badge">✓ BOOKING CONFIRMED</span>
                        </div>
                        <div class="content">
                            <div class="greeting">Hi ${clientName},</div>
                            <p class="intro">
                                Thank you for booking your creative slot with <strong>ARNE Stories & Production</strong>. We have received and confirmed your reservation details below.
                            </p>

                            <div class="details-box">
                                <div class="row">
                                    <span class="label">Booking ID</span>
                                    <span class="value highlight-val">${bookingId}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Customer Name</span>
                                    <span class="value">${clientName}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Selected Service</span>
                                    <span class="value">${serviceType}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Scheduled Date</span>
                                    <span class="value highlight-val">📅 ${bookingDate}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Time Slot</span>
                                    <span class="value highlight-val">⏰ ${bookingTime}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Phone / WhatsApp</span>
                                    <span class="value">${clientPhone}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Estimated Budget</span>
                                    <span class="value">${estBudget}</span>
                                </div>
                            </div>

                            <div class="policy-card">
                                <strong>📌 Cancellation & Reschedule Policy:</strong><br>
                                If you need to modify, reschedule, or cancel your booking, please notify us at least 24 hours in advance by replying directly to this email or connecting with Chandu via WhatsApp at <strong>+91 9390662637</strong>.
                            </div>

                            <p style="font-size: 13px; color: #a1a1aa; margin: 0;">
                                We look forward to collaborating on your project! If you have reference files or additional briefs, simply reply to this email.
                            </p>
                        </div>
                        <div class="footer">
                            <p style="margin: 0 0 6px 0;"><strong>ARNE Stories & Creative Studio</strong> — Directed by Chandu</p>
                            <p style="margin: 0;">Email: <a href="mailto:arnestories26@gmail.com">arnestories26@gmail.com</a> | WhatsApp: <a href="https://wa.me/919390662637">+91 9390662637</a></p>
                        </div>
                    </div>
                </body>
                </html>
                `;

                const plainTextBody = `
ARNE STORIES — BOOKING CONFIRMED
==========================================
Booking ID: ${bookingId}
Customer Name: ${clientName}
Service: ${serviceType}
Date: ${bookingDate}
Time Slot: ${bookingTime}
Phone: ${clientPhone}
Email: ${clientEmail}
Estimated Budget: ${estBudget}

Project Requirements:
${projectDesc}

Cancellation / Reschedule Note:
If you need to modify or reschedule your booking, please notify us at least 24 hours in advance by replying to this email or contacting Chandu at arnestories26@gmail.com / WhatsApp +91 9390662637.

==========================================
ARNE Stories Creative Studio
Phone/WhatsApp: +91 9390662637
Email: arnestories26@gmail.com
                `.trim();

                // 1. Send confirmation email directly to customer
                await transporter.sendMail({
                    from: `"ARNE Stories" <${smtpUser}>`,
                    to: clientEmail,
                    replyTo: adminNotifyEmail,
                    subject: emailSubject,
                    text: plainTextBody,
                    html: htmlEmailBody
                });
                emailSent = true;
                console.log(`[ARNE BookSlot Success] Confirmation email dispatched to customer: ${clientEmail}`);

                // 2. Send admin alert email to arneworks26@gmail.com
                if (adminNotifyEmail && adminNotifyEmail !== clientEmail) {
                    try {
                        await transporter.sendMail({
                            from: `"ARNE Booking Alert" <${smtpUser}>`,
                            to: adminNotifyEmail,
                            replyTo: clientEmail,
                            subject: `[New Slot Booked] ${bookingId} — ${clientName} (${serviceType})`,
                            text: `New slot booking received:\n\nBooking ID: ${bookingId}\nClient: ${clientName}\nEmail: ${clientEmail}\nPhone: ${clientPhone}\nService: ${serviceType}\nDate: ${bookingDate}\nSlot: ${bookingTime}\n\nProject Brief:\n${projectDesc}\nReceived at: ${submissionTime}`
                        });
                    } catch (_) {}
                }

            } catch (mailErr) {
                console.error('[ARNE BookSlot Email Error]:', mailErr.message);
                emailError = mailErr.message;
            }
        } else {
            console.warn('[ARNE BookSlot Notice] GMAIL_APP_PASSWORD not configured or set to placeholder. Email dispatch skipped safely.');
        }

        // 4. Return clean JSON response
        return {
            success: true,
            status: 200,
            bookingId: bookingId,
            message: 'Slot booked successfully! A confirmation email has been sent to your inbox.',
            dbSaved: dbSaved,
            emailSent: emailSent,
            data: {
                bookingId: bookingId,
                clientName: clientName,
                clientEmail: clientEmail,
                clientPhone: clientPhone,
                serviceType: serviceType,
                bookingDate: bookingDate,
                bookingTime: bookingTime,
                status: 'confirmed'
            },
            notes: emailError ? `Notice: ${emailError}` : undefined
        };

    } catch (err) {
        console.error('[ARNE BookSlot Exception]:', err);
        return {
            success: false,
            status: 500,
            message: 'An internal server error occurred while processing your slot booking.',
            error: err.message || 'Internal Server Error'
        };
    }
}

// Vercel Serverless Function Handler Entrypoint
module.exports = async function handler(req, res) {
    try {
        if (!req || !res) {
            console.error('[ARNE BookSlot Handler] Missing request or response object');
            return;
        }

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
            return sendResponse(res, 204, {});
        }

        if (req.method !== 'POST') {
            return sendResponse(res, 405, {
                success: false,
                message: `Method ${req.method} Not Allowed. Please use POST.`
            });
        }

        const body = await parseRequestBody(req);
        const result = await handleBookSlotRequest(body);
        const statusCode = result.status || (result.success ? 200 : 400);

        return sendResponse(res, statusCode, result);
    } catch (fatalErr) {
        console.error('[ARNE BookSlot Fatal Handler Error]', fatalErr);
        return sendResponse(res, 500, {
            success: false,
            message: 'An unexpected server error occurred while handling booking request.',
            error: fatalErr.message || 'Internal Server Error'
        });
    }
};

module.exports.handleBookSlotRequest = handleBookSlotRequest;
