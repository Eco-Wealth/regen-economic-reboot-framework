# ClickRegen Leaderboard Indexer (v0)

This service scans `IntentSubmitted` logs from the Portal contract and produces a simple leaderboard JSON file.

Outputs:
- `data/leaderboard.json` (address → clickCount)
- `data/state.json` (last processed block)

## Run (optional)
```bash
cp .env.example .env
npm install
npm run build
npm start
```

## Notes
- This is intentionally minimal: no DB, no Graph, no backend required.
- For production, you can host `leaderboard.json` or serve it via a tiny API.
