# DevOps Execution Checklist (Tokenomics 2.0) v0.1

## Prereqs
- Go toolchain installed
- Regen node buildable from target branch
- Access to testnet validator keys and genesis tooling

## Localnet (smoke)
- Build node binary
- Start single-validator chain
- Submit param-change proposal setting FeeRate + shares
- Execute sample registry tx with known value
- Query module balances and total supply delta
- Run unit + integration tests

## Testnet v1
- Spin 5-validator PoA set
- Deploy binary with x/feemodule enabled
- Run scripted tx load (value-bearing registry actions)
- Verify:
  - burn amount per tx
  - validator distribution totals per epoch
  - community pool inflow totals
- Run epoch distribution (ReFi Bridge) with test recipients
- Export state snapshot and test rollback procedure

## Gate to mainnet proposal
- Publish testnet report + tx hashes
- Confirm invariants under load
- Confirm governance parameter update path works
