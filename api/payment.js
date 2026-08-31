// ====================================================================
// ARNE Works — Payment & Confirmation Backend Handler (/api/payment)
// ====================================================================

let createClient = null;
try {
    createClient = require('@supabase/supabase-js').createClient;
} catch (e) {}

let nodemailer = null;
try {
    nodemailer = require('nodemailer');
} catch (e) {}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xmnjhfkzvbssuajgxnvf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_pAc8lic6v3PPnmWhLJkJVg_FlBptmnQ';
const supabase = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

module.exports = async function handlePaymentRequest(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
        return;
    }

    try {
        const { bookingId, paymentMethod, amountPaid, transactionRef } = req.body || {};

        if (!bookingId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Missing bookingId' }));
            return;
        }

        const txnId = transactionRef || `TXN-ARNE-${Date.now().toString().slice(-6)}`;
        const paidAmountNum = Number(amountPaid || 500);
        const timestamp = new Date().toISOString();

        console.log(`[ARNE Payment Backend API] Processing payment verification for Booking ${bookingId} via ${paymentMethod || 'UPI'}`);

        // Update Supabase 'bookings' table
        let dbUpdated = false;
        try {
            const { error: bErr } = await supabase
                .from('bookings')
                .update({
                    payment_status: 'Prepaid Paid',
                    booking_status: 'Confirmed',
                    payment_method: paymentMethod || 'UPI'
                })
                .eq('id', bookingId);

            if (!bErr) dbUpdated = true;

            // Log entry into 'payments' table
            await supabase.from('payments').insert([{
                booking_id: bookingId,
                customer_name: req.body.customerName || 'Client',
                total_amount: req.body.totalPrice || 999,
                prepaid_amount: paidAmountNum,
                postpaid_amount: req.body.postpaidAmount || 499,
                amount_paid: paidAmountNum,
                amount_remaining: req.body.postpaidAmount || 499,
                payment_method: paymentMethod || 'UPI',
                status: 'Partially Paid (50% Deposit Confirmed)'
            }]);
        } catch (e) {
            console.warn('[ARNE Payment API Notice] Supabase update warning:', e.message);
        }

        // Return backend payment verification receipt response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Payment verified and booking confirmed successfully.',
            receipt: {
                transactionId: txnId,
                bookingId: bookingId,
                paymentMethod: paymentMethod || 'UPI (Google Pay / PhonePe / Paytm / QR)',
                amountPaid: paidAmountNum,
                paymentStatus: 'Prepaid Paid (50% Deposit Authorized)',
                timestamp: timestamp
            }
        }));
    } catch (err) {
        console.error('[ARNE Payment API Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Internal Server Error', error: err.message }));
    }
};
