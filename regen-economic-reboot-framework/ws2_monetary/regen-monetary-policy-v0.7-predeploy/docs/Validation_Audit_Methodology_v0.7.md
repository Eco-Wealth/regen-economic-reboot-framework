# Validation Audit Methodology v0.7

This audit is designed to “spoon-feed” engineers by providing:
- deterministic code
- reproducible datasets
- clear outputs
- pass/fail aligned metrics

## What gets tested
1. Economic stability
   - inflation mean and volatility
   - burn/mint ratio
1. Validator solvency
   - validator fund drift under volatility
1. Ecological coupling behavior
   - correlation of EcoIndex with inflation response
1. Control stability (bounded adaptation)
   - proxy Lyapunov-like metrics on alpha/beta changes
1. Sensitivity analysis
   - heatmap of net mint across EcoIndex × throughput grid

## What is not tested (yet)
- Backtesting against historical on-chain data (replace the synthetic feeds)
- Governance proposal wiring (parameter change handlers)
- On-chain implementation correctness (Cosmos-SDK module integration tests)
