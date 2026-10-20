import fs from 'node:fs';
import path from 'node:path';
import { servePage } from '../../lib/pages.js';

export const dynamic = 'force-dynamic';

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.glb': 'model/gltf-binary',
  '.json': 'application/json; charset=utf-8',
};

export async function GET(request) {
  const url = new URL(request.url);
  const relativePath = url.pathname.replace(/^\/+/, '');
  const filePath = path.join(process.cwd(), 'public', relativePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const body = fs.readFileSync(filePath);
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  }

  return servePage(request, '404.html', 404);
}
