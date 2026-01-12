# Staging deployment

The Regen Hub UX can be deployed as a standard Next.js server.

## Required configuration

1) Point the UI at your Regen API

- Set `REGEN_API_BASE_URL` to the base URL of the service that serves the Regen API routes.
  - Example: `REGEN_API_BASE_URL=https://staging.example.com/regen-api` is **not** correct.
  - The value should be the upstream host root; the UI will proxy `/regen-api/:path*` to `${REGEN_API_BASE_URL}/:path*`.
  - Example: `REGEN_API_BASE_URL=https://staging-regen-api.example.com`

2) Enable KOI mentor proxy

- Set `KOI_API_BASE_URL` (and optionally `KOI_API_KEY`).
- Optionally set `KOI_API_CHAT_PATH` if your upstream isn’t `/chat`.

3) Optional: Offline mock mode

- Set `NEXT_PUBLIC_MOCK_DATA_MODE=1` to run the UI fully offline.
- When enabled, Regen Hub returns deterministic mock data from the browser and does **not** call live upstreams.

## Example .env values

Local docker/test setup:

```bash
REGEN_API_BASE_URL=http://localhost:8080
KOI_API_BASE_URL=http://localhost:8090
KOI_API_CHAT_PATH=/chat
KOI_API_KEY=
NEXT_PUBLIC_MOCK_DATA_MODE=0
```

Hosted KOI endpoint (example):

```bash
KOI_API_BASE_URL=https://regen.gaiaai.xyz/api/koi
KOI_API_CHAT_PATH=/chat
KOI_API_KEY=... # if required by your plan
```

Offline (no upstreams required):

```bash
NEXT_PUBLIC_MOCK_DATA_MODE=1
```

## Deploy using Docker

Build and run:

```bash
docker build -t regen-hub:staging .
docker run -p 3000:3000 \
  -e REGEN_API_BASE_URL=$REGEN_API_BASE_URL \
  -e KOI_API_BASE_URL=$KOI_API_BASE_URL \
  -e KOI_API_KEY=$KOI_API_KEY \
  -e KOI_API_CHAT_PATH=$KOI_API_CHAT_PATH \
  regen-hub:staging
```

## Smoke test checklist

- `/` loads and shows non-zero counts (or a clear error state if APIs unreachable)
- `/projects` lists projects and shows claimable rewards
- `/governance` lists actions
- `/mentor` chat responds (501 only if KOI is intentionally not configured)

## Validation helpers

With the app running (dev or prod), validate upstream connectivity:

```bash
REGEN_HUB_URL=http://localhost:3000 bash scripts/validate-apis.sh
```

Generate a short documentation GIF (desktop + mobile):

```bash
REGEN_HUB_URL=http://localhost:3000 bash scripts/record-demo.sh
```
