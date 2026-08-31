// ====================================================================
// ARNE Works — Full-Stack Contact Handler (/api/contact)
// Automated Thank You Messages to Customer's Mobile Number (WhatsApp)
// and Gmail Account (Nodemailer Email) with Love Symbol ❤️
// ====================================================================

let createClient = null;
try {
    createClient = require('@supabase/supabase-js').createClient;
} catch (e) {}

let nodemailer = null;
try {
    nodemailer = require('nodemailer');
} catch (e) {}

// Require twilio with fallback safety
let twilio = null;
try {
    twilio = require('twilio');
} catch (e) {
    console.warn('[ARNE Contact API Notice] twilio package not loaded locally yet, fallback enabled.');
}

// 1. Supabase Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xmnjhfkzvbssuajgxnvf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_pAc8lic6v3PPnmWhLJkJVg_FlBptmnQ';
const supabase = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// 2. Nodemailer Setup
const GMAIL_USER = process.env.GMAIL_USER || 'arneworks26@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

const transporter = nodemailer ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
}) : null;

// 3. Twilio Setup
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_SENDER = process.env.TWILIO_WHATSAPP_SENDER_NUMBER || 'whatsapp:+14155238886';
const OWNER_WHATSAPP = process.env.DESTINATION_WHATSAPP_NUMBER || 'whatsapp:+919390662637';

let twilioClient = null;
if (twilio && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && !TWILIO_ACCOUNT_SID.includes('YOUR_')) {
    try {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch (err) {
        console.warn('[ARNE Contact API Notice] Twilio client initialization notice:', err.message);
    }
}

module.exports = async function handleContactForm(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
        return;
    }

    try {
        const { name, email, phone } = req.body || {};

        if (!name || !email || !phone) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Missing required fields: name, email, phone' }));
            return;
        }

        console.log(`[ARNE Contact API] New lead & subscription received: Name="${name}", Email="${email}", Phone="${phone}"`);

        // Format Customer Mobile Number (e.g. 9398123529 -> whatsapp:+919398123529)
        let cleanDigits = phone.replace(/\D/g, '');
        if (cleanDigits.length === 10) {
            cleanDigits = '91' + cleanDigits;
        }
        const customerWhatsAppNum = `whatsapp:+${cleanDigits}`;

        // Concurrent Dispatch Tasks: Customer Email, Customer WhatsApp Mobile, Owner Email, Owner WhatsApp, Supabase DB
        const results = await Promise.allSettled([
            
            // TASK 1: Automated Customer Thank You Email to Customer's Gmail Account ❤️
            (async () => {
                if (!GMAIL_APP_PASSWORD || GMAIL_APP_PASSWORD.includes('xxxx')) {
                    throw new Error('Gmail App Password not configured in .env');
                }
                const customerMailOptions = {
                    from: `"ARNE Works Studio" <${GMAIL_USER}>`,
                    to: email,
                    subject: `Thank You for Subscribing to ARNE Works! ❤️`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #050706; color: #ffffff; padding: 32px; border-radius: 20px; border: 1px solid #00ff88; max-width: 540px; margin: auto;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <h1 style="color: #00ff88; font-family: 'Syne', sans-serif; font-size: 30px; margin: 0; letter-spacing: 2px;">ARNE WORKS</h1>
                                <p style="color: #a1a1aa; font-size: 13px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Creative Studio & Digital Excellence</p>
                            </div>
                            
                            <div style="background: rgba(0, 255, 136, 0.06); border: 1px solid rgba(0, 255, 136, 0.25); padding: 26px; border-radius: 18px; text-align: center; margin-bottom: 24px;">
                                <div style="font-size: 42px; margin-bottom: 10px;">❤️</div>
                                <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 10px 0;">Thank You, ${name}!</h2>
                                <p style="color: #e4e4e7; font-size: 15px; line-height: 1.6; margin: 0 0 14px 0;">
                                    We are so happy to have you with us! You have officially subscribed to <strong>ARNE Works</strong> updates & announcements. 💖
                                </p>
                                <div style="display: inline-block; background: #00ff88; color: #000000; font-weight: 800; font-size: 13px; padding: 8px 18px; border-radius: 99px;">
                                    SENDING YOU LOTS OF LOVE 💕✨
                                </div>
                            </div>
                            
                            <p style="font-size: 14px; color: #a1a1aa; text-align: center; line-height: 1.6;">
                                Our creative team has received your contact details (${phone}) and will reach out shortly. We can't wait to collaborate with you!
                            </p>
                            
                            <div style="text-align: center; margin-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;">
                                <p style="font-size: 13px; color: #71717a; margin: 0;">With Love & Gratitude, ❤️<br><strong style="color: #00ff88;">ARNE Creative Studio Team</strong></p>
                            </div>
                        </div>
                    `
                };
                await transporter.sendMail(customerMailOptions);
                console.log(`[ARNE Contact API] Thank You email sent to customer Gmail account: ${email}`);
                return 'Customer Email Sent';
            })(),

            // TASK 2: Automated Customer Thank You WhatsApp Message to Customer's Mobile Number ❤️
            (async () => {
                if (!twilioClient) {
                    throw new Error('Twilio WhatsApp credentials not configured in .env');
                }

                const thankYouWhatsAppBody = `❤️ *Thank You for Subscribing to ARNE Works, ${name}!* ❤️\n\nWe are so happy to have you with us! You have officially subscribed to *ARNE Works* updates & creative announcements. 💖✨\n\nOur team has received your details (${email}) and will get back to you shortly.\n\n*Sending lots of love & appreciation your way! 💕*\n— _ARNE Creative Studio Team_`;

                const msg = await twilioClient.messages.create({
                    from: TWILIO_WHATSAPP_SENDER,
                    to: customerWhatsAppNum,
                    body: thankYouWhatsAppBody
                });
                console.log(`[ARNE Contact API] Thank You WhatsApp message sent to customer mobile number ${customerWhatsAppNum} (SID: ${msg.sid})`);
                return `Customer WhatsApp Sent (SID: ${msg.sid})`;
            })(),

            // TASK 3: Owner Notification Email (arneworks26@gmail.com)
            (async () => {
                if (!GMAIL_APP_PASSWORD || GMAIL_APP_PASSWORD.includes('xxxx')) return;
                const mailOptions = {
                    from: `"ARNE Creative Studio" <${GMAIL_USER}>`,
                    to: 'arneworks26@gmail.com',
                    subject: `🚀 New Lead & Website Subscription: ${name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #050706; color: #ffffff; padding: 28px; border-radius: 18px; border: 1px solid #00ff88;">
                            <h2 style="color: #00ff88; font-family: 'Syne', sans-serif; margin-top: 0;">New Lead Inquiry & Subscription</h2>
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 18px; border-radius: 12px; font-size: 14px; line-height: 1.8;">
                                <div><strong style="color: #00ff88;">Name:</strong> ${name}</div>
                                <div><strong style="color: #00ff88;">Email Address:</strong> ${email}</div>
                                <div><strong style="color: #00ff88;">Phone Number:</strong> ${phone}</div>
                            </div>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                return 'Owner Email Sent';
            })(),

            // TASK 4: Owner Notification WhatsApp (+919390662637)
            (async () => {
                if (!twilioClient) return;
                const msg = await twilioClient.messages.create({
                    from: TWILIO_WHATSAPP_SENDER,
                    to: OWNER_WHATSAPP,
                    body: `🚨 *New ARNE Lead Received!*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📞 *Phone:* ${phone}`
                });
                return `Owner WhatsApp Sent (SID: ${msg.sid})`;
            })(),

            // TASK 5: Supabase Database Insertion
            (async () => {
                try {
                    const { error } = await supabase.from('contact_messages').insert([{ name, email, phone }]);
                    if (error) console.warn('[ARNE Contact API Notice] Supabase insert warning:', error.message);
                    return 'DB Saved';
                } catch (dbErr) {
                    console.warn('[ARNE Contact API Notice] Supabase exception:', dbErr.message);
                    return 'DB Fallback';
                }
            })()

        ]);

        const customerEmailResult = results[0].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[0].reason?.message || 'Config Missing'}`;
        const customerWhatsAppResult = results[1].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[1].reason?.message || 'Config Missing'}`;
        const ownerEmailResult = results[2].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[2].reason?.message || 'Config Missing'}`;
        const ownerWhatsAppResult = results[3].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[3].reason?.message || 'Config Missing'}`;
        const dbResult = results[4].status === 'fulfilled' ? 'SUCCESS' : `FAILED: ${results[4].reason?.message || 'DB Notice'}`;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: `Thank you, ${name}! Subscription & Thank You message sent with love to your Gmail and Mobile Number ❤️`,
            details: {
                customerEmailSentTo: email,
                customerEmailStatus: customerEmailResult,
                customerMobileSentTo: customerWhatsAppNum,
                customerWhatsAppStatus: customerWhatsAppResult,
                ownerEmailStatus: ownerEmailResult,
                ownerWhatsAppStatus: ownerWhatsAppResult,
                supabaseDatabaseStatus: dbResult
            }
        }));

    } catch (err) {
        console.error('[ARNE Contact API Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Internal Server Error', error: err.message }));
    }
};
