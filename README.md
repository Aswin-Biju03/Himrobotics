# HIM Robotics — Next.js Application

Next.js (App Router) website for HIM Robotics — Intelligent Autonomous Solutions.
Reuses optimized high-performance client JS chunks, webfonts, images, and Three.js
models for interactive 3D robotics visualizations, while page serving and routing run
through Next.js.

## Run it

```
npm install        # first time only
npm run build
npm run start      # -> http://localhost:3000   (npm run start -- 3100 for another port)
```

Development mode: `npm run dev` (also `http://localhost:3000`).

## Architecture

```
app/route.js               -> /              (serves content/index.html)
app/privacy/route.js       -> /privacy       (serves content/privacy.html)
app/terms-of-use/route.js  -> /terms-of-use  (serves content/terms-of-use.html)
app/[...slug]/route.js     -> styled 404 page with status 404
server.mjs                 -> custom Next server handling the reserved /_next/* paths
lib/pages.js               -> route handler helper (page bytes + ?_rsc -> 404)
lib/images.js              -> datocms filename -> local image mapping

content/                   the captured pages, served byte-identical
vendor/_next/static/       the original site's compiled chunks + webfonts
public/                    images (4 widths), models (.glb), favicon.svg, noop.js
```

`server.mjs` mirrors the proven static-clone `serve.js` behaviour:

- `/_next/image?url=...&w=...` → serves the pre-downloaded local width variant (offline)
- `/_next/static/**` → serves the original compiled assets from `vendor/` at their original URLs
- any URL with `?_rsc=...` → 404, so the original client router gracefully falls back to
  full-page navigation (this is what keeps the Privacy / Terms / footer links working)
- everything else is delegated to Next.js (the route handlers above)

No HTML is rewritten: the original runtime, its RSC payload and asset URLs stay untouched,
so hydration and every interaction are byte-for-byte the production originals.

## Fidelity notes

- 3D scenes (robot-arm hero, factory floor, GLB models), scroll animations, the animated
  wordmark, photo carousel, contact dialog and the pong easter egg all run from the
  original bundles — verified end-to-end with the parent repo's `tools/verify.js`
  (screenshots, console, network; 0 failed / 0 external requests).
- Fully offline: third-party analytics/consent scripts stay stubbed (`public/noop.js`).
- Outbound links (Join us → Ashby, tel:, mailto:) still point to their real destinations.
- Reference screenshots of the original site live in `../tools/capture/`.

## Why a custom server?

Next.js reserves `/_next/*` for its own build assets, so the original site's `_next`
paths cannot be served from `public/`. The custom server (a documented Next.js pattern)
serves them before Next sees the request, which is what keeps the original runtime and
RSC payload 100% intact.

_HIM Robotics — All rights reserved._
