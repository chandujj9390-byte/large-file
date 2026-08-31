// ====================================================================
// ARNE Works — 4-Digit Mobile OTP Verification Handler (/api/otp)
// Handles OTP Generation, Twilio WhatsApp/SMS Dispatch & Verification
// ====================================================================

let createClient = null;
try {
    createClient = require('@supabase/supabase-js').createClient;
} catch (e) {}
let twilio = null;
try {
    twilio = require('twilio');
} catch (e) {}

// Server Memory OTP Store: { phone: { otp: "1234", expiresAt: timestamp } }
const otpStore = new Map();

// Twilio Setup
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_SENDER = process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';

let twilioClient = null;
if (twilio && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && !TWILIO_ACCOUNT_SID.includes('YOUR_')) {
    try {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch (e) {}
}

module.exports = async function handleOtpRequest(req, res) {
    const urlParts = req.url.split('?');
    const pathName = urlParts[0];

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
        return;
    }

    try {
        const body = req.body || {};

        // 1. Send OTP Endpoint (/api/send-otp)
        if (pathName === '/api/send-otp') {
            const { phone, bookingId } = body;
            if (!phone) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Mobile phone number is required' }));
                return;
            }

            const cleanPhone = phone.replace(/\D/g, '').slice(-10);
            if (cleanPhone.length < 10) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Please enter a valid 10-digit mobile number' }));
                return;
            }

            // Generate 4-digit OTP
            const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

            otpStore.set(cleanPhone, { otp: generatedOtp, expiresAt });
            console.log(`[ARNE OTP Service] 4-digit OTP generated for +91 ${cleanPhone}: [ ${generatedOtp} ]`);

            // Dispatch via Twilio WhatsApp if configured
            if (twilioClient) {
                try {
                    await twilioClient.messages.create({
                        from: TWILIO_WHATSAPP_SENDER,
                        to: `whatsapp:+91${cleanPhone}`,
                        body: `🔑 *ARNE Works Verification Code*\n\nYour 4-digit Booking OTP is: *${generatedOtp}*\n\nEnter this code on the payment checkout page to confirm your booking slot. Valid for 10 minutes.`
                    });
                    console.log(`[ARNE OTP Service] Twilio WhatsApp OTP sent to +91 ${cleanPhone}`);
                } catch (tErr) {
                    console.warn('[ARNE OTP Service Notice] Twilio dispatch warning:', tErr.message);
                }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: `4-Digit OTP sent successfully to +91 ${cleanPhone}`,
                phone: cleanPhone,
                otp: generatedOtp // Returned for testing & instant preview
            }));
            return;
        }

        // 2. Verify OTP Endpoint (/api/verify-otp)
        if (pathName === '/api/verify-otp') {
            const { phone, otp, bookingId } = body;
            const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

            if (!cleanPhone || !otp) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Phone number and 4-digit OTP are required' }));
                return;
            }

            const storedRecord = otpStore.get(cleanPhone);

            // Allow universal test OTP "1234" or matching generated OTP
            const isValidOtp = (otp === '1234') || (storedRecord && storedRecord.otp === otp && Date.now() < storedRecord.expiresAt);

            if (isValidOtp) {
                otpStore.delete(cleanPhone);
                console.log(`[ARNE OTP Service] OTP verified successfully for +91 ${cleanPhone}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'OTP verified successfully. Confirming booking slot...',
                    phone: cleanPhone
                }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Invalid or expired 4-digit OTP. Please check and try again.'
                }));
            }
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'OTP Endpoint Not Found' }));

    } catch (err) {
        console.error('[ARNE OTP Service Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Internal Server Error', error: err.message }));
    }
};
