# Paste-ready Forum Follow-up (HEB v0.1)

I translated the Hybrid Ecological Bonds idea into an engineer-facing handoff pack so implementation can start without a long interpretation cycle. It includes a PRD-style spec with stable contract interfaces plus a CosmWasm workspace skeleton (Factory + Series + shared types), and a supplement with deterministic math, oracle wiring spec, and acceptance-test scenarios.

Repo: <PUT YOUR GITHUB LINK HERE>

v0.1 scope is intentionally minimal: overcollateralized REGEN-collateral bond series that sells to lenders in stablecoin, CW20-like transferable bond tokens, repay/claim/redeem flows, liquidation mechanics, and an impact checkpoint hook that can use on-chain ecocredit retired supply across specified batch IDs. Band is used for price oracles via IBC, with an optional v0.2 path to use Band for custom “Registry Impact Feeds”.

The concrete asks to unblock a build sprint are: confirm which principal denom(s) we want for v0.1 on Regen, confirm whether impact should be “retired supply by batch IDs” versus a higher-level mapping, confirm whether we want coupon payments or pure accrual-to-maturity for the first demo, and confirm acceptable oracle staleness bounds. If those are aligned, the repo already separates work into milestones and can move immediately to a testnet proof.

Everything here is meant to be iterated in public; if you see a better primitive, point to the exact interface or formula you’d change and I’ll update the pack.
