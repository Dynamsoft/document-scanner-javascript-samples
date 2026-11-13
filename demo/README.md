# Mobile Document Scanner — Online Demo

A self-contained plain TypeScript + HTML + CSS sample of the [Dynamsoft Mobile Document Scanner SDK](https://www.dynamsoft.com/mobile-document-scanner/docs/web/index.html), deployed at <https://demo.dynamsoft.com/document-scanner/>. The demo has three views — a landing screen, a multi-page scan, and a PDF result view. It is the public demo for the SDK and a ready-to-fork template for integrators who want a similar end-to-end flow.

## Overview

1. **Landing**: a "Continue" button on mobile, or a QR code + "Continue on Desktop" on wide viewports so phone users get nudged to the better camera path.
2. **Scan**: one `scan()` call runs the document scanner's own screens. The capture screen takes each page with border detection and perspective correction. On the rectify screen, the user adjusts the boundary of the page. On the edit screen, the user reviews, rotates, filters, rectifies again, reorders, or deletes pages, adds more, and finishes. Cancel returns to the landing screen.
3. **Result**: the scan returns the pages and a single PDF. The pages show in a scrollable read-only inset, with Restart scan (discard and start over) and Download actions.

## File layout

```
demo/
├── index.html               # markup for all three views
├── css/
│   ├── index.css            # shared stylesheet — palette in :root tokens, view states
│   ├── landing.css          # landing page, one for mobile and desktop
│   └── result.css           # result view — header, PDF inset, action footer
├── deployment/              # parts of the live demo only; see "Deploy build"
│   ├── vite-plugin.ts       # adds the parts below in the deploy build
│   ├── chat.ts              # live-chat bridge
│   ├── chat.css             # live-chat button
│   └── web.config           # IIS redirect rule
├── tsconfig.json            # IDE/LSP project config (Vite handles build)
├── vite.config.ts           # demo-build config: bundles src/ + copies the engines into public/engine/
├── assets/                  # static assets (logo, QR code)
└── src/                     # TypeScript source
    ├── dom.ts               # $<T>(id) and error-notice helpers
    ├── view.ts              # body[data-view] state, info menu
    ├── scanner.ts           # DocumentScanner instance + scan flow
    ├── results.ts           # page-image inset, PDF download
    └── index.ts             # entry — wires DOM events to the exports above
```

The build output lands in `dist/` (gitignored).

## Running locally

From the `demo` directory:

```shell
npm install
npm run dev
```

Open the link in your browser as shown by Vite in the shell output (default `https://localhost:5173/`). Accept the self-signed cert.

The demo uses a public trial license, valid for 24 hours. To use your own key, set it in a `.env.local` file in this directory:

```shell
VITE_DYNAMSOFT_LICENSE=your-license-key
```

This serves your source files directly, which has the benefit of live updates via Vite, so you can see your changes live without reloading (HMR). See below for running bundled files locally that you would deploy in production.

## Preview build

Once satisfied with the application, you can serve the production build files (from `/dist`) by running

```shell
npm run build
npm run preview
```

and opening the link to the Vite server (default `https://localhost:4173/`). Because `npm run build` is responsible for the build, `npm run preview` does not offer live reloads like `npm run dev`.

## Distributables

`vite build` reads `index.html`, bundles `src/*.ts` into `assets/index-<hash>.js` with all SDK imports resolved, and emits a self-contained `dist/` whose top level mirrors `public/`, which you can then deploy:

```
dist/
├── index.html
├── assets/                               # bundled demo + SDK ESM + styles
│   ├── index-<hash>.js
│   └── index-<hash>.css
└── engine/
    ├── dynamsoft-capture-vision-bundle/  # Capture Vision engine (WASM, workers)
    └── dynamsoft-document-viewer/        # Document Viewer engine (WASM, workers, styles)
```

`vite.config.ts` sets `base: "./"` so all paths in `dist/index.html` are relative — the same output works under any deploy base URL.

## How the SDK is loaded

The TypeScript imports the SDK as an ES module:

```ts
import { DocumentScanner } from "@dynamsoft/document-scanner";
```

The document scanner imports its two engines, Dynamsoft Capture Vision and Dynamsoft Document Viewer, which the demo installs beside it. Both engines are self-hosted: `vite.config.ts` copies their runtime files from `node_modules` into `public/engine/`, and the demo points the `resources` setting at those copies — nothing is fetched from a CDN at runtime.

## Deploy build

The demo at <https://demo.dynamsoft.com/document-scanner/> also carries Google Tag Manager, a Comm100 live chat, and an IIS `web.config`. Only the deploy build adds them, through `deployment/vite-plugin.ts`, so `npm run dev` and `npm run build` never include them. To make the deploy build, run:

```shell
npm run build -- --mode deploy
```

The deploy build reads these variables from the environment or from the `.env` files of the `deploy` mode, and stops if one is empty:

- `GTM_ID`: the Google Tag Manager container
- `COMM100_SITE_ID` and `COMM100_CODE_PLAN`: the Comm100 chat
- `VITE_DYNAMSOFT_LICENSE`: the license for the demo's domain

If you fork the demo, you can delete the `deployment/` directory and the two lines in `vite.config.ts` that name it.

## SDK API reference

- [User guide](https://www.dynamsoft.com/mobile-document-scanner/docs/web/guides/index.html)
- [`DocumentScanner` API](https://www.dynamsoft.com/mobile-document-scanner/docs/web/api-reference/index.html)
