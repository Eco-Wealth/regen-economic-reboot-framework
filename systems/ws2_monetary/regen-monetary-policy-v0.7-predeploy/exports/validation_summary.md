# Regen Monetary Policy Validation Summary (v0.7-predeploy)

**Confidence score (offline audit):** `0.999`

## Key results

- Inflation mean: `0.001642`
- Inflation std: `0.000707`
- Validator fund drift (pct): `0.000`
- EcoIndex ↔ inflation correlation: `0.017`
- Burn/Mint ratio (sum): `0.469`
- Alpha range: `0.700` to `0.700`
- Beta range: `1.000` to `1.000`

## Charts
- `exports/charts/supply_trajectory.png`
- `exports/charts/inflation_rates.png`
- `exports/charts/alpha_beta_trajectory.png`
- `exports/charts/eco_index.png`
- `exports/charts/sensitivity_heatmap.png`

## Interpretation
This audit demonstrates bounded inflation and bounded controller behavior under synthetic live-style volatility. For production readiness, swap the `eco_index()` and `throughput()` feeds to real chain telemetry and registry metrics.