# INTEGRATION_TEST_PLAN — Fast path to green tests

## Goal
Make it easy to implement and verify WS2 in small PRs.

## Test categories

### A) Cap invariant
- A1: mint request that exceeds cap is rejected
- A2: mint request that fits under cap is accepted
- A3: mint disabled (MaxMint=0) => any mint attempt rejected

Fixtures: `test_vectors/cap_invariant_basic.json`

### B) Protocolpool accounting
- B1: protocolpool module account balance is source of truth for community pool
- B2: governance-directed allocation reduces protocolpool balance by expected amount

### C) Circuit breaker
- C1: applying Preset A disables bank send + protocolpool value msgs + IBC transfer msgs
- C2: applying Preset B disables IBC value movement only
- C3: staged re-enable requires invariant checks

Fixture: `test_vectors/circuit_presetB_interchain_isolation.json`

### D) IBC policy enforcement
- D1: connection declares classic vs v2; missing declaration fails validation
- D2: only allowed channels/assets can transfer value
- D3: incident triggers apply Preset B

Fixture: `test_vectors/ibc_connection_policy_example.json`

### E) 08-wasm governance gates (if enabled)
- E1: store-code and create-client only allowed under governance authority
- E2: allowlist enforcement (code hash present)
- E3: suspected compromise => interchain isolation preset

## Minimal acceptance criteria
- All A, C, D tests passing in CI
- B and E passing if those modules/features are enabled in the target chain
