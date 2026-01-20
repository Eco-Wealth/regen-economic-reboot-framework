# SECURITY_RUNBOOK — Circuit breaker presets + incident response

## Presets (recommended)

Preset A — Value movement freeze
- Disable: bank send/multisend, protocolpool value-moving msgs, IBC transfer msgs

Preset B — Interchain isolation
- Disable: IBC transfer and other value-moving IBC app msgs
- Keep enabled: governance + remediation-critical msgs

Preset C — Routing lockdown (last resort)
- Disable: everything except a minimal allowlist for governance/remediation

## Incident playbook

1) Identify scope: bank vs protocolpool vs IBC vs wasm client.
2) Apply narrowest preset that stops value movement in scope.
3) Communicate: what is disabled and why.
4) Remediate: patch/upgrade/parameter updates.
5) Re-enable in stages with invariant checks after each stage.

## Invariant checks

- supply <= cap
- protocolpool module account matches expected accounting
- no unintended mint routes
- IBC escrows/vouchers consistent for allowed channels
