/**
 * ARNE Works — Secure Enterprise Server Architecture
 * Handles Static Assets, Secured /admin Route, PBKDF2 Auth & Server-Side APIs
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { handleBookingRequest } = require('./api/booking');
const handleContactForm = require('./api/contact');
const handlePaymentRequest = require('./api/payment');
const handleOtpRequest = require('./api/otp');
const handleCreateOrder = require('./api/create-order');

// Load environment variables from .env
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'data', 'db.json');

try {
    if (fs.existsSync(path.join(ROOT, '.env'))) {
        const envConfig = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
        envConfig.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const parts = trimmed.split('=');
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                if (key && value) process.env[key] = value;
            }
        });
    }
} catch (e) {}

// Supabase Server Client Setup
let supabaseServer = null;
try {
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xmnjhfkzvbssuajgxnvf.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_pAc8lic6v3PPnmWhLJkJVg_FlBptmnQ';
    supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[ARNE Server] Supabase integration initialized successfully.');
} catch (e) {
    console.warn('[ARNE Server Notice] Supabase module loading notice:', e.message);
}

const PORT = process.env.PORT || 8765;

// In-Memory Active Sessions & Rate Limiter Maps
const activeSessions = new Map(); // token -> { userId, email, role, expiresAt }
const failedLogins = new Map();   // ip -> { count, lockUntil }

// Database Helpers
function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) return {};
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (e) {
        console.error('[DB Read Error]:', e);
        return {};
    }
}

function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('[DB Write Error]:', e);
        return false;
    }
}

// Password Hashing Utility
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Authenticate Admin Session Token
function verifyAdmin(req) {
    const authHeader = req.headers['authorization'] || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    } else {
        const cookies = req.headers['cookie'] || '';
        const match = cookies.match(/arne_admin_token=([^;]+)/);
        if (match) token = match[1];
    }

    if (!token || !activeSessions.has(token)) return false;

    const session = activeSessions.get(token);
    if (Date.now() > session.expiresAt || session.role !== 'ADMIN') {
        activeSessions.delete(token);
        return false;
    }

    return session;
}

// Send JSON Helper
function sendJSON(res, statusCode, body) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end(JSON.stringify(body));
}

// Parse Body Helper
function parseJSON(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch (err) {
                reject(err);
            }
        });
    });
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.gltf': 'model/gltf+json',
    '.glb': 'model/gltf-binary',
    '.bin': 'application/octet-stream',
    '.hdr': 'image/vnd.radiance',
    '.exr': 'image/x-exr',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4'
};

const server = http.createServer(async (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const urlParts = req.url.split('?');
    const pathName = urlParts[0];

    // CORS Preflight Handling
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    // ----------------------------------------------------------------------
    // 1. PUBLIC API ROUTES
    // ----------------------------------------------------------------------

    // Dynamic Public Config API (Razorpay Key ID & Environment Mode)
    if (req.method === 'GET' && (pathName === '/api/config' || pathName === '/api/public/config')) {
        const keyId = process.env.RAZORPAY_KEY_ID || '';
        const isTestMode = keyId ? keyId.startsWith('rzp_test') : false;
        return sendJSON(res, 200, {
            success: true,
            razorpayKeyId: keyId,
            isTestMode: isTestMode,
            modeMessage: isTestMode ? 'Running in Test Mode' : (keyId ? 'Running in Live Mode' : 'Live Mode')
        });
    }

    // Public Service List API
    if (req.method === 'GET' && pathName === '/api/public/services') {
        const db = readDB();
        const activeServices = (db.services || []).filter(s => s.active !== false);
        return sendJSON(res, 200, { success: true, services: activeServices });
    }

    // Customer Booking Submit API
    if (req.method === 'POST' && (pathName === '/api/booking' || pathName === '/api/booking/' || pathName === '/api/book-slot' || pathName === '/api/book-slot/')) {
        try {
            const payload = await parseJSON(req);
            const db = readDB();
            db.bookings = db.bookings || [];
            db.customers = db.customers || [];
            db.slots = db.slots || [];
            db.notifications = db.notifications || [];

            // 1. Double Booking Check on Selected Slot
            const slotMatch = db.slots.find(s => s.date === payload.prefDate && s.time === payload.prefSlot);
            if (slotMatch && slotMatch.status === 'BLOCKED') {
                return sendJSON(res, 400, { success: false, message: 'Selected date and time slot is unavailable. Please select another slot.' });
            }

            // 2. Lock Slot
            if (slotMatch) {
                slotMatch.status = 'BOOKED';
            } else if (payload.prefDate && payload.prefSlot) {
                db.slots.push({
                    id: 's-' + Date.now(),
                    date: payload.prefDate,
                    time: payload.prefSlot,
                    status: 'BOOKED',
                    maxBookings: 1
                });
            }

            // 3. Dynamic Payment Calculation (Default 50% Prepaid / 50% Postpaid)
            const serviceObj = (db.services || []).find(s => s.name === payload.serviceName);
            const basePrice = serviceObj ? serviceObj.price : (Number((payload.estBudget || '').replace(/\D/g, '')) || 999);
            const prepaidPct = (db.settings && db.settings.paymentConfig) ? db.settings.paymentConfig.prepaidPercentage : 50;
            const postpaidPct = 100 - prepaidPct;

            const prepaidAmount = Math.round(basePrice * (prepaidPct / 100) * 100) / 100;
            const postpaidAmount = Math.round(basePrice * (postpaidPct / 100) * 100) / 100;

            const bookingId = payload.bookingId || `ARNE-2026-${Math.floor(100000 + Math.random() * 900000)}`;

            const newBooking = {
                id: bookingId,
                customerName: payload.fullName,
                customerPhone: payload.mobile,
                customerWhatsapp: payload.whatsapp || 'N/A',
                customerEmail: payload.email,
                company: payload.company || 'N/A',
                location: payload.location || 'N/A',
                serviceName: payload.serviceName,
                projectDesc: payload.projectDesc || 'N/A',
                date: payload.prefDate,
                timeSlot: payload.prefSlot,
                totalPrice: basePrice,
                prepaid30: prepaidAmount,
                postpaid70: postpaidAmount,
                amountPaid: prepaidAmount,
                amountRemaining: postpaidAmount,
                status: 'Confirmed',
                paymentStatus: 'Prepaid Paid',
                createdAt: new Date().toISOString()
            };

            db.bookings.unshift(newBooking);

            // 4. Update / Insert Customer Record
            let cust = db.customers.find(c => c.email === payload.email || c.mobile === payload.mobile);
            if (!cust) {
                cust = {
                    id: 'cust-' + Date.now(),
                    fullName: payload.fullName,
                    mobile: payload.mobile,
                    whatsapp: payload.whatsapp || 'N/A',
                    email: payload.email,
                    company: payload.company || 'N/A',
                    location: payload.location || 'N/A',
                    totalBookings: 1,
                    totalSpent: basePrice,
                    pendingAmount: postpaidAmount,
                    createdAt: new Date().toISOString()
                };
                db.customers.unshift(cust);
            } else {
                cust.totalBookings = (cust.totalBookings || 0) + 1;
                cust.totalSpent = (cust.totalSpent || 0) + basePrice;
                cust.pendingAmount = (cust.pendingAmount || 0) + postpaidAmount;
            }

            // 5. Create Admin Activity Notification
            db.notifications.unshift({
                id: 'notif-' + Date.now(),
                type: 'NEW_BOOKING',
                message: `New Booking ${bookingId} received from ${payload.fullName} for ${payload.serviceName}.`,
                read: false,
                createdAt: new Date().toISOString()
            });

            writeDB(db);

            // 5b. Background Supabase Cloud Synchronization
            if (supabaseServer) {
                try {
                    supabaseServer.from('bookings').insert([{
                        id: bookingId,
                        customer_name: payload.fullName,
                        customer_phone: payload.mobile,
                        customer_whatsapp: payload.whatsapp || 'N/A',
                        customer_email: payload.email,
                        company: payload.company || 'N/A',
                        location: payload.location || 'N/A',
                        service_name: payload.serviceName,
                        project_desc: payload.projectDesc || 'N/A',
                        booking_date: payload.prefDate || null,
                        time_slot: payload.prefSlot || 'N/A',
                        total_price: basePrice,
                        prepaid_amount: prepaidAmount,
                        postpaid_amount: postpaidAmount,
                        amount_paid: prepaidAmount,
                        amount_remaining: postpaidAmount,
                        payment_method: payload.paymentPref || 'UPI',
                        booking_status: 'Confirmed',
                        payment_status: 'Prepaid Paid',
                        ref_link: payload.refLink || 'None'
                    }]).then(res => {
                        console.log('[ARNE Supabase Server] Booking record synced to Supabase database.');
                    }).catch(err => {
                        console.warn('[ARNE Supabase Server Notice] Booking sync notice:', err.message);
                    });

                    supabaseServer.from('customers').insert([{
                        full_name: payload.fullName,
                        mobile: payload.mobile,
                        whatsapp: payload.whatsapp || 'N/A',
                        email: payload.email,
                        company: payload.company || 'N/A',
                        location: payload.location || 'N/A',
                        total_bookings: 1,
                        total_spent: basePrice,
                        pending_amount: postpaidAmount
                    }]).then(res => {
                        console.log('[ARNE Supabase Server] Customer record synced to Supabase database.');
                    }).catch(err => {
                        console.warn('[ARNE Supabase Server Notice] Customer sync notice:', err.message);
                    });
                } catch (supErr) {
                    console.warn('[ARNE Supabase Server Notice] Cloud sync exception:', supErr.message);
                }
            }

            // 6. Attempt Email Dispatch
            const emailResult = await handleBookingRequest(payload, clientIp);

            return sendJSON(res, 200, {
                success: true,
                bookingId: bookingId,
                prepaidAmount: prepaidAmount,
                postpaidAmount: postpaidAmount,
                message: 'Booking successfully confirmed!',
                emailStatus: emailResult.emailSent ? 'Sent' : 'Recorded'
            });

        } catch (err) {
            console.error('[Booking Submit Error]:', err);
            return sendJSON(res, 500, { success: false, message: 'Server error processing booking.' });
        }
    }

    // Contact Form API Endpoint
    if (req.method === 'POST' && pathName === '/api/contact') {
        try {
            const body = await parseJSON(req);
            req.body = body;
            return await handleContactForm(req, res);
        } catch (err) {
            return sendJSON(res, 400, { success: false, message: 'Invalid contact form payload.' });
        }
    }

    // OTP Verification API Endpoints
    if (req.method === 'POST' && (pathName === '/api/send-otp' || pathName === '/api/verify-otp')) {
        try {
            const body = await parseJSON(req);
            req.body = body;
            return await handleOtpRequest(req, res);
        } catch (err) {
            return sendJSON(res, 400, { success: false, message: 'Invalid OTP request payload.' });
        }
    }

    // Create Razorpay Order API Endpoint
    if (req.method === 'POST' && (pathName === '/api/create-order' || pathName === '/api/create-order/')) {
        try {
            const body = await parseJSON(req);
            req.body = body;
            return await handleCreateOrder(req, res);
        } catch (err) {
            return sendJSON(res, 400, { success: false, message: 'Invalid order creation payload.' });
        }
    }

    // Payment Verification API Endpoint
    if (req.method === 'POST' && pathName === '/api/payment') {
        try {
            const body = await parseJSON(req);
            req.body = body;
            return await handlePaymentRequest(req, res);
        } catch (err) {
            return sendJSON(res, 400, { success: false, message: 'Invalid payment payload.' });
        }
    }

    // ----------------------------------------------------------------------
    // 2. ADMIN AUTHENTICATION API ROUTES
    // ----------------------------------------------------------------------

    // Admin Login API
    if (req.method === 'POST' && pathName === '/api/admin/login') {
        try {
            const { email, password } = await parseJSON(req);
            const ip = clientIp;

            // Rate Limit Check
            const now = Date.now();
            const attempt = failedLogins.get(ip);
            if (attempt && attempt.count >= 5 && now < attempt.lockUntil) {
                const waitMins = Math.ceil((attempt.lockUntil - now) / 60000);
                return sendJSON(res, 429, { success: false, message: `Too many failed attempts. Try again in ${waitMins} minutes.` });
            }

            const db = readDB();
            const adminUser = (db.users || []).find(u => u.email === email && u.role === 'ADMIN');

            if (!adminUser) {
                failedLogins.set(ip, { count: (attempt?.count || 0) + 1, lockUntil: now + 15 * 60 * 1000 });
                return sendJSON(res, 401, { success: false, message: 'Invalid admin email or password.' });
            }

            const computedHash = hashPassword(password, adminUser.salt);
            if (computedHash !== adminUser.passwordHash) {
                failedLogins.set(ip, { count: (attempt?.count || 0) + 1, lockUntil: now + 15 * 60 * 1000 });
                return sendJSON(res, 401, { success: false, message: 'Invalid admin email or password.' });
            }

            // Clear Rate Limit Counter
            failedLogins.delete(ip);

            // Generate Session Token (Valid 24 Hours)
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = now + 24 * 60 * 60 * 1000;

            activeSessions.set(token, {
                userId: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: 'ADMIN',
                expiresAt: expiresAt
            });

            return sendJSON(res, 200, {
                success: true,
                token: token,
                user: {
                    name: adminUser.name,
                    email: adminUser.email,
                    role: 'ADMIN'
                }
            });
        } catch (err) {
            return sendJSON(res, 400, { success: false, message: 'Malformed login payload.' });
        }
    }

    // Admin Logout API
    if (req.method === 'POST' && pathName === '/api/admin/logout') {
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.replace('Bearer ', '').trim();
        if (token) activeSessions.delete(token);
        return sendJSON(res, 200, { success: true, message: 'Logged out successfully.' });
    }

    // ----------------------------------------------------------------------
    // 3. PROTECTED ADMIN API ENDPOINTS (/api/admin/*)
    // ----------------------------------------------------------------------
    if (pathName.startsWith('/api/admin/')) {
        const session = verifyAdmin(req);
        if (!session) {
            return sendJSON(res, 401, { success: false, message: 'Unauthorized. Admin session invalid or expired.' });
        }

        const db = readDB();

        // GET /api/admin/dashboard
        if (req.method === 'GET' && pathName === '/api/admin/dashboard') {
            const bookings = db.bookings || [];
            const totalBookings = bookings.length;
            const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            const pendingPostpaid = bookings.reduce((sum, b) => sum + (b.amountRemaining || 0), 0);
            const activeProjects = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length;

            return sendJSON(res, 200, {
                success: true,
                stats: {
                    totalBookings,
                    totalRevenue,
                    pendingPostpaid,
                    activeProjects
                },
                recentBookings: bookings.slice(0, 10),
                unreadNotifications: (db.notifications || []).filter(n => !n.read).length
            });
        }

        // GET /api/admin/bookings
        if (req.method === 'GET' && pathName === '/api/admin/bookings') {
            return sendJSON(res, 200, { success: true, bookings: db.bookings || [] });
        }

        // PUT /api/admin/bookings/status
        if (req.method === 'PUT' && pathName === '/api/admin/bookings/status') {
            const { id, status, paymentStatus, markPostpaidPaid } = await parseJSON(req);
            const booking = (db.bookings || []).find(b => b.id === id);
            if (!booking) return sendJSON(res, 404, { success: false, message: 'Booking not found.' });

            if (status) booking.status = status;
            if (paymentStatus) booking.paymentStatus = paymentStatus;
            if (markPostpaidPaid) {
                booking.amountPaid = booking.totalPrice;
                booking.amountRemaining = 0;
                booking.paymentStatus = 'Paid in Full';
            }

            writeDB(db);
            return sendJSON(res, 200, { success: true, booking });
        }

        // GET /api/admin/customers
        if (req.method === 'GET' && pathName === '/api/admin/customers') {
            return sendJSON(res, 200, { success: true, customers: db.customers || [] });
        }

        // GET /api/admin/services
        if (req.method === 'GET' && pathName === '/api/admin/services') {
            return sendJSON(res, 200, { success: true, services: db.services || [] });
        }

        // PUT /api/admin/services/price
        if (req.method === 'PUT' && pathName === '/api/admin/services/price') {
            const { id, price, active } = await parseJSON(req);
            const service = (db.services || []).find(s => s.id === id);
            if (!service) return sendJSON(res, 404, { success: false, message: 'Service not found.' });

            if (price !== undefined) service.price = Number(price);
            if (active !== undefined) service.active = Boolean(active);

            writeDB(db);
            return sendJSON(res, 200, { success: true, service });
        }

        // GET /api/admin/slots
        if (req.method === 'GET' && pathName === '/api/admin/slots') {
            return sendJSON(res, 200, { success: true, slots: db.slots || [] });
        }

        // POST /api/admin/slots/block
        if (req.method === 'POST' && pathName === '/api/admin/slots/block') {
            const { date, time } = await parseJSON(req);
            db.slots = db.slots || [];
            let slot = db.slots.find(s => s.date === date && s.time === time);
            if (!slot) {
                slot = { id: 's-' + Date.now(), date, time, status: 'BLOCKED', maxBookings: 1 };
                db.slots.push(slot);
            } else {
                slot.status = 'BLOCKED';
            }
            writeDB(db);
            return sendJSON(res, 200, { success: true, slots: db.slots });
        }

        // GET /api/admin/settings
        if (req.method === 'GET' && pathName === '/api/admin/settings') {
            return sendJSON(res, 200, { success: true, settings: db.settings || {} });
        }

        // PUT /api/admin/settings
        if (req.method === 'PUT' && pathName === '/api/admin/settings') {
            const { settings } = await parseJSON(req);
            if (settings) db.settings = settings;
            writeDB(db);
            return sendJSON(res, 200, { success: true, settings: db.settings });
        }

        return sendJSON(res, 404, { success: false, message: 'Admin API endpoint not found.' });
    }

    // ----------------------------------------------------------------------
    // 4. STATIC ASSET & PROTECTED ROUTE SERVING
    // ----------------------------------------------------------------------

    let urlPath = pathName;

    // Explicit Redirect: Legacy /admin or /admin.html requests redirect immediately to public homepage /
    if (urlPath === '/admin' || urlPath === '/admin/' || urlPath === '/admin.html') {
        res.writeHead(302, { 'Location': '/' });
        res.end();
        return;
    }

    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    if (urlPath === '/privacy-policy' || urlPath === '/privacy-policy/') urlPath = '/privacy-policy.html';
    if (urlPath === '/terms' || urlPath === '/terms/') urlPath = '/terms.html';

    const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
    
    // Multi-candidate static asset resolution (root, /public/, stripped /public/)
    let targetPath = null;
    const candidates = [
        path.join(ROOT, safePath),
        path.join(ROOT, 'public', safePath),
        path.join(ROOT, safePath.replace(/^[\/\\]public[\/\\]?/, ''))
    ];

    for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
            targetPath = cand;
            break;
        }
    }

    // Case-insensitive fallback lookup for Linux/Cloud deployments
    if (!targetPath) {
        for (const cand of candidates) {
            const dir = path.dirname(cand);
            const base = path.basename(cand).toLowerCase();
            if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
                try {
                    const files = fs.readdirSync(dir);
                    const matched = files.find(f => f.toLowerCase() === base);
                    if (matched) {
                        targetPath = path.join(dir, matched);
                        break;
                    }
                } catch (e) {}
            }
        }
    }

    if (targetPath && fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        const ext = path.extname(targetPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(targetPath).pipe(res);
    } else {
        // Fallback for SPA/Single Page Routing: Serve index.html instead of 404 error
        const indexPath = path.join(ROOT, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(indexPath).pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
        }
    }
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`[ARNE Works Enterprise Server] Public Website Active at http://localhost:${PORT}/`);
    });
}

module.exports = server;
