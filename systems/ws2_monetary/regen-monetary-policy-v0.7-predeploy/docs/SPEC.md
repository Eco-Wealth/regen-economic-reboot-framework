# SPEC — Regen Monetary Policy (WS2, v0.7-predeploy, deploy-ready pack)

## 0. Scope

This spec defines WS2 monetary mechanics behavior (policy-level) and is implementation-aligned to Cosmos SDK v0.53 and IBC-Go v10+.

WS2 covers:
- fixed cap
- bounded adaptive mint/burn (if mint enabled) or bounded burn + allocation controls (if mint disabled)
- ecological coupling modifier (EcoIndex) as an optional bounded input
- explicit safety controls via circuit breaker
- explicit interchain constraints (IBC classic vs IBC v2)

## 1. System goals (ordered)

1) Never violate the hard cap.
2) Maintain validator economic viability under realistic fee regimes (bounded).
3) Stabilize fee/supply dynamics without thrashing (bounded adaptation).
4) Enable “safe degraded mode” via message disablement (circuit breaker).
5) Support interchain value movement only under explicit, audited policy.

## 2. Inputs

Minimum inputs:
- fee throughput over a window (block/epoch)
- validator cost proxy over a window (configurable)

Optional inputs:
- registry/market fees (if coupled)
- EcoIndex (bounded 0..1 or -1..+1 depending on definition; must be declared)

## 3. Outputs

Outputs are:
- mint amount (optional) and burn amount (optional) per window, bounded
- parameter updates per window, bounded (max delta)
- protocolpool allocations via governance (not automatic unless explicitly configured)

## 4. Required guardrails

- max mint per window
- max burn per window
- max parameter delta per window
- no-change band (deadband) to prevent thrash
- failsafe: circuit breaker preset activation criteria

## 5. Module ownership

- `x/bank`: balances and module accounts (canonical)
- `x/mint`: mint execution (if enabled), must enforce cap checks
- `x/protocolpool`: community pool custody/accounting + governance-directed spends/claims
- `x/circuit`: message disablement for emergency containment
- `x/gov`: parameter changes, protocolpool spends, circuit breaker controls
- IBC-Go: classic or v2 per connection
- `08-wasm` (optional): wasm light clients (ICS-008), governance gated

## 6. Deploy-ready definition

This bundle is deploy-ready when:
- parameters from `PARAMETERS.md` exist on-chain with bounds enforced
- cap invariant is enforced in code paths
- circuit breaker presets are implemented and tested
- protocolpool accounting and spending is tested
- interchain policy is implemented: classic vs v2 declared and enforced
- 08-wasm (if enabled) is audited/allowlisted and incident posture is tested
