/**
 * ARNE Works — Admin Update Booking Status API Handler (/api/admin/update-booking-status)
 * 
 * Functionality:
 * 1. Updates booking status in Supabase ('Confirmed' or 'Declined').
 * 2. Triggers automated Twilio SMS dispatch to client:
 *    - Approved: "Great news! Your booking slot for [Service] with Arne Stories has been CONFIRMED. We look forward to working with you!"
 *    - Declined: "Hello [Client Name], unfortunately, your requested slot is unavailable at this time. Please visit our website to select another time or reply to this message."
 */

const { createClient } = require('@supabase/supabase-js');

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
        console.error('[ARNE Admin Status sendResponse Error]', err);
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
        try { return JSON.parse(req.body); } catch (_) { return {}; }
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

function formatInternationalPhone(phone) {
    const raw = (phone || '').replace(/[\s\-()]/g, '');
    if (!raw) return '';
    if (raw.startsWith('+91')) return raw;
    if (raw.startsWith('+')) return raw;
    const cleanDigits = raw.replace(/\D/g, '');
    const tenDigits = cleanDigits.length > 10 ? cleanDigits.slice(-10) : cleanDigits;
    return `+91${tenDigits}`;
}

async function handleUpdateBookingStatus(reqData) {
    if (!reqData || !reqData.bookingId || !reqData.status) {
        return { success: false, status: 400, message: 'Missing bookingId or status parameter.' };
    }

    const bookingId = reqData.bookingId;
    const newStatus = reqData.status === 'Confirmed' ? 'Confirmed' : (reqData.status === 'Declined' ? 'Declined' : reqData.status);

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yjgbzipdvhgdftxdlccx.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9fjwQtl2NjYC7OYLmy1pVw_oyc4ru2C';
    let bookingData = null;

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // Fetch current booking row
        const { data, error: fetchErr } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (!fetchErr && data) {
            bookingData = data;
        }

        // Update status in Supabase
        const { error: updateErr } = await supabase
            .from('bookings')
            .update({
                status: newStatus,
                booking_status: newStatus
            })
            .eq('id', bookingId);

        if (updateErr) {
            console.error('[Supabase Status Update Error]:', updateErr.message);
        } else {
            console.log(`[Supabase] Booking ${bookingId} status updated to '${newStatus}'`);
        }
    } catch (sbErr) {
        console.warn('[Supabase Client Error]:', sbErr.message);
    }

    // Client details for SMS
    const clientName = (bookingData && (bookingData.client_name || bookingData.customer_name)) || reqData.clientName || 'Client';
    const serviceName = (bookingData && (bookingData.service_name || bookingData.service_type)) || reqData.serviceName || 'Creative Service';
    const rawPhone = (bookingData && (bookingData.client_phone || bookingData.customer_phone)) || reqData.clientPhone;
    const clientPhone = formatInternationalPhone(rawPhone);

    // Trigger Twilio SMS
    let smsSent = false;
    const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

    if (clientPhone && TWILIO_SID && TWILIO_AUTH && TWILIO_PHONE && !TWILIO_SID.startsWith('AC_YOUR')) {
        try {
            const twilio = require('twilio');
            const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);

            let smsBody = '';
            if (newStatus === 'Confirmed') {
                smsBody = `Great news! Your booking slot for ${serviceName} with Arne Stories has been CONFIRMED. We look forward to working with you!`;
            } else if (newStatus === 'Declined') {
                smsBody = `Hello ${clientName}, unfortunately, your requested slot is unavailable at this time. Please visit our website to select another time or reply to this message.`;
            }

            if (smsBody) {
                await twilioClient.messages.create({
                    body: smsBody,
                    from: TWILIO_PHONE,
                    to: clientPhone
                });
                smsSent = true;
                console.log(`[Twilio SMS] Status update (${newStatus}) sent to ${clientPhone}`);
            }
        } catch (twErr) {
            console.warn('[Twilio SMS Error]:', twErr.message);
        }
    }

    return {
        success: true,
        status: 200,
        bookingId,
        newStatus,
        smsSent,
        message: `Booking ${bookingId} marked as ${newStatus}.${smsSent ? ' SMS notification dispatched to client.' : ''}`
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
        const result = await handleUpdateBookingStatus(body);
        return sendResponse(res, result.status || (result.success ? 200 : 400), result);
    } catch (err) {
        console.error('[ARNE Admin Status Update Fatal]', err);
        return sendResponse(res, 500, { success: false, message: 'Internal Server Error' });
    }
};

module.exports.handleUpdateBookingStatus = handleUpdateBookingStatus;
