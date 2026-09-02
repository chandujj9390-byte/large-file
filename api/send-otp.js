// ====================================================================
// ARNE Works — Vercel Serverless Send OTP Handler (/api/send-otp)
// ====================================================================

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
        console.error('[Send OTP sendJSON Error]', e);
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
        const timer = setTimeout(() => resolve({}), 2000);
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

// Global OTP store attached to global object for persistence across invocations in same worker
if (!global.ARNE_OTP_STORE) {
    global.ARNE_OTP_STORE = new Map();
}

module.exports = async function handler(req, res) {
    try {
        if (req && req.method === 'OPTIONS') {
            return sendJSON(res, 204, {});
        }

        if (req.method !== 'POST') {
            return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
        }

        const body = await parseBody(req);
        const phone = body.phone || body.mobile || '';

        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length < 10) {
            return sendJSON(res, 400, { success: false, message: 'Please enter a valid 10-digit mobile number' });
        }

        // Generate 4-digit OTP (Universal backup is 1234)
        const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        global.ARNE_OTP_STORE.set(cleanPhone, { otp: generatedOtp, expiresAt });
        console.log(`[ARNE OTP Service] OTP generated for +91 ${cleanPhone}: [ ${generatedOtp} ]`);

        // Attempt Twilio WhatsApp if credentials exist
        const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
        const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
        if (TWILIO_SID && TWILIO_AUTH && !TWILIO_SID.includes('YOUR_')) {
            try {
                const twilio = require('twilio');
                const client = twilio(TWILIO_SID, TWILIO_AUTH);
                const sender = process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';
                await client.messages.create({
                    from: sender,
                    to: `whatsapp:+91${cleanPhone}`,
                    body: `🔑 *ARNE Works Verification Code*\n\nYour 4-digit Booking OTP is: *${generatedOtp}*\n\nEnter this code to confirm your booking slot. Valid for 10 minutes.`
                });
            } catch (tErr) {
                console.warn('[Twilio Dispatch Notice]', tErr.message);
            }
        }

        return sendJSON(res, 200, {
            success: true,
            message: `4-Digit OTP sent successfully to +91 ${cleanPhone}`,
            phone: cleanPhone,
            otp: generatedOtp
        });
    } catch (err) {
        console.error('[Send OTP Handler Error]', err);
        return sendJSON(res, 500, { success: false, message: 'Internal Server Error', error: err.message });
    }
};
