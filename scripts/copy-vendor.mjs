import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('vendor/_next/static');
const destDir = path.resolve('.next/static');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`[copy-vendor] Copied vendor/_next/static -> .next/static successfully.`);
} else {
  console.warn(`[copy-vendor] Warning: vendor directory not found at ${srcDir}`);
}
