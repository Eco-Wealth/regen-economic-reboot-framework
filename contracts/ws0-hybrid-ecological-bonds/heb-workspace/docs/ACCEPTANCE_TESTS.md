# HEB v0.1 Acceptance Tests (Scenario Format)

This file describes “what must work” as deterministic scenarios. Engineers can port each scenario into cw-multi-test.

Scenario A: Create Series via Factory
Given a Factory with allowed principal denom `ibc/USDC` and min initial collateral ratio 25000 bps, when admin creates a Series with terms using principal denom `ibc/USDC` and initial_collateral_ratio_bps 25000, then the Factory instantiates a BondSeries and stores its address in the series registry. When a non-admin tries to create a Series for a different borrower, the call fails Unauthorized unless policy explicitly allows borrower-as-creator.

Scenario B: Deposit Collateral
Given an instantiated Series, when the borrower sends 1_000_000 uregen to DepositCollateral, then Series collateral_locked increases by 1_000_000 and funds remain in the contract. When a non-borrower calls DepositCollateral, it fails Unauthorized.

Scenario C: Open Sale requires collateralization (if enabled)
Given a Series with principal_cap > 0 and initial_collateral_ratio_bps, and a fresh oracle price P, when borrower calls OpenSale without enough collateral to satisfy required collateral for principal_cap at initial ratio, then OpenSale fails. When borrower deposits enough REGEN and calls OpenSale, sale_open becomes true.

Scenario D: Buy mints tokens and pays proceeds
Given sale_open true, when a lender sends 1000 units of principal denom to Buy, then lender balance increases by 1000 bond tokens, total_principal_sold increases by 1000, total_principal_outstanding increases by 1000, fee is sent to fee_recipient, and net proceeds are sent to borrower. When a lender sends a denom other than principal denom, Buy fails.

Scenario E: Cap enforcement
Given principal_cap is 10_000 and total_principal_sold is 9_900, when lender attempts Buy of 200, Buy fails because it would exceed cap. When lender buys 100, it succeeds and sold becomes 10_000.

Scenario F: Interest accrual index
Given base APR 10% and dt = 31_536_000 seconds from last_accrual, when any state-changing message triggers accrue(), then global index increases from 1.0 to approximately 1.10 (scaled by S). Given lender holds 1000 tokens and their user index was 1.0, after sync, their accrued interest becomes approximately 100 and user index becomes 1.10.

Scenario G: Repay reduces outstanding
Given outstanding is 10_000, when borrower Repays 2_500 units, outstanding reduces to 7_500. If repay exceeds outstanding, it is clipped to outstanding and outstanding becomes 0.

Scenario H: Claim interest pays from contract balance
Given lender accrued interest is 100 and contract has at least 100 principal denom balance, when lender calls ClaimInterest, then lender receives 100 principal denom, accrued resets to 0, and contract balance decreases by 100. If contract does not have enough balance, ClaimInterest fails deterministically.

Scenario I: Redeem at maturity burns tokens and returns principal
Given now >= maturity_ts and lender balance is 1000 and outstanding >= 1000 and contract has principal denom, when lender redeems 1000, then lender token balance decreases by 1000 and lender receives 1000 principal denom, and outstanding reduces by 1000. If now < maturity_ts, redeem fails.

Scenario J: Oracle staleness blocks liquidation
Given last_price_ts is older than max_price_age_seconds, when liquidator calls Liquidate, it fails OracleStale. After UpdateOraclePrice completes and last_price_ts is fresh, liquidation is allowed if CR is below threshold.

Scenario K: Liquidation transfers collateral with bonus
Given P is principal per REGEN and CR < liquidation_ratio_bps, when liquidator repays 1000, then D decreases by 1000 and collateral decreases by collateral_out_regr computed using bonus and price, and liquidator receives that amount of uregen. If collateral is insufficient, collateral_out is capped and remaining debt stays.

Scenario L: Impact checkpoint changes APR
Given checkpoint_ts has passed and target_retired is 500 and computed retired_total is 0, when CheckpointImpact runs, it stores met=false. After this, accrue uses apr_bps = base + penalty. When retired_total is later >= 500 and checkpoint reruns, met becomes true and accrual returns to base APR.

Scenario M: Pause behavior
Given paused is true, Buy and Liquidate fail, Repay and RedeemAtMaturity remain allowed, and ClaimInterest remains allowed if funds exist.

Scenario N: Denom invariants
At all times, the contract must only accept collateral_denom for DepositCollateral and principal_denom for Buy/Repay/Liquidate. Any other denom leads to failure with InvalidDenom/InsufficientFunds.
