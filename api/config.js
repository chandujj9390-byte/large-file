// ====================================================================
// ARNE Works — Vercel Serverless Config API (/api/config)
// Returns public Razorpay Key ID & Environment Mode Status
// ====================================================================

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const isTestMode = keyId ? keyId.startsWith('rzp_test') : false;

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
        success: true,
        razorpayKeyId: keyId,
        isTestMode: isTestMode,
        modeMessage: isTestMode ? 'Running in Test Mode' : (keyId ? 'Running in Production Live Mode' : 'Razorpay Key ID not configured in environment')
    }));
};
