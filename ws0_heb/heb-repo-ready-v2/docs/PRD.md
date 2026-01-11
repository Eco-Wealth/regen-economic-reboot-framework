# Hybrid Ecological Bonds (HEB) PRD + Engineering Spec v0.1

## Goal
Ship an on-chain, overcollateralized bond primitive on Regen Ledger that unlocks stablecoin liquidity for ecological work while tying cost of capital to verifiable impact.

## One-line
A borrower locks REGEN, receives stablecoins from lenders, and repays principal+interest; interest is adjusted by ecological performance measured on-chain (v0.1) and via Band oracle scripts (v0.2).

## Target chain + runtime
Regen Ledger (Cosmos SDK) with CosmWasm smart contracts.

## Non-goals (v0.1)
- No on-chain DEX integration required.
- No complex tranche structuring (single series only).
- No undercollateralized debt.
- No cross-chain settlement (beyond IBC stablecoin denom support).

## Users + stories
Borrower (issuer): create a bond series, lock REGEN collateral, sell bond tokens for stablecoins, receive proceeds, repay over time, and withdraw excess collateral when safe.

Lender (bondholder): buy bond tokens with stablecoins, optionally trade them, claim interest, redeem principal at maturity.

Liquidator: repay debt when collateral ratio is unsafe and receive REGEN collateral at a discount.

Governance/admin: set global risk rails (min collateral ratio, supported denoms, oracle settings), pause the system in emergencies.

## Success criteria
- End-to-end happy path works on testnet:
  - Factory instantiates series
  - Borrower deposits collateral and opens sale
  - Lenders buy
  - Borrower draws proceeds (auto on buy)
  - Borrower repays
  - Holders claim interest + redeem principal at maturity
- Unsafe collateral ratio triggers liquidation in a deterministic way.
- Impact checkpoints can be evaluated using on-chain ecocredit batch retired supply (v0.1).

## Core concepts
BondSeries is a single issuance with:
- Collateral: `uregen`
- Principal denom: stablecoin (IBC denom)
- Bond token: CW20-like transferable token representing principal units.
- Interest accrual: global interest index with per-holder index tracking.
- Oracle pricing: REGEN/USD (or REGEN/USDC) via Band (v0.1 includes adapter scaffolding).
- Impact: initially computed via on-chain ecocredit queries (batch retired supply). Later via Band custom oracle scripts.

## Contract set
1) `bond_factory` (CosmWasm)
- Deploys `bond_series` contracts with validated params
- Maintains allowlists and protocol fee settings
- Optionally tracks all created series

2) `bond_series` (CosmWasm)
- Holds collateral, issues bond tokens, collects principal, pays out interest/principal, supports liquidation

3) `heb-types` (Rust crate)
- Shared message structs/configs used by both contracts

## Interfaces (must remain stable)
### Factory Instantiate
- `admin`
- `allowed_principal_denoms[]`
- `min_initial_collateral_ratio_bps`
- `protocol_fee_bps`
- `fee_recipient`
- `bond_series_code_id`

### Factory Execute
- `create_series { terms: SeriesTerms }`
- `update_config { ... }` (admin only)

### Factory Query
- `config`
- `series_list { start_after, limit }`

### SeriesTerms (high level)
- borrower
- collateral_denom (uregen)
- principal_denom (stablecoin IBC denom)
- principal_cap (u128 string)
- maturity_ts (u64)
- base_rate_apr_bps (u32)
- penalty_rate_apr_bps (u32)
- coupon_period_seconds (Option<u64>)
- initial_collateral_ratio_bps (u32)
- liquidation_ratio_bps (u32)
- liquidation_bonus_bps (u32)
- oracle_config (BandConfig)
- impact_config (ImpactConfig)

### Series Execute
- `deposit_collateral {}`
- `open_sale {}`
- `buy { min_tokens }`
- `repay {}`
- `claim_interest {}`
- `redeem_at_maturity { amount }`
- `liquidate { max_repay }`
- `checkpoint_impact {}`
- `pause {}` / `unpause {}` (admin via factory config)

### Series Query
- `terms`
- `state`
- `balance { address }`
- `accrued_interest { address }`
- `collateral_ratio`
- `price_status`
- `impact_status`

## Math + rules (v0.1 defaults)
- Interest accrues continuously using a per-second rate derived from APR bps.
- Effective APR = base APR + penalty(APR) if impact checkpoint missed.
- Collateral ratio = collateral_value_usd / debt_value_usd.
- Liquidation allowed if collateral ratio < liquidation_ratio_bps.
- Liquidator pays principal denom into contract and receives collateral with bonus.

## Security + safety
- Oracle staleness guard: prevent liquidation and new buys if oracle price is stale.
- Pause switch: admin can pause new buys/liquidations in emergencies.
- Denom + cap validations: enforced by factory.

## Implementation notes
- v0.1 impact uses on-chain ecocredit queries; this is fastest to ship.
- v0.1 includes Band adapter scaffolding for prices; teams can wire real IBC requests next.
- The bond token is CW20-like; allowances are TODO for v0.1 unless you need DEX integration immediately.

## Milestones
M1: Compiling contracts + config validation + series deployment (Factory → Series)
M2: Primary sale + token transfers + interest accrual index
M3: Repay/claim/redeem paths + maturity settlement
M4: Liquidation path
M5: Impact checkpoint integration (on-chain)
M6: Oracle wiring (Band IBC) + staleness handling
