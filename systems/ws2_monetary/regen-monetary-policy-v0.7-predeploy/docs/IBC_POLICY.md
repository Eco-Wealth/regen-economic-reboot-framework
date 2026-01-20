# IBC_POLICY — IBC classic vs IBC v2, value movement, and 08-wasm

## Naming rule

Any WS2 document MUST say “IBC classic” or “IBC v2”.

## Connection policy

Each connection must declare:
- protocol: classic or v2
- allowed apps/channels for value movement
- circuit breaker disablement posture

## Value movement constraints

- allowlist assets and channels
- define whether rate limits apply
- define how incidents isolate interchain value movement

## 08-wasm (ICS-008) policy (if enabled)

- only audited/allowlisted code
- governance-controlled store code + create client
- fast isolation on suspected compromise
