# CHAIN_WIRING — Implementation blueprint (Cosmos SDK v0.53 / IBC-Go v10)

This file is the “no guesswork” guide for engineers.

## 1) Required modules (minimum)

- auth, bank, gov
- staking, slashing
- mint (optional, if mint enabled)
- protocolpool (required for community pool baseline)
- circuit (required)
- IBC-Go modules (core + transfer stack)
- 08-wasm (optional, if wasm light clients enabled)

## 2) Module accounts (must exist)

- protocolpool module account (community custody)
- fee collector
- mint module account (if mint enabled)
- distribution module account (if distribution still present)
- any WS2 controller module account (if you buffer funds)

## 3) Where WS2 runs

Pick one (and document it in code):
- EndBlocker: most common for windowed controllers
- Epoch hook: if using epochs module
- Governance-triggered only: if you want no autonomous adjustments at first

Recommendation for “ASAP”: implement as **epoch hook** or EndBlocker with a strict deadband and MaxMint=0 initially.

## 4) Wiring responsibilities

- Cap checks: enforce in mint keeper wrapper or WS2 controller before calling mint.
- Community pool: treat protocolpool as accounting source of truth.
- Circuit breaker: implement presets and expose them to governance/ops.

## 5) IBC classic vs v2

- Require config per connection: protocol version and allowed apps for value movement.
- Keep the decision in governance docs and in code configuration (so tests can enforce it).

## 6) 08-wasm (if enabled)

- Governance gate: store-code and create-client must be governance-authorized.
- Security: require code hash allowlist in params (or compiled allowlist) plus audit references.
