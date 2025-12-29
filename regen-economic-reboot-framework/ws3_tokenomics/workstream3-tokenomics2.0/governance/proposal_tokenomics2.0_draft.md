# Proposal Draft — Regen Tokenomics 2.0 (Workstream 3) v0.1

## Motion
Approve and deploy a value-based registry fee routing mechanism ("FeeRouter") that routes a percentage of ecological credit value into:

- Burn (deflation)
- Validator compensation (PoA-aligned security budget)
- Community pool (ReFi bridge + public goods)

## Initial Parameters (recommended for testnet)
- FeeRate: 2% (0.02)
- Split: 50% burn / 25% validators / 25% community
- MaxFeeRate: 5% safety cap (0.05)

## Rationale
Today, REGEN demand is weakly coupled to registry activity. Tokenomics 2.0 creates coupling: throughput -> fees -> burn + security + ecosystem funding.

## Deliverables referenced
- `Regen_Tokenomics_2.0_Spec_and_Deployment_v0.1.md`
- `sdk_module/feemodule_spec.go`
- `deployment/testnet_plan.md`
- `simulations/*`

## Safety
- All parameters governance-controlled.
- Shares must sum to 1.0.
- Remainder-to-community avoids rounding drift.
- Testnet-first rollout with rollback plan.

## Exit Criteria for mainnet vote
- ≥99% fee routing correctness across test suite
- Burn and pool accounting matches expected values
- No critical panics or invariant violations during test epochs
