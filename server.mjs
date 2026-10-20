// Thin custom Next.js server for the clone.
//
// Next.js owns page routing (the app/ route handlers serve the captured HTML). This
// server handles the paths Next reserves for itself, mirroring the proven static-clone
// serve.js behaviour:
//   - any URL with ?_rsc=...        -> 404, so the original client router falls back to
//                                      full-page navigation (keeps the Privacy / Terms links working)
//   - /_next/image?url=...&w=...    -> the pre-downloaded local width variant (fully offline)
//   - /_next/static/**              -> the ORIGINAL site's compiled chunks/fonts from vendor/,
//                                      served at their original paths (byte-identical runtime)
//
// Usage: node server.mjs [port] [--dev]
import { createServer } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import next from 'next';
import { IMAGE_MAP } from './lib/images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VENDOR = path.join(__dirname, 'vendor');
const IMAGES = path.join(__dirname, 'public', 'images');

const dev = process.argv.includes('--dev');
const port = Number(process.argv.find((a) => /^\d+$/.test(a)) || process.env.PORT || 3000);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.glb': 'model/gltf-binary',
};

function sendFile(req, res, filePath) {
  res.writeHead(200, {
    'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

const app = next({ dev });
await app.prepare();
const handle = app.getRequestHandler();

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 1) Next.js router data fetches -> 404 forces the full-navigation fallback.
  if (url.searchParams.has('_rsc')) return notFound(res);

  // 2) Image optimizer endpoint -> local pre-generated width variants.
  if (url.pathname === '/_next/image') {
    const raw = url.searchParams.get('url') || '';
    let name = '';
    try { name = decodeURIComponent(raw); } catch { name = raw; }
    name = name.split('?')[0].split('/').pop();
    const base = IMAGE_MAP[name];
    if (base) {
      const w = url.searchParams.get('w');
      for (const candidate of [w, '1600', '1280', '768', '384'].filter(Boolean)) {
        const file = path.join(IMAGES, `${base}-${candidate}.png`);
        if (fs.existsSync(file)) return sendFile(req, res, file);
      }
    }
    return notFound(res);
  }

  // 3) The original site's compiled assets at their original paths.
  if (url.pathname.startsWith('/_next/static/')) {
    const file = path.join(VENDOR, url.pathname);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return sendFile(req, res, file);
    // otherwise fall through: Next's own build assets (dev mode etc.)
  }

  // Serve /assets/ directly from public/assets/
  if (url.pathname.startsWith('/assets/')) {
    const file = path.join(__dirname, 'public', url.pathname);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return sendFile(req, res, file);
  }

  // Fast-path /static/ from public/static/
  if (url.pathname.startsWith('/static/')) {
    const file = path.join(__dirname, 'public', url.pathname);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return sendFile(req, res, file);
  }

  // Alias for legacy /original-assets/ paths
  if (url.pathname.startsWith('/original-assets/')) {
    const file = path.join(VENDOR, url.pathname.replace('/original-assets/', '/_next/static/'));
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return sendFile(req, res, file);
  }

  // 4) Everything else: Next (pages live in app/).
  handle(req, res);
}).listen(port, () => {
  console.log(`HIM Robotics (Next.js, ${dev ? 'dev' : 'production'}) listening on http://localhost:${port}`);
});
