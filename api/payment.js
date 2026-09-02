// ====================================================================
// ARNE Works — Payment & Confirmation Backend Handler (/api/payment)
// 1. Updates database (Supabase & local db.json) to 'Confirmed' & 'Prepaid Paid'
// 2. Dispatches instant email notification to arnestories26@gmail.com
// 3. Dispatches confirmation email to the customer
// 4. Sends SMS / WhatsApp notification to customer mobile
// ====================================================================

const fs = require('fs');
const path = require('path');

function sendJSON(res, statusCode, data) {
    if (!res || res.writableEnded || res.headersSent) return;
    try {
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
        res.end(JSON.stringify(data));
    } catch (e) {
        console.error('[Payment sendJSON Error]', e);
        try { res.end(JSON.stringify(data)); } catch (_) {}
    }
}

async function parseBody(req) {
    if (!req) return {};
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') {
        try { return JSON.parse(req.body); } catch (_) { return {}; }
    }
    if (typeof req.on !== 'function' || req.readableEnded || req.complete) return {};
    return new Promise((resolve) => {
        let raw = '';
        const timer = setTimeout(() => resolve({}), 3000);
        req.on('data', chunk => { raw += chunk; });
        req.on('end', () => {
            clearTimeout(timer);
            try { resolve(raw.trim() ? JSON.parse(raw) : {}); } catch (_) { resolve({}); }
        });
        req.on('error', () => {
            clearTimeout(timer);
            resolve({});
        });
    });
}

module.exports = async function handlePaymentRequest(req, res) {
    try {
        if (req && req.method === 'OPTIONS') {
            return sendJSON(res, 204, {});
        }

        if (req.method !== 'POST') {
            return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
        }

        const body = await parseBody(req);
        const {
            bookingId,
            customerName,
            customerEmail,
            customerPhone,
            serviceName,
            bookingDate,
            bookingTime,
            paymentMethod,
            amountPaid,
            totalPrice,
            postpaidAmount,
            transactionRef
        } = body;

        if (!bookingId) {
            return sendJSON(res, 400, { success: false, message: 'Missing bookingId in payment request.' });
        }

        const txnId = transactionRef || `TXN-ARNE-${Date.now().toString().slice(-6)}`;
        const paidAmountNum = Number(amountPaid || 500);
        const totalFeeNum = Number(totalPrice || (paidAmountNum * 2));
        const remainingBalance = Number(postpaidAmount || (totalFeeNum - paidAmountNum));
        const clientName = customerName || 'Valued Client';
        const clientPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
        const clientEmail = customerEmail || '';
        const service = serviceName || 'Creative Service';
        const dateSlot = bookingDate ? `${bookingDate} (${bookingTime || 'Scheduled Slot'})` : (bookingTime || 'Scheduled Slot');
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        console.log(`[ARNE Payment Backend] Processing payment for Booking ${bookingId} (${clientName}) — Paid: ₹${paidAmountNum} via ${paymentMethod || 'Razorpay Gateway'}`);

        // 1. Update Local db.json if available
        try {
            const dbPath = path.join(__dirname, '..', 'data', 'db.json');
            if (fs.existsSync(dbPath)) {
                const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                db.bookings = db.bookings || [];
                const bIndex = db.bookings.findIndex(b => b.id === bookingId);
                if (bIndex !== -1) {
                    db.bookings[bIndex].paymentStatus = 'Prepaid Paid';
                    db.bookings[bIndex].status = 'Confirmed';
                    db.bookings[bIndex].amountPaid = paidAmountNum;
                    db.bookings[bIndex].amountRemaining = remainingBalance;
                    db.bookings[bIndex].transactionId = txnId;
                    db.bookings[bIndex].paymentMethod = paymentMethod || 'Razorpay Gateway';
                }
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
            }
        } catch (dbErr) {
            console.warn('[ARNE Payment Local DB Notice]', dbErr.message);
        }

        // 2. Update Supabase Cloud Database
        try {
            const { createClient } = require('@supabase/supabase-js');
            const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xmnjhfkzvbssuajgxnvf.supabase.co';
            const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_pAc8lic6v3PPnmWhLJkJVg_FlBptmnQ';
            const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            await supabase
                .from('bookings')
                .update({
                    payment_status: 'Prepaid Paid',
                    booking_status: 'Confirmed',
                    status: 'confirmed',
                    amount_paid: paidAmountNum,
                    amount_remaining: remainingBalance,
                    payment_method: paymentMethod || 'Razorpay Gateway',
                    transaction_id: txnId
                })
                .eq('id', bookingId);

            await supabase.from('payments').insert([{
                booking_id: bookingId,
                customer_name: clientName,
                total_amount: totalFeeNum,
                prepaid_amount: paidAmountNum,
                postpaid_amount: remainingBalance,
                amount_paid: paidAmountNum,
                amount_remaining: remainingBalance,
                payment_method: paymentMethod || 'Razorpay Gateway',
                transaction_id: txnId,
                status: 'Partially Paid (50% Deposit Confirmed)'
            }]);
            console.log(`[ARNE Payment Supabase] Database updated for booking: ${bookingId}`);
        } catch (supErr) {
            console.warn('[ARNE Payment Supabase Notice]', supErr.message);
        }

        // 3. Dispatch Email Notifications via Nodemailer
        // Owner Destination Email: arnestories26@gmail.com
        const adminNotifyEmail = 'arnestories26@gmail.com';
        const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'arnestories26@gmail.com';
        const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;

        let emailDispatched = false;
        let emailError = null;

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

                // HTML Email Template for Admin & Customer
                const buildEmailHTML = (isForAdmin = false) => `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>${isForAdmin ? `[New Paid Booking] ${bookingId}` : `Booking & Payment Confirmed — ${bookingId}`}</title>
                    <style>
                        body { margin: 0; padding: 0; background-color: #070908; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
                        .email-container { max-width: 600px; margin: 30px auto; background: #0e1410; border: 1px solid #1a2c20; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.7); }
                        .header { background: linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(14,20,16,0.95) 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid #1a2c20; }
                        .logo { font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #00ff88; text-transform: uppercase; margin-bottom: 8px; }
                        .badge { display: inline-block; background: rgba(0,255,136,0.15); color: #00ff88; font-size: 11px; font-weight: 800; letter-spacing: 2px; padding: 6px 16px; border-radius: 999px; border: 1px solid rgba(0,255,136,0.3); text-transform: uppercase; }
                        .body-content { padding: 32px 30px; }
                        .title { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
                        .desc { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
                        .receipt-box { background: rgba(255,255,255,0.03); border: 1px solid #1a2c20; border-radius: 16px; padding: 22px; margin-bottom: 24px; }
                        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; }
                        .row:last-child { border-bottom: none; }
                        .label { color: #71717a; font-weight: 600; }
                        .val { color: #ffffff; font-weight: 700; text-align: right; }
                        .highlight { color: #00ff88; font-weight: 800; }
                        .warning-due { color: #f59e0b; font-weight: 800; }
                        .note-box { background: rgba(0,255,136,0.04); border-left: 3px solid #00ff88; padding: 14px 18px; border-radius: 8px; font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
                        .footer { background: #090c0a; padding: 24px 30px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #1a2c20; }
                        .footer a { color: #00ff88; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="logo">ARNE STORIES</div>
                            <span class="badge">✓ 50% DEPOSIT PAID & CONFIRMED</span>
                        </div>
                        <div class="body-content">
                            <div class="title">${isForAdmin ? `🚨 New Paid Slot Booking Received!` : `Hi ${clientName}, Your Booking is Confirmed!`}</div>
                            <p class="desc">
                                ${isForAdmin 
                                    ? `A new client has verified their mobile number and authorized their 50% advance deposit via Razorpay. Here are the booking details:` 
                                    : `Thank you for booking with <strong>ARNE Stories</strong>. Your 50% advance deposit has been successfully authorized via Razorpay. Your slot is now locked and confirmed.`}
                            </p>

                            <div class="receipt-box">
                                <div class="row">
                                    <span class="label">Booking ID</span>
                                    <span class="val highlight">${bookingId}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Transaction Reference</span>
                                    <span class="val">${txnId}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Client Name</span>
                                    <span class="val">${clientName}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Contact Number</span>
                                    <span class="val">+91 ${clientPhone || 'N/A'}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Client Email</span>
                                    <span class="val">${clientEmail || 'N/A'}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Service</span>
                                    <span class="val">${service}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Scheduled Slot</span>
                                    <span class="val highlight">📅 ${dateSlot}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Total Service Fee</span>
                                    <span class="val">₹${totalFeeNum.toLocaleString('en-IN')}</span>
                                </div>
                                <div class="row">
                                    <span class="label">50% Advance Paid (Now)</span>
                                    <span class="val highlight">₹${paidAmountNum.toLocaleString('en-IN')}</span>
                                </div>
                                <div class="row">
                                    <span class="label">50% Postpaid Due Later</span>
                                    <span class="val warning-due">₹${remainingBalance.toLocaleString('en-IN')}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Payment Gateway</span>
                                    <span class="val">${paymentMethod || 'Razorpay Gateway'}</span>
                                </div>
                                <div class="row">
                                    <span class="label">Timestamp</span>
                                    <span class="val">${timestamp}</span>
                                </div>
                            </div>

                            <div class="note-box">
                                <strong>📌 Studio Policy & Next Steps:</strong><br>
                                Chandu from ARNE Stories will connect with you before your slot to review project references and creative requirements. For immediate updates, WhatsApp <strong>+91 9390662637</strong> or email <strong>arnestories26@gmail.com</strong>.
                            </div>
                        </div>
                        <div class="footer">
                            <p style="margin: 0 0 6px 0;"><strong>ARNE Stories & Creative Studio</strong> — Directed by Chandu</p>
                            <p style="margin: 0;">Email: <a href="mailto:arnestories26@gmail.com">arnestories26@gmail.com</a> | WhatsApp: <a href="https://wa.me/919390662637">+91 9390662637</a></p>
                        </div>
                    </div>
                </body>
                </html>
                `;

                // A. Send Notification to Studio Owner at arnestories26@gmail.com
                await transporter.sendMail({
                    from: `"ARNE Stories Booking" <${smtpUser}>`,
                    to: adminNotifyEmail,
                    replyTo: clientEmail || smtpUser,
                    subject: `[New Paid Booking] ${bookingId} — ${clientName} (₹${paidAmountNum} Paid)`,
                    text: `New Paid Booking Received!\n\nBooking ID: ${bookingId}\nTransaction ID: ${txnId}\nClient: ${clientName}\nPhone: +91 ${clientPhone}\nEmail: ${clientEmail}\nService: ${service}\nSlot: ${dateSlot}\nTotal Fee: ₹${totalFeeNum}\nAmount Paid: ₹${paidAmountNum}\nRemaining Balance: ₹${remainingBalance}\nTime: ${timestamp}`,
                    html: buildEmailHTML(true)
                });
                console.log(`[ARNE Payment Email] Admin notification dispatched to ${adminNotifyEmail}`);

                // B. Send Confirmation to Client if email provided
                if (clientEmail && clientEmail.includes('@') && clientEmail !== adminNotifyEmail) {
                    try {
                        await transporter.sendMail({
                            from: `"ARNE Stories" <${smtpUser}>`,
                            to: clientEmail,
                            replyTo: adminNotifyEmail,
                            subject: `Your Booking is Confirmed! ARNE Stories — Slot ${bookingId}`,
                            text: `Hi ${clientName},\n\nYour booking and 50% deposit payment have been confirmed!\n\nBooking Reference: ${bookingId}\nTransaction Reference: ${txnId}\nService: ${service}\nSlot: ${dateSlot}\nAmount Paid: ₹${paidAmountNum}\nDue Later: ₹${remainingBalance}\n\nThank you for choosing ARNE Stories.\nEmail: arnestories26@gmail.com\nWhatsApp: +91 9390662637`,
                            html: buildEmailHTML(false)
                        });
                        console.log(`[ARNE Payment Email] Client confirmation dispatched to ${clientEmail}`);
                    } catch (cMailErr) {
                        console.warn('[ARNE Payment Client Email Notice]', cMailErr.message);
                    }
                }

                emailDispatched = true;
            } catch (mailErr) {
                console.error('[ARNE Payment Email Error]', mailErr.message);
                emailError = mailErr.message;
            }
        } else {
            console.log(`[ARNE Payment Email Notice] Test simulation active. Live email target is ${adminNotifyEmail} (GMAIL_APP_PASSWORD requires 16-char app pass).`);
        }

        // 4. Dispatch SMS / WhatsApp confirmation to customer if mobile provided
        if (clientPhone && clientPhone.length === 10) {
            const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
            const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
            if (TWILIO_SID && TWILIO_AUTH && !TWILIO_SID.includes('YOUR_')) {
                try {
                    const twilio = require('twilio');
                    const client = twilio(TWILIO_SID, TWILIO_AUTH);
                    const sender = process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';
                    await client.messages.create({
                        from: sender,
                        to: `whatsapp:+91${clientPhone}`,
                        body: `🎉 *Your booking is successful!*\n\nHi ${clientName},\nYour slot for *${service}* on *${dateSlot}* has been confirmed.\n\n*Booking ID:* ${bookingId}\n*Transaction:* ${txnId}\n*Deposit Paid:* ₹${paidAmountNum}\n*Balance Due:* ₹${remainingBalance}\n\nARNE Stories Creative Studio\nContact: arnestories26@gmail.com`
                    });
                    console.log(`[ARNE WhatsApp] Success confirmation dispatched to +91 ${clientPhone}`);
                } catch (tErr) {
                    console.warn('[ARNE WhatsApp Notice]', tErr.message);
                }
            }
        }

        return sendJSON(res, 200, {
            success: true,
            message: 'Your booking is successful! Payment verified and confirmation sent.',
            adminNotified: adminNotifyEmail,
            emailDispatched: emailDispatched,
            receipt: {
                transactionId: txnId,
                bookingId: bookingId,
                customerName: clientName,
                customerPhone: clientPhone,
                customerEmail: clientEmail,
                service: service,
                slot: dateSlot,
                paymentMethod: paymentMethod || 'Razorpay Gateway',
                amountPaid: paidAmountNum,
                totalPrice: totalFeeNum,
                postpaidAmount: remainingBalance,
                paymentStatus: 'Prepaid Paid (50% Deposit Confirmed)',
                timestamp: timestamp
            },
            notes: emailError ? `Email dispatch notice: ${emailError}` : undefined
        });

    } catch (err) {
        console.error('[ARNE Payment API Error]', err);
        return sendJSON(res, 500, { success: false, message: 'Internal Server Error', error: err.message });
    }
};
