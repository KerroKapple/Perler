# Perler — AI bead-pattern community + commerce

> Turn any photo (or just a chat prompt) into a printable fuse-bead pattern, share it with the community, and order the matched bead kit. Single-file front-end MVP, zero build, zero backend.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-18%2F18-brightgreen.svg)](#tests)
[![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20JS%20%2B%20vitest-1c1c1c.svg)](#stack)

---

## What it does

- **Discover** — Pinterest-style 5-column masonry of community patterns. Search, tag-filter, like, save, share, remix.
- **Create** — Two ways to get a pattern:
  - **Chat with AI** — describe a subject, vibe, and use ("a cute orange cat keychain, pastel"). Built-in keyword router picks one of 10 procedurally-drawn templates and sets the grid size automatically. Optional API key plugs in real text-to-image (DALL·E 3 / Stable Diffusion / custom endpoint).
  - **Upload a photo** — drag in any JPG/PNG, run an 8-style AI stylizer (Cartoon, Ghibli, 8-bit, Watercolor…), then auto-quantize to a real bead palette.
- **Pattern engine** — Canvas pixelization + nearest-neighbor color quantization to Hama (24) or Perler (32) palettes, with optional Floyd–Steinberg dithering. Outputs a true bead-pattern grid with color legend and bead counts.
- **Print-PDF export** — multi-page printable PDF with grid rulers every 10 cells, color-coded legend (paginated at 36 entries / page), and percentages. Built on a pure spec-builder + jsPDF renderer separated for testability.
- **Shop** — 8 curated SKUs (bead kits, pegboards, tools, accessories), cart, mock checkout.
- **Credits / paywall** — free preview is free forever (right-corner watermark). HD download costs 1 credit. Buying any bead kit grants 5 free HD credits — that's the commerce loop.

## Screenshots

| Discover | Create + Stylize | Print-PDF |
|---|---|---|
| 5-column masonry, search, chip filters | AI chat → 10 templates + 8 styles | grid + legend + bead count |

*(Add screenshots once deployed.)*

## Tech stack

- **Front-end:** vanilla HTML/CSS/JS, ESM modules, no framework, no build step.
- **PDF:** [jsPDF 2.x](https://github.com/parallax/jsPDF) via CDN. Spec-builder is pure JS (`src/lib.js`), renderer is constructor-injected (`src/pdf-render.js`) for hermetic unit tests.
- **Image processing:** Canvas 2D + typed arrays. Pure functions extract palette-index grids from `ImageData`.
- **Tests:** [vitest 2.x](https://vitest.dev/). 18/18 passing across 4 test files.
- **Persistence:** `localStorage` (feed seed, cart, mine, likes, saves, credits, schema version).
- **Deploy:** [Caddy 2](https://caddyserver.com/) auto-HTTPS via Docker Compose. GitOps script pulls from this repo on a remote host.

## Quick start

```bash
git clone https://github.com/KerroKapple/Perler.git
cd Perler

# install dev deps (only needed for running tests)
npm install

# run tests
npm test                 # → 18/18 pass

# run locally — any static server works:
npx http-server . -p 5173
# or:
python -m http.server 5173
```

Then open <http://127.0.0.1:5173/>.

## Project structure

```
.
├── index.html               # the whole app — single page, ESM module script
├── src/
│   ├── lib.js               # pure logic: buildPdfSpec, gridFromImageData
│   └── pdf-render.js        # pure: drawPdf(spec, JsPdfCtor) — DI'd jsPDF
├── tests/
│   ├── buildPdfSpec.test.js
│   ├── gridFromImageData.test.js
│   ├── pdfRender.test.js
│   └── uiSmoke.test.js
├── assets/
│   ├── feed/                # 17 product/project images
│   └── shop/                # 8 SKU images
├── deploy/
│   ├── Caddyfile
│   ├── docker-compose.yml
│   ├── deploy.sh
│   └── deploy-via-github.sh
├── docs/superpowers/plans/
│   └── 2026-04-29-print-pdf.md
├── package.json
├── LICENSE                  # MIT
└── README.md
```

## How the AI generation works

The default flow uses **zero external API calls**:

1. User types a prompt like *"a cute orange cat keychain, pastel"*.
2. `pickTemplate()` keyword-matches against the 10-template library and parses size hints (`keychain`→16, `coaster`→29, `wall`→64) and palette hints (`pastel` / `sunset` / `mono`).
3. The chosen template draws into a 240×240 Canvas using primitive shapes (circles, ellipses, polygons).
4. The result feeds straight into the regular pixelization → quantization pipeline.

To plug in **real** text-to-image, open the *Create → API settings* drawer and pick a provider (OpenAI · DALL·E 3, Stable Diffusion WebUI, or a custom endpoint). The renderer falls back to the local template if the API call fails.

> ⚠️ Front-end-only API keys are exposed to anyone with DevTools. For production, route the call through a thin backend proxy.

## Running the print-PDF tests

```bash
npm test               # all tests
npx vitest run tests/buildPdfSpec.test.js   # only the spec builder
```

The PDF feature is built strict TDD: every commit on `main` corresponds to a Red → Green cycle. See `docs/superpowers/plans/2026-04-29-print-pdf.md` for the full plan.

## Deployment (one-shot via Caddy + Docker)

On a remote host you can SSH into:

```bash
BEADLAB_DOMAIN=your-subdomain.example.com bash deploy/deploy-via-github.sh
```

This SSHes to `kapple` (configured via `~/.ssh/config`), pulls the latest `main`, writes the domain into `.env`, and starts a `caddy:2-alpine` container that auto-issues a Let's Encrypt cert. Edit `deploy/deploy-via-github.sh` to point at your own host.

DNS prerequisite: an `A` record from your subdomain to the host's public IP, with ports 80/443 open.

## License

[MIT](./LICENSE) — do whatever, just keep the notice.

---

*Made for makers. Pull requests welcome — bring your own bead colors.*
