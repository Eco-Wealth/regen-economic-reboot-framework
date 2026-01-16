# Contributing to ClickRegen

## Project rule
This repo ships in phases. Do not implement inference, Regen retirement, or earning mechanics until Phase 0 + Phase 1 are stable.

## Current target
### Phase 0 (now): Demand signal on Base
Done when:
- Web UI has a single primary button and works on mobile.
- Clicking submits an on-chain intent to the Portal contract.
- UI shows a clear status progression for the click (submitted/confirmed).

### Phase 1 (next): Receipt finalization
Done when:
- Relayer watches `IntentSubmitted`.
- Relayer finalizes a receipt back to Base for submitted intents.
- UI can show a resolved state without manual intervention.

## Out of scope (not now)
- Regen retirement execution
- AI inference executor
- Any “earn” or rewards beyond non-financial points
- Token claims or guaranteed-income language

## Repo map
- `interfaces/v0/` frozen envelopes
- `contracts/portal/` Base contract
- `relayer/` watches intents, applies policy, finalizes receipts
- `apps/web/` mobile-first UI
- `indexer/` (optional) builds a leaderboard by scanning logs

## Quality bar
- Keep interfaces backward compatible (`interfaces/v0`).
- Keep costs bounded (caps + rate limits).
- Keep UX understandable without AI or support.
