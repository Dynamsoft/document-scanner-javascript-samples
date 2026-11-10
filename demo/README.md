# Mobile Document Scanner — Online Demo

A self-contained plain TypeScript + HTML + CSS sample of the [Dynamsoft Mobile Document Scanner SDK](https://www.dynamsoft.com/mobile-document-scanner/docs/web/index.html), deployed at <https://demo.dynamsoft.com/document-scanner/>. The demo has three phases — a landing screen, a multi-page scan loop, and a PDF result view. This is intended as the public demo for the SDK, a ready-to-fork template for integrators who want a similar end-to-end flow, and an end-to-end development guide for combining Mobile Document Scanner (MDS) with Document Viewer (DDV).

## Overview

1. **Landing**: a "Continue" button on mobile, or a QR code + "Continue on Desktop" on wide viewports so phone users get nudged to the better camera path.
2. **Scan loop**: the Document Scanner captures pages continuously (auto border detection + perspective correction); each corrected page lands in a shared DDV document. Exiting the camera drops into a DDV edit viewer where pages can be reviewed, rotated, cropped, reordered, or deleted — its toolbar relaunches the camera or finishes the session.
3. **Result**: the pages are exported to a single PDF, shown in a scrollable read-only inset, with Re-scan (discard and start over), Download, and Return-home actions.

## File layout

```
demo/
├── index.html               # markup for all three phases
├── css/
│   ├── index.css            # shared stylesheet — palette in :root tokens, scanner stage
│   ├── landing.css          # landing page, one for mobile and desktop
│   └── result.css           # result view — header, PDF inset, action footer
├── deployment/              # parts of the live demo only; see "Deploy build"
│   ├── vite-plugin.ts       # adds the parts below in the deploy build
│   ├── chat.ts              # live-chat bridge
│   ├── chat.css             # live-chat button
│   └── web.config           # IIS MIME map for .data files
├── tsconfig.json            # IDE/LSP project config (Vite handles build)
├── vite.config.ts           # demo-build config: bundles src/ + mirrors SDK resources into public/
├── assets/                  # static assets (logo, QR code)
└── src/                     # TypeScript source
    ├── dom.ts               # $<T>(id) helper, isMobile
    ├── view.ts              # body[data-view] state, scanner-overlay sub-state, info menu
    ├── license.ts           # VITE_DYNAMSOFT_LICENSE, or the public trial key
    ├── ddv.ts               # DDV engine init, shared document, edit-viewer hub
    ├── scanner.ts           # DocumentScanner instance + flow orchestration
    ├── results.ts           # page-image inset, PDF export, download
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
├── document-scanner.ui.xml               # camera UI template (scanner view)
├── dynamsoft-capture-vision-bundle/      # DCV engine (WASM, workers)
├── dynamsoft-capture-vision-data/        # DCV runtime data (preset templates, models)
└── dynamsoft-document-viewer/dist/engine # DDV engine (WASM, workers)
```

`vite.config.ts` sets `base: "./"` so all paths in `dist/index.html` are relative — the same output works under any deploy base URL.

## How the SDKs are loaded

The TypeScript imports both SDKs as ES modules:

```ts
import { DocumentScanner } from "dynamsoft-document-scanner";
import { DDV } from "dynamsoft-document-viewer";
```

Both engines are self-hosted: `vite.config.ts` mirrors `dynamsoft-capture-vision-bundle`, `dynamsoft-capture-vision-data` (the engine's preset templates and models), and DDV's `dist/engine` from `node_modules` into `public/`, and the demo points `engineResourcePaths` (scanner) and `DDV.Core.engineResourcePath` (viewer) at those mirrors — nothing is fetched from a CDN at runtime.

`dynamsoft-document-viewer` is pinned to an exact version: Dynamsoft packages ship breaking changes in minor releases, so upgrades should be deliberate and verified against the scan/review/export flow.

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
- [Dynamsoft Document Viewer docs](https://www.dynamsoft.com/document-viewer/docs/introduction/index.html)
