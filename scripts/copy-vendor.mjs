import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('vendor/_next/static');
const destPublic = path.resolve('public/assets/static');
const destNext = path.resolve('.next/static');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destPublic, { recursive: true });
  fs.cpSync(srcDir, destPublic, { recursive: true });

  fs.mkdirSync(destNext, { recursive: true });
  fs.cpSync(srcDir, destNext, { recursive: true });

  // Ensure turbopack runtime in public/assets uses '/assets/' asset prefix
  const turboPath = path.join(destPublic, 'chunks', 'turbopack-1j7ef1vta_fpn.js');
  if (fs.existsSync(turboPath)) {
    let code = fs.readFileSync(turboPath, 'utf8');
    code = code.replace(/let t="[^"]+"/, 'let t="/assets/"');
    fs.writeFileSync(turboPath, code, 'utf8');
  }

  console.log(`[copy-vendor] Successfully synced assets to public/assets/static and .next/static.`);
} else {
  console.warn(`[copy-vendor] Warning: vendor directory not found at ${srcDir}`);
}
