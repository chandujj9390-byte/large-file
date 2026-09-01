/**
 * ARNE Build Execution Script
 * Copies all static assets from 'public/' and root assets into build output directory 'dist/'
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

console.log('[ARNE Build] Initializing build execution...');

// 1. Ensure dist directory exists
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// 2. Copy items to build output folder
const itemsToCopy = [
    'public',
    'images',
    'frames',
    'js',
    'data',
    'api',
    'index.html',
    'admin.html',
    'payment.html',
    'privacy-policy.html',
    'terms.html',
    'confirmation.html',
    '404.html',
    'script.js',
    'style.css',
    'server.js',
    'vercel.json',
    'package.json'
];

itemsToCopy.forEach(item => {
    const srcPath = path.join(ROOT, item);
    const destPath = path.join(DIST, item);

    if (fs.existsSync(srcPath)) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        console.log(`[ARNE Build] Copied "${item}" -> "dist/${item}"`);
    } else {
        console.warn(`[ARNE Build Notice] Skipped "${item}" (not found)`);
    }
});

console.log('✅ [ARNE Build Success] All static assets in public/ correctly copied to build output folder (dist/).');
