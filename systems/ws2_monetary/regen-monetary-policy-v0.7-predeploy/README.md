# WS2 Monetary Policy (v0.7-predeploy, deploy-ready pack)

This folder is the WS2 (Monetary Mechanics) **predeploy bundle** for Regen’s fixed-cap + dynamic-supply monetary policy.

This “deploy-ready pack” adds two things:
1) **Decision-quality docs** (module ownership, parameters, invariants, governance, security, migration).
2) **Non-invasive implementation scaffolding** (proto + Go skeleton + test vectors) placed under `implementation_scaffold/` so it does not break existing builds.

## Chain baseline

- **Cosmos SDK v0.53.x**
  - `x/protocolpool` for community pool custody/accounting (migration from `x/distribution` community pool on upgrade).
  - `x/circuit` for circuit breaker message disablement.
- **IBC-Go v10+**
  - Explicit separation of **IBC classic** vs **IBC v2** (connection-level choice).
- **IBC Wasm Client**
  - **ICS-008 / 08-wasm** policy for governance-deployed light clients.

## What’s in here

- `docs/` — canonical spec + mapping + governance + security + IBC + migration.
- `simulation/` — offline model and validation scripts (kept from prior bundle).
- `exports/` — example outputs from audits (kept from prior bundle).
- `implementation_scaffold/` — proto + Go skeleton + scripts + example configs (new; opt-in).
- `test_vectors/` — deterministic fixtures for integration tests (new; opt-in).
- `GOV_PROPOSAL_TEMPLATES/` — ready-to-copy governance templates (new).

## How engineers use this

1) Start with `docs/SPEC.md` and `docs/CHAIN_WIRING.md`.
2) Use `docs/PARAMETERS.md` to implement ParamStore + bounds.
3) Implement circuit breaker presets from `docs/SECURITY_RUNBOOK.md`.
4) Use `implementation_scaffold/` as the starting point for a real module (copy into the chain repo’s `x/` and `proto/`).
5) Use `test_vectors/` + `docs/INTEGRATION_TEST_PLAN.md` to get green tests fast.

## Status

Deploy-ready pack generated: 2026-01-20
