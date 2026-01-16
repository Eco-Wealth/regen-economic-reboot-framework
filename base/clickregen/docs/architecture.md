# Architecture (v0)

## Principle
Ship demand signal first. Treat inference/retirement as optional executors behind policy gating.

## State machine
1) Base: `IntentSubmitted(intentId, sender, action, expiry, nonce, payload, payloadHash)`
2) (Optional) executor runs off-chain: inference / Regen tx / etc.
3) Base: `ReceiptFinalized(intentId, success, errorCode, stateHash, execRefHash, resultPayload, receiptHash)`

## Cross-chain compatibility
- Receipts carry an `execRefHash` (bytes32). In Phase 2 this can be `keccak256(regenTxHash)`.
- `stateHash` can represent Regen-side state root/hash later.

## Policy gating
Relayer decides whether to:
- immediately finalize a receipt (cheap, always)
- run optional executor (expensive, only when budget + trust allow)

## Anti-spam / budget
Enforced in two places:
- On-chain: per-address and global per-day caps (hard stop).
- Off-chain: executor probability, trust scoring, and spending budget (soft controls).
