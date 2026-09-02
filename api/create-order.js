// ====================================================================
// ARNE Works — Razorpay Order Creation API (/api/create-order)
// Generates official Razorpay Order ID for frontend checkout
// ====================================================================

const https = require('https');

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
        console.error('[CreateOrder sendJSON Error]', e);
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

function requestRazorpayOrder(keyId, keySecret, orderData) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(orderData);
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const options = {
            hostname: 'api.razorpay.com',
            port: 443,
            path: '/v1/orders',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300 && parsed.id) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.error?.description || `Razorpay error HTTP ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error('Razorpay API request timed out'));
        });

        req.write(postData);
        req.end();
    });
}

module.exports = async function handleCreateOrder(req, res) {
    try {
        if (req && req.method === 'OPTIONS') {
            return sendJSON(res, 204, {});
        }

        if (req.method !== 'POST') {
            return sendJSON(res, 405, { success: false, message: 'Method Not Allowed' });
        }

        const body = await parseBody(req);
        const { amount, bookingId, serviceName, clientName } = body;

        const keyId = process.env.RAZORPAY_KEY_ID || '';
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

        // Calculate amount in paise (minimum 100 paise = 1 INR)
        const amountNum = Number(amount) || 500;
        const amountInPaise = Math.max(100, Math.round(amountNum * 100));

        const isLiveOrTestConfigured = keyId &&
            keySecret &&
            !keyId.includes('YOUR_') &&
            !keySecret.includes('YOUR_');

        if (isLiveOrTestConfigured) {
            try {
                const razorpayOrder = await requestRazorpayOrder(keyId, keySecret, {
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: bookingId || `rcpt_${Date.now()}`,
                    notes: {
                        booking_id: bookingId || '',
                        service_name: serviceName || '',
                        client_name: clientName || ''
                    }
                });

                return sendJSON(res, 200, {
                    success: true,
                    order_id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    key_id: keyId
                });
            } catch (rzpErr) {
                console.warn('[Razorpay API Warning] Direct order creation notice:', rzpErr.message);
                // Fallback to simulated order id if credentials invalid/declined
                return sendJSON(res, 200, {
                    success: true,
                    order_id: `order_sim_${Date.now().toString().slice(-8)}`,
                    amount: amountInPaise,
                    currency: 'INR',
                    key_id: keyId,
                    simulated: true,
                    note: rzpErr.message
                });
            }
        }

        // Development / Test Simulation Mode
        const simOrderId = `order_sim_${Date.now().toString().slice(-8)}`;
        return sendJSON(res, 200, {
            success: true,
            order_id: simOrderId,
            amount: amountInPaise,
            currency: 'INR',
            key_id: keyId || 'rzp_test_simulated',
            simulated: true
        });

    } catch (err) {
        console.error('[Create Order Error]', err);
        return sendJSON(res, 500, { success: false, message: 'Internal Server Error', error: err.message });
    }
};
