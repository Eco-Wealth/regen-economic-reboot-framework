# Tokenomics 2.0 Testnet Deployment Plan v0.1

## Objective
Validate the FeeRouter + ReFi Bridge flows in an isolated environment before mainnet consideration.

## Baseline parameters (testnet)
- FeeRate: 0.02
- Split: 0.50 / 0.25 / 0.25 (burn/validators/community)
- MaxFeeRate: 0.05

## Phases
1) Localnet
- 1 validator, scripted txs, unit tests
- confirm fee math, rounding, invariants

2) Testnet v1 (5 validators)
- run epoch distributions
- confirm validator reward plumbing + community pool accounting

3) Safety & rollback drills
- param misconfig attempt (cap)
- module disable via param switch
- state export/import rollback

4) Transparency dashboard wiring
- publish burn + rewards + treasury metrics

## Success criteria
- ≥99% fee routing correctness under load tests
- Burn totals match expected computations
- No invariant violations (supply, module balances)
- Governance param changes operate as designed
