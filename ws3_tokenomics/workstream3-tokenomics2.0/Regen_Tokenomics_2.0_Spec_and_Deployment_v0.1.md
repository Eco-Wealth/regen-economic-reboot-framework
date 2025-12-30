# Regen Tokenomics 2.0 — Workstream 3 Engineering Pack (v0.1)

**Scope:**Tokenomics 2.0 (Economic Loop + ReFi Integration)**Status:**Draft spec for engineer review + testnet execution**Provenance:** Values in this pack come from GaiaAI tool calls performed in this chat session (see `/simulations/*.json`).

## 1. Objective
Ensure every registry and ReFi interaction creates REGEN-denominated economic coupling by routing a value-based fee into:
- **Burn** (supply contraction)
- **Validators** (security budget aligned to activity)
- **Community pool** (ReFi bridge + public goods)

## 2. On-chain baseline (GaiaAI)
- Token supply (uregen): **221,794,240,734,747 uREGEN** (~221,794,240.735 REGEN)
- Marketplace snapshot (90d proxy):
  - Total value: **25,961,800,000 uREGEN** (~25,961.800 REGEN)
  - Orders: 26
  - Credits volume: 28229.223
  - Active types: C, BT
- Important limitation: marketplace sell orders are a **proxy** for throughput. For production forecasts, use a node-indexed time-series of registry actions.

## 3. Fee model (recommended for testnet)
- FeeRate: **2%** (0.02)
- Split options tested:
  - 40/30/30
  - 50/25/25 (recommended default)
  - 60/20/20
- Safety cap: MaxFeeRate **5%** (0.05)

### 3.1 What the 90d proxy implies (FeeRate=2%)
- Total fees over 90d proxy: **519,236,000 uREGEN** (~519.236 REGEN)
- With 50/25/25, burn over 90d proxy: **259,618,000 uREGEN** (~259.618 REGEN)

See `simulations/fee_split_simulation.csv` for full table.

## 4. Module spec: x/feemodule
Implementation scaffold is in:
- `sdk_module/feemodule_spec.go`
- `sdk_module/params_schema.yaml`

### 4.1 Invariants
- BurnShare + ValidatorShare + CommunityShare == 1.0
- FeeRate <= MaxFeeRate
- Rounding remainder routes to community share to avoid drift

## 5. ReFi Bridge (community pool)
Policy is in `governance/refi_bridge_policy.md`. Default target allocations:
- ReFiDAO 30%
- Kolektivo 20%
- Toucan 20%
- Commons Stack 10%
- Open grants 20%
Cap: max 30% per partner per epoch.

## 6. Testnet plan
See `deployment/testnet_plan.md` for phases, rollback, and success criteria.

## 7. Ops checklist
See `deployment/devops_checklist.md` for an execution sequence engineers can follow.

## 8. Monitoring wiring
See `deployment/gaiaai_monitoring.yaml`. This is intended to be wired into CI and dashboards.

## 9. Validation artifacts
- `simulations/market_snapshot_90d.json`
- `simulations/supply_validation_report.json`
- `simulations/gaia_confidence_report.json` (composite confidence: 0.964)
