# Band Oracle Integration Spec (CW-Band, IBC) for HEB v0.1

This spec defines the exact contract-side behavior for requesting and receiving oracle data from BandChain via IBC, matching CW-Band patterns.

## Requirements

The contract must implement the IBC entrypoints: ibc_channel_open, ibc_channel_connect, ibc_channel_close, ibc_packet_ack, ibc_packet_receive, ibc_packet_timeout.

The contract sends a request packet over the configured IBC channel and expects a response packet containing the oracle script output.

## Request flow

On ExecuteMsg::UpdateOraclePrice, the contract constructs an OracleRequestPacketData payload and sends it using cosmwasm_std::IbcMsg::SendPacket with:
channel_id = configured band channel
data = binary(OracleRequestPacketData)
timeout = now + timeout_seconds

The contract should restrict to at most one in-flight request per series, or store the sequence number to correlate responses.

## Response flow

In ibc_packet_receive, parse OracleResponsePacketData. Extract the `result` field containing the oracle output for the requested script. Decode into the expected numeric format (price scaled by S). Update state last_price = { price, ts = now }.

If decoding fails, set an error ack.

## Staleness / safety

last_price_ts must be checked on:
OpenSale, Buy, Liquidate

If stale, fail with OracleStale.

Repay and RedeemAtMaturity should not depend on oracle freshness.

## Script payload design

For v0.1, require a Band script that returns price as an integer with a known scale. Store that scale in config or normalize in-contract.

If the Band script returns a tuple, define a deterministic decoding format and document it in the script repository.

## Acks

Use success ack when state updated. Use error ack for invalid packet formats.

## Notes for engineering

CW-Band documentation provides the canonical packet types and example code for SendPacket and receive handling, and includes a “how to request via IBC” guide for CosmWasm.
