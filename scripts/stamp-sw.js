/**
 * stamp-sw.js — Injects a unique build ID into sw.js before each build.
 * 
 * On Vercel: uses VERCEL_GIT_COMMIT_SHA (first 8 chars)
 * Locally:   uses a timestamp-based ID
 * 
 * This ensures every deployment produces a byte-different sw.js,
 * which triggers the browser's SW update flow automatically.
 */
const fs = require('fs');
const path = require('path');

const SW_PATH = path.join(__dirname, '..', 'public', 'sw.js');

const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 8)
  : Date.now().toString(36);

try {
  let sw = fs.readFileSync(SW_PATH, 'utf-8');

  // If already stamped from a previous local build, restore the placeholder first
  sw = sw.replace(
    /const CACHE_VERSION = '[a-z0-9]{5,12}';/,
    "const CACHE_VERSION = '__BUILD_ID__';"
  );

  // Now stamp with current build ID
  sw = sw.replace(/__BUILD_ID__/g, BUILD_ID);

  fs.writeFileSync(SW_PATH, sw, 'utf-8');
  console.log(`[PWA] Service worker stamped: ${BUILD_ID}`);
} catch (e) {
  console.warn('[PWA] Could not stamp service worker:', e.message);
  // Non-fatal — build continues with placeholder
}
