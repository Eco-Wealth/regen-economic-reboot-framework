# Regen Monetary Policy v0.7-predeploy

This repository bundle contains an **offline deep validation audit**plus a**reference simulation**for the Regen Economic Reboot Workstream 2:*Fixed Cap + Dynamic Supply*.

## Quickstart (engineers)

Run the deep audit:

```bash

python simulation/regen_validation_audit_v0.7.py

```

Outputs (CSV + PNG charts + JSON confidence report) are written to:

- `exports/regen_validation_metrics.csv`
- `exports/regen_parameter_sweep.csv`
- `exports/regen_confidence_report.json`
- `exports/validation_summary.md`
- `exports/charts/*.png`

Run the core simulator:

```bash

python simulation/regen_dynamic_supply_v0.6.py

```

## What this is

- Fixed supply cap (221M REGEN)
- Dynamic mint/burn tied to fee throughput vs validator cost
- Ecological coupling modifier (EcoIndex)
- Autonomous stabilization (bounded alpha/beta adjustments)
- Audit compares Regen model to simplified EIP-1559 and PID controller references

## Production calibration note

This bundle is **offline-first**. For production-grade calibration, replace synthetic feeds with:
- chain telemetry: fees, tx volume, registry module fees
- ecological metrics: verified credits, hectares, biodiversity indices (smoothed)

## Tag
`regen-monetary-policy-v0.7-predeploy`
