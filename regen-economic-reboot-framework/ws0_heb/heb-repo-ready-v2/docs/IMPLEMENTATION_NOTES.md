# HEB v0.1 Implementation Notes (Engineer-Ready)

This document tightens the v0.1 design into deterministic math and edge-case behavior so an engineering team can implement without “interpretation gaps”. It is written to match the interfaces in docs/PRD.md from the handoff pack.

## Deterministic math conventions

All token amounts are integers in chain base units (u128). REGEN collateral denom is `uregen`. Principal denom is an IBC denom string (e.g., `ibc/...`).

Fixed-point scale: use a global scale `S = 1_000_000_000_000_000_000` (1e18). Represent indexes and prices as integers scaled by S.

Indexing model: a global interest index `I` tracks growth of 1 unit of principal over time. A holder with balance `b` has a personal index checkpoint `i_user`. Their accrued interest is `b * (I - i_user) / S`. After syncing, set `i_user = I`.

Time: use `t` as seconds since epoch. For any accrual, let `dt = t_now - t_last_accrual`.

APR conversion: APR in basis points `apr_bps` converts to per-second simple rate `r_ps = (apr_bps / 10_000) / seconds_per_year`. With integer math: `r_ps_scaled = apr_bps *S / (10_000* 31_536_000)`.

Accrual update: prefer simple interest per second for v0.1, compounding via index, implemented as:
I_new = I_old + (I_old *r_ps_scaled* dt) / S

This yields continuous-ish compounding and is stable for small r_ps.

Debt accounting: total outstanding debt `D` starts as total principal sold and decreases as principal is repaid or redeemed. Interest is paid from contract balance via claim_interest; to keep v0.1 minimal, treat claims as paying “interest only” from available principal denom balance. If contract has insufficient principal-denom balance for claims, the claim should fail deterministically (or pay partially; choose one policy and lock it). v0.1 recommendation is fail-if-insufficient to keep accounting strict.

## Impact-adjusted rate rule (v0.1)

Base APR is `base_rate_apr_bps`. Penalty APR is `penalty_rate_apr_bps`.

Impact evaluation uses checkpoints. Each checkpoint has `(checkpoint_ts, target_retired)` and a computed `retired_total` across configured ecocredit batches at or after that timestamp.

Define `impact_met = true` if for the latest checkpoint with ts <= now, `retired_total >= target_retired`. If there is no checkpoint yet reached, impact_met defaults to true (no penalty before first checkpoint).

Effective APR:
If impact_met is true, apr_bps = base_rate_apr_bps.
If impact_met is false, apr_bps = base_rate_apr_bps + penalty_rate_apr_bps.

Lock this behavior so it is monotonic between checkpoints: impact status only changes when CheckpointImpact runs and stores the latest evaluation.

## Collateral ratio and liquidation

Inputs:
Collateral locked: `C_regr` (uregen).
Outstanding debt: `D_principal` (principal denom units).
Oracle price: `P` is REGEN per principal denom, or principal per REGEN; pick one and enforce. v0.1 recommendation: store P as “principal_denom per 1 REGEN” scaled by S.

Then collateral value in principal denom:
V = C_regr * P / S

Collateral ratio in bps:
CR_bps = V * 10_000 / max(D_principal, 1)

Liquidation threshold is `liquidation_ratio_bps`. Liquidation is permitted when CR_bps < liquidation_ratio_bps and oracle is fresh.

Oracle freshness: last_price_ts must be within max_price_age_seconds.

Liquidation action: liquidator pays `repay` principal denom into contract. Apply repay to outstanding principal first (v0.1). Collateral out is computed using liquidation bonus:
collateral_out_value = repay * (10_000 + liquidation_bonus_bps) / 10_000
collateral_out_regr = collateral_out_value * S / P

Cap collateral_out_regr to available collateral. Reduce D_principal by repay_applied. Reduce collateral by collateral_out_regr.

If price is missing or stale, liquidation must fail.

## Primary issuance cap and sale rules

principal_cap is the max principal units sold. buy() mints bond tokens 1:1 with principal paid. A buy that would exceed cap must fail or be clipped. v0.1 recommendation: clip by refunding excess is complicated; instead fail if paid would exceed remaining capacity.

Fees: protocol_fee_bps is taken from each buy() payment. fee = paid * fee_bps / 10_000. net proceeds are sent to borrower immediately.

Sale gating:
Sale can only open if borrower has deposited at least the minimum collateral required to satisfy initial_collateral_ratio_bps based on a price. v0.1 options: require a fresh oracle price at open_sale and enforce C_regr >= required. required = principal_cap * initial_ratio / 10_000, converted through price. This prevents undercollateralized issuance.

## Oracle integration behavior (v0.1)

Price update is asynchronous via IBC. The contract sends an OracleRequestPacketData to BandChain via IbcMsg::SendPacket and receives OracleResponsePacketData in ibc_packet_receive, which should update last_price and timestamp. The contract must store request_id or sequence mapping to correlate responses; v0.1 can accept last-write-wins if only one outstanding request at a time.

During oracle staleness, pause buy/open_sale and liquidation. Repay/claim/redeem should remain allowed.

## Impact query (on-chain v0.1)

On Regen, ecocredit query surfaces include a supply query that returns tradable and retired supply for a given credit batch. Implement CheckpointImpact by iterating batch_ids and summing retired supply, then comparing to target_retired for the current checkpoint. Store the resulting ImpactPoint.

## Deterministic failure rules

If matured: buy/open_sale/deposit collateral should fail. repay/claim/redeem remain allowed (repay optional).

If paused: buy/open_sale/liquidate/update_oracle/checkpoint_impact should fail; repay/claim/redeem remain allowed.

If contract balance in principal denom is insufficient to pay interest claims, claim_interest fails with NothingToClaim or InsufficientFunds; choose one and keep consistent.
