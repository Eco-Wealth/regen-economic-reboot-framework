# MODULE_MAPPING — Cosmos SDK v0.53 / IBC-Go v10 wiring

## Community pool: `x/protocolpool`

Owner: `x/protocolpool`

Responsibilities:
- custody of community pool funds (module account),
- accounting source of truth for community pool balance,
- governance-directed allocations/claims (chain-specific configuration).

Migration note:
- under the v0.53 baseline, community pool funds migrate from distribution community pool into protocolpool custody during upgrade.

## Emergency controls: `x/circuit`

Owner: `x/circuit`

Responsibilities:
- maintain a list of disabled message types (and/or allowlists),
- allow governance/authorized roles to trip/reset according to chain policy,
- act as a failsafe so the chain can continue producing blocks while value movement is restricted.

## Supply movement: `x/bank` (+ `x/mint` if enabled)

Owner: `x/bank` is canonical for balances and module accounts.

If `x/mint` is enabled:
- minting must be bounded by cap and controller guardrails,
- mint destination must be explicit (e.g., protocolpool, fee collector) per chain policy.

If mint is disabled:
- policy can still define burn behavior and allocations without mint.

## Governance: `x/gov`

Responsibilities:
- parameter changes (cap, bounds, coefficients),
- protocolpool allocations/spends,
- enabling/disabling circuit breaker entries,
- wasm client governance actions (if 08-wasm is used).

## IBC: IBC-Go v10+

Responsibilities:
- maintain client/connection/channel state for chosen protocol (classic or v2),
- enforce app constraints for token transfers,
- surface message types for circuit breaker presets.

Connections MUST declare which IBC protocol they use (classic vs v2).

## Wasm light clients (optional): `08-wasm` (ICS-008)

Responsibilities:
- store/instantiate wasm light client contracts through governance-controlled flows,
- proxy client verification and updates to the wasm contract entrypoints,
- enable new clients without binary upgrades (subject to security policy).
