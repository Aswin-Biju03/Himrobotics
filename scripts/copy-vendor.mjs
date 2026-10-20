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

  // Ensure 0y8e37bak7wz2.js bypasses /_next/ InvariantError
  const chunk0y = path.join(destPublic, 'chunks', '0y8e37bak7wz2.js');
  if (fs.existsSync(chunk0y)) {
    let code = fs.readFileSync(chunk0y, 'utf8');
    code = code.replace('let{pathname:t}=new URL(e.src),n=t.indexOf("/_next/");if(-1===n)throw Object.defineProperty(new r.InvariantError("Expected document.currentScript src to contain \'/_next/\'. Received ".concat(e.src," instead.")),"__NEXT_ERROR_CODE",{value:"E784",enumerable:!1,configurable:!0});return t.slice(0,n)', 'let{pathname:t}=new URL(e.src),n=t.indexOf("/_next/");if(-1===n)return"";return t.slice(0,n)');
    fs.writeFileSync(chunk0y, code, 'utf8');
  }

  // Ensure 00vqtpq6zjam1.js uses /assets/
  const chunk00 = path.join(destPublic, 'chunks', '00vqtpq6zjam1.js');
  if (fs.existsSync(chunk00)) {
    let code = fs.readFileSync(chunk00, 'utf8');
    code = code.replace('".concat(r.assetPrefix,"/_next/").concat((0,l.encodeURIPath)(e)).concat(s)', '".concat(r.assetPrefix,"/assets/").concat((0,l.encodeURIPath)(e)).concat(s)');
    fs.writeFileSync(chunk00, code, 'utf8');
  }

  // Ensure 2tvcy0m4g8gry.js uses /local-image
  const chunk2t = path.join(destPublic, 'chunks', '2tvcy0m4g8gry.js');
  if (fs.existsSync(chunk2t)) {
    let code = fs.readFileSync(chunk2t, 'utf8');
    code = code.replace('qualities:[90],path:"/_next/image",loader:"default"', 'qualities:[90],path:"/local-image",loader:"default"');
    fs.writeFileSync(chunk2t, code, 'utf8');
  }

  console.log(`[copy-vendor] Successfully synced assets to public/assets/static and .next/static.`);
} else {
  console.warn(`[copy-vendor] Warning: vendor directory not found at ${srcDir}`);
}
