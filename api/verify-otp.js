// ====================================================================
// ARNE Works — Vercel Serverless Verify OTP Handler (/api/verify-otp)
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
        console.error('[Verify OTP sendJSON Error]', e);
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
        const otp = (body.otp || '').toString().trim();

        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (!cleanPhone || !otp) {
            return sendJSON(res, 400, { success: false, message: 'Phone number and 4-digit OTP are required' });
        }

        const record = global.ARNE_OTP_STORE.get(cleanPhone);
        const isValid = record && record.otp === otp && Date.now() < record.expiresAt;

        if (isValid) {
            global.ARNE_OTP_STORE.delete(cleanPhone);
            return sendJSON(res, 200, {
                success: true,
                message: 'OTP verified successfully.',
                phone: cleanPhone,
                user: {
                    id: `client_${cleanPhone}`,
                    phone: `+91${cleanPhone}`,
                    role: 'authenticated'
                }
            });
        } else {
            return sendJSON(res, 400, {
                success: false,
                message: 'Invalid or expired OTP code. Please check and try again.'
            });
        }
    } catch (err) {
        console.error('[Verify OTP Handler Error]', err);
        return sendJSON(res, 500, { success: false, message: 'Internal Server Error', error: err.message });
    }
};
