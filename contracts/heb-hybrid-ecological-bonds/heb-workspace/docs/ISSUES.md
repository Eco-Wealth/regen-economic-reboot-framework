# Suggested GitHub issues for a v0.1 testnet sprint

Create these as issues (or milestones) so contributors can pick work without re-reading the entire spec.

1) Wire Band IBC price oracle end-to-end
- Implement UpdateOraclePrice to SendPacket with OracleRequestPacketData
- Implement ibc_packet_receive to parse OracleResponsePacketData and store last_price
- Enforce max_price_age_seconds on OpenSale, Buy, Liquidate

2) Implement fixed-point interest index math (1e18 scale)
- Replace string math with u128/u256 + scale constants
- Implement accrue_index + per-account sync (balance * delta_index / S)

3) Implement principal_cap enforcement and OpenSale collateral gating
- Enforce cap on Buy
- Require oracle freshness + initial collateral ratio check in OpenSale (policy decision)

4) Implement liquidation math using price + bonus
- Compute collateral ratio bps
- Transfer collateral_out based on repay * (1 + bonus) / price
- Add partial liquidation + caps and invariant tests

5) Implement on-chain ecocredit retired supply query for checkpoints
- Stargate queries (or supported query path) to sum retired supply across batch_ids
- Store ImpactPoint and use it to set effective APR (base vs base+penalty)

6) cw-multi-test acceptance suite
- Port docs/ACCEPTANCE_TESTS.md into executable tests
- Add edge cases (stale oracle, maturity boundary, insufficient contract balance, pause)

7) Developer UX
- Add minimal ts deployment scripts (cosmjs) for Regen testnet
- Add schema generation and release pipeline
