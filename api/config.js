// ====================================================================
// ARNE Works — Vercel Serverless Config API (/api/config)
// Returns public Razorpay Key ID & Environment Mode Status
// ====================================================================

function sendJSON(res, statusCode, data) {
    if (!res || res.writableEnded || res.headersSent) return;
    try {
        if (typeof res.setHeader === 'function') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        console.error('[Config API sendJSON Error]', e);
        try { res.end(JSON.stringify(data)); } catch (_) {}
    }
}

module.exports = async function handler(req, res) {
    try {
        if (req && req.method === 'OPTIONS') {
            return sendJSON(res, 204, {});
        }

        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TSX6Tz78qBWw70';
        const isTestMode = keyId.startsWith('rzp_test');

        return sendJSON(res, 200, {
            success: true,
            razorpayKeyId: keyId,
            isTestMode: isTestMode,
            modeMessage: isTestMode ? 'Running in Test Mode' : (keyId ? 'Running in Production Live Mode' : 'Razorpay Key ID not configured in environment')
        });
    } catch (err) {
        console.error('[Config API Handler Error]', err);
        return sendJSON(res, 500, { success: false, error: err.message || 'Internal Server Error' });
    }
};

