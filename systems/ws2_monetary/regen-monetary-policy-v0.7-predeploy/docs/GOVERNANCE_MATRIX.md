# GOVERNANCE_MATRIX — Authorities, permissions, constraints

## Default authority model

Unless explicitly delegated, governance is the authority for:
- WS2 parameters
- protocolpool spends/claims policy
- circuit breaker disable/enable
- IBC connection policy (classic vs v2; allowed apps)
- 08-wasm store code + create client (if enabled)

## Controls

### Monetary policy parameters
- Authority: governance
- Constraints: must not violate invariants; max delta per window

### Protocolpool allocations
- Authority: governance
- Constraints: accounting invariant; audit trail

### Circuit breaker presets
- Authority: governance (or delegated with governance oversight)
- Constraints: narrow-first; staged re-enable; invariant checks required

### IBC policy changes
- Authority: governance
- Constraints: must maintain containment posture and explicit protocol selection

### 08-wasm actions
- Authority: governance
- Constraints: audit/allowlist + incident isolation plan
