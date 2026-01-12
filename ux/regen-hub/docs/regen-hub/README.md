# Regen Hub UX

Unified UX layer for projects, rewards, governance, and mentor guidance.

## Routes

- `/` – Dashboard (projects + rewards + governance summary)
- `/projects` – Project list + claimable rewards
- `/governance` – Governance actions queue
- `/mentor` – GaiaAI mentor chat (KOI API)

## API integration

### Regen API

Front-end calls are made to paths under `/regen-api/*`.

In local/staging, Next rewrites can proxy these to an external service:

- Set `REGEN_API_BASE_URL=<http(s)://host:port>`
- Client call: `/regen-api/projects`
- Next proxies to: `${REGEN_API_BASE_URL}/projects`

Endpoints currently consumed:

- `GET /regen-api/projects` → array or `{ projects: [...] }`
- `GET /regen-api/rewards` → `{ rewards: [...], totalEarned?, pending?, claimable?, claimed? }`
- `POST /regen-api/rewards/claim` body: `{ rewardId }`
- `GET /regen-api/governance/actions` → array or `{ actions: [...] }`

### KOI / GaiaAI mentor

The UI calls `POST /api/koi/chat`.

This repository implements `pages/api/koi/chat.ts` as a secure proxy to an upstream KOI service:

- `KOI_API_BASE_URL` (required)
- `KOI_API_KEY` (optional; server-side only)
- `KOI_API_CHAT_PATH` (optional, default `/chat`)

The proxy posts `{ messages, context }` to the upstream and normalizes the response into:

```json
{ "reply": "...", "meta": { "upstreamStatus": 200 } }
```

## Environment variables

Copy `.env.example` to `.env` for Docker Compose, or to `.env.local` for `next dev`.

Never commit secrets.

| Variable | Required | Description |
| --- | --- | --- |
| `REGEN_API_BASE_URL` | No | Enables Next rewrite proxy for `/regen-api/*` |
| `KOI_API_BASE_URL` | No* | Required to enable mentor chat (without it, `/api/koi/chat` returns a helpful 501 response) |
| `KOI_API_KEY` | No | Bearer token sent from server to upstream KOI |
| `KOI_API_CHAT_PATH` | No | Upstream path for chat, default `/chat` |
| `NEXT_PUBLIC_MOCK_DATA_MODE` | No | When `1`, UI runs fully offline with deterministic mock data |

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open: `http://localhost:3000`

### Validate / record demo media

With the app running:

```bash
npm run validate:apis
npm run record:demo
```

## Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Open: `http://localhost:3000`

## Production build

```bash
npm run build
npm run start
```
