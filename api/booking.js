/**
 * ARNE Works — Vercel Serverless Booking API Handler (/api/booking)
 * Robust error handling, safe env variable checks, input validation, Supabase saving, and automated email confirmation.
 */

const { handleBookSlotRequest } = require('./book-slot');

// Helper to send JSON responses reliably across Vercel and Node.js
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
        console.error('[ARNE Booking sendResponse Fatal]', err);
        try {
            if (typeof res.end === 'function') res.end(JSON.stringify(data));
        } catch (_) {}
    }
}

// Safely extract request body in both Vercel Serverless and pure Node.js environments
async function parseRequestBody(req) {
    if (!req) return {};

    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch (e) {
            console.error('[ARNE Booking] Failed to parse string req.body:', e.message);
            return {};
        }
    }

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
                console.error('[ARNE Booking] Raw body JSON parse error:', err.message);
                resolve({});
            }
        });

        req.on('error', (err) => {
            clearTimeout(timer);
            console.error('[ARNE Booking] Request stream error:', err.message);
            resolve({});
        });
    });
}

function generateBookingId() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `ARNE-2026-${randomNum}`;
}

async function handleBookingRequest(reqData, clientIp) {
    return handleBookSlotRequest(reqData);
}

// Vercel Serverless Function Primary Entrypoint
module.exports = async function handler(req, res) {
    try {
        if (!req || !res) {
            console.error('[ARNE Booking Handler] Missing req or res');
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
        console.error('[ARNE Booking Handler Fatal Exception]', fatalErr);
        return sendResponse(res, 500, {
            success: false,
            message: 'An unexpected server error occurred while handling booking request.',
            error: fatalErr.message || 'Internal Server Error'
        });
    }
};

module.exports.handleBookingRequest = handleBookingRequest;
module.exports.generateBookingId = generateBookingId;
