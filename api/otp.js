// ====================================================================
// ARNE Works — Combined OTP Endpoint Handler (/api/otp)
// ====================================================================

const sendOtpHandler = require('./send-otp');
const verifyOtpHandler = require('./verify-otp');

module.exports = async function handleOtpRequest(req, res) {
    try {
        const url = req.url || '';
        const body = (req.body && typeof req.body === 'object') ? req.body : {};

        if (url.includes('verify') || body.action === 'verify' || body.otp) {
            return verifyOtpHandler(req, res);
        } else {
            return sendOtpHandler(req, res);
        }
    } catch (err) {
        console.error('[Combined OTP Error]', err);
        if (res && !res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }
};

