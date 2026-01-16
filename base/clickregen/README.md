# ClickRegen — Phase 0/1 Implementation Repo (Base-first)

**Goal:** demand signal first. Base is the interaction surface. Expensive execution (inference/retirement) is optional and gated by policy.

Core loop: **Intent (Base) → Execute (optional) → Receipt → Finalize (Base)**

## Repo layout
- `interfaces/v0/` Frozen envelopes + schemas + test vectors.
- `contracts/portal/` Base Portal contract (intent registry + receipt finalization + budget/rate limits).
- `relayer/` Node/TS relayer (watches intents, applies policy, finalizes receipts). Uses a mock executor by default.
- `apps/web/` Next.js mobile-first UI ("casino education + impact").

## What ships first
Phase 0:
- User presses a button → Base tx emits `IntentSubmitted` (real, verifiable).
- UI shows “pending/confirmed/finalized” states.

Phase 1:
- Relayer finalizes receipts back to Base (mock executor), enabling deterministic state completion.

## Docs
- `docs/architecture.md`
- `docs/deploy.md`
- `docs/threat-model.md`
