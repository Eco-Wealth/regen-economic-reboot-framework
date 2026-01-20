# UPGRADE_RUNBOOK — v0.53 baseline adoption + WS2 rollout

## Preconditions

- governance-approved upgrade plan
- protocolpool module included and enabled
- circuit module included and enabled
- invariants and presets agreed and tested in testnet

## Upgrade checklist

1) Upgrade chain binaries to Cosmos SDK v0.53.x line.
2) Confirm protocolpool migration executed (community funds moved under protocolpool custody/accounting as expected).
3) Apply WS2 parameter set (cap, bounds, presets).
4) Run invariant checks (supply, protocolpool balances).
5) Verify circuit breaker can disable/enable messages.
6) If enabling IBC v2 and/or 08-wasm, do so in a staged manner:
   - enable connections/protocol choices
   - validate transfer behavior
   - validate isolation posture

## Rollback posture

- If unexpected value movement occurs: apply Preset A immediately.
- If suspected interchain issue: apply Preset B immediately.
- If unknown blast radius: apply Preset C and coordinate remediation.

## Post-upgrade monitoring

- cap headroom and mint/burn decisions
- protocolpool balance and spends
- circuit breaker state
- IBC transfer volume
