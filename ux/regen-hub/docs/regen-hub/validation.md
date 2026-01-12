# v0.3-beta validation notes

This document records the post-merge validation pass for the Regen Hub UX.

## What was validated

- API wiring remains intact for:
  - `/regen-api/*` (projects, rewards, governance actions)
  - `/api/koi/chat` (mentor chat proxy)
- RoleDashboard has explicit loading / error / empty states (including “retry”).
- MentorPanel supports simulated streaming output (token/word flow) with a live typing cursor.
- Offline mode is available via `.env`: `NEXT_PUBLIC_MOCK_DATA_MODE=1`.
- Mobile responsiveness was checked via layout breakpoints and a helper script that captures
  both desktop and mobile screenshots for a documentation GIF.

## How to re-run the checks

1) Configure env

```bash
cp .env.example .env.local
# Optionally enable offline mode:
# echo "NEXT_PUBLIC_MOCK_DATA_MODE=1" >> .env.local
```

2) Run the app

```bash
npm install
npm run dev
```

3) Validate endpoints

```bash
npm run validate:apis
```

4) Record docs media

```bash
npm run record:demo
```

This writes:

- `docs/regen-hub/demo-desktop.gif`
- `docs/regen-hub/demo-mobile.gif`

## Notes / gotchas

- `NEXT_PUBLIC_MOCK_DATA_MODE` is a client-visible env var; for production builds it is embedded at build time.
  If you need to toggle offline mode in a built Docker image, rebuild with the desired value.
