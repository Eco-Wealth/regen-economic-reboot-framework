# INVARIANTS — Non-negotiable rules

## Supply invariants

1) **Hard cap**
- Total supply MUST NOT exceed `CapTotalSupply`.
- Any mint path MUST check headroom before minting.

2) **No hidden mint**
- No module may mint outside the approved mint pathway(s).
- Any mint destination must be explicit and auditable.

## Accounting invariants

3) **Community pool custody**
- Community pool funds custody/accounting MUST be owned by `x/protocolpool` under the v0.53 baseline.
- If `x/distribution` exists, it must not be treated as the community pool accounting source of truth.

4) **Module account integrity**
- Module account balances must match expected deltas after each window and after each governance spend.

## Safety invariants

5) **Containment without halt**
- The chain MUST be able to disable high-risk messages via `x/circuit` without halting block production.

6) **Staged re-enable**
- Value movement messages MUST be re-enabled in stages and only after invariant checks pass.

## Interchain invariants

7) **Protocol clarity**
- Any interchain dependency MUST declare “IBC classic” or “IBC v2”.

8) **Value-movement control**
- IBC value movement MUST be circuit-breaker-containable (known message types, presets, playbooks).

## Wasm light client invariants (if 08-wasm enabled)

9) **Allowlist + audit**
- Only audited/allowlisted wasm light client code may be deployed.

10) **Fast isolation**
- Suspected client compromise must immediately isolate interchain value movement (IBC disablement preset).
