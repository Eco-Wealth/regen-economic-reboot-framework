# MIGRATION — Updating older WS2 assumptions to Cosmos SDK v0.53 / IBC-Go v10+

## 1) Community pool: distribution -> protocolpool

Update all references:
- community pool custody/accounting -> `x/protocolpool`.

Include upgrade note:
- funds migrate from distribution community pool into protocolpool custody during upgrade.

## 2) Safety controls

Add circuit breaker posture:
- disable specific messages to contain incidents without halting.

## 3) Interchain

Distinguish:
- IBC classic vs IBC v2 (connection-level decision).

## 4) Light clients

If enabling 08-wasm:
- audit + allowlist + governance gating + fast isolation plan.
