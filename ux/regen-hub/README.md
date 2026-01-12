# Regen Hub (UX Layer)

This folder contains the Regen Hub unified interface scaffold.

## What's included

- Next.js + TypeScript + Tailwind
- Routed subpages: `/projects`, `/governance`, `/mentor`
- Regen API client for `/regen-api/*`
- KOI/GaiaAI mentor proxy at `/api/koi/chat` (server-side env protected)
- Offline demo mode via `NEXT_PUBLIC_MOCK_DATA_MODE=1`

See full documentation: `docs/regen-hub/README.md`

## Run Locally
1. Install dependencies: `npm install`
2. Copy env: `cp .env.example .env.local`
3. Run development server: `npm run dev`

## Validate / record

With the app running:

- Validate upstream connectivity: `npm run validate:apis`
- Record a short docs GIF (desktop + mobile): `npm run record:demo`

The Regen Hub overlays Regen Network portals with unified navigation, reflection, and learning components.