/**
 * ARNE Works — Standalone Supabase Storage Frame Sequence Uploader
 * Uses Node.js native 'https' & 'fs' modules (Zero dependencies required).
 * Uploads 240 3D visual frames from local folder 'frame1/' directly to Supabase Storage bucket 'hero-frames'.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// 1. Load .env file
const ROOT = path.resolve(__dirname, '..');
const envPath = path.join(ROOT, '.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const firstEq = trimmed.indexOf('=');
            if (firstEq !== -1) {
                const key = trimmed.substring(0, firstEq).trim();
                const value = trimmed.substring(firstEq + 1).trim();
                if (key && !process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env file.');
    process.exit(1);
}

const BUCKET_NAME = 'hero-frames';
const FRAMES_DIR = path.join(ROOT, 'frame1');

/**
 * Helper function for making HTTPS requests using native Node.js
 */
function makeRequest(targetUrl, options, bodyData) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(targetUrl);
        const reqOpts = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(reqOpts, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null });
                    } catch (e) {
                        resolve({ statusCode: res.statusCode, body: data });
                    }
                } else {
                    resolve({ statusCode: res.statusCode, error: data, body: null });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (bodyData) {
            req.write(bodyData);
        }
        req.end();
    });
}

/**
 * Ensure public bucket exists
 */
async function ensureBucket() {
    console.log(`[Supabase Storage] Ensuring public bucket "${BUCKET_NAME}" exists...`);
    const createBucketUrl = `${SUPABASE_URL}/storage/v1/bucket`;
    const headers = {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: true,
        file_size_limit: 10485760,
        allowed_mime_types: ['image/png', 'image/jpeg', 'image/webp']
    });

    try {
        const res = await makeRequest(createBucketUrl, { method: 'POST', headers }, body);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ [Supabase Storage] Public bucket "${BUCKET_NAME}" ready.`);
        } else {
            console.log(`ℹ️ [Supabase Storage] Bucket notice (${res.statusCode}): ${res.error || 'Bucket may already exist.'}`);
        }
    } catch (e) {
        console.warn(`[Supabase Storage] Bucket check skipped: ${e.message}`);
    }
}

/**
 * Upload single frame file to Supabase Storage
 */
async function uploadFrame(filename) {
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filename}`;
    const filePath = path.join(FRAMES_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);

    const headers = {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'image/png',
        'cache-control': '31536000',
        'x-upsert': 'true'
    };

    const res = await makeRequest(uploadUrl, { method: 'POST', headers }, fileBuffer);

    if (res.statusCode >= 200 && res.statusCode < 300) {
        return true;
    } else {
        throw new Error(`HTTP ${res.statusCode}: ${res.error || 'Upload failed'}`);
    }
}

async function main() {
    console.log(`==================================================`);
    console.log(`[Supabase Storage Frame Uploader]`);
    console.log(`Target Supabase URL: ${SUPABASE_URL}`);
    console.log(`Target Bucket:       ${BUCKET_NAME}`);
    console.log(`==================================================\n`);

    if (!fs.existsSync(FRAMES_DIR)) {
        console.error(`❌ Error: Frames directory "${FRAMES_DIR}" not found.`);
        process.exit(1);
    }

    const files = fs.readdirSync(FRAMES_DIR)
        .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`Found ${files.length} frame files to upload.\n`);

    await ensureBucket();

    const BATCH_SIZE = 5;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map(async (filename) => {
            try {
                await uploadFrame(filename);
                return { filename, success: true };
            } catch (err) {
                return { filename, success: false, error: err.message };
            }
        }));

        results.forEach(res => {
            if (res.success) {
                successCount++;
                console.log(`[${successCount + failCount}/${files.length}] ✅ Uploaded ${res.filename}`);
            } else {
                failCount++;
                console.error(`[${successCount + failCount}/${files.length}] ❌ Failed ${res.filename}: ${res.error}`);
            }
        });
    }

    console.log('\n==================================================');
    console.log(`✅ Upload summary completed!`);
    console.log(`Successful uploads: ${successCount} / ${files.length}`);
    console.log(`Failed uploads:     ${failCount}`);

    const sampleUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${files[0]}`;
    console.log(`\nPublic CDN Frame Base URL:`);
    console.log(`  ${sampleUrl}`);
    console.log('==================================================\n');
}

main().catch(err => {
    console.error('Fatal error during frame upload execution:', err);
    process.exit(1);
});
