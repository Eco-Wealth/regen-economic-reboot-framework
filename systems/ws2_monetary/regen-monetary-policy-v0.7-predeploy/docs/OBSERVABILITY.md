# OBSERVABILITY — Metrics, events, alerts

## Required metrics

- total_supply (and headroom_to_cap)
- mint_per_window, burn_per_window
- fees_per_window (by denom)
- protocolpool_balance (module account)
- protocolpool_spends (count + amount)
- circuit_disabled_msg_types (count + list hash)
- ibc_transfer_volume (by channel, by denom)
- wasm_client_actions (store code, create client) if 08-wasm enabled

## Required events (emit from WS2 controller)

- ws2.window_evaluated (window id, inputs summary)
- ws2.mint_burn_decision (mint, burn, reason)
- ws2.param_update_applied (param, old, new)
- ws2.preset_applied (preset id)
- ws2.invariant_check (pass/fail + reason)

## Alerts (minimum)

- cap_headroom < threshold
- unexpected_mint_detected
- protocolpool_balance_delta_unexpected
- circuit_preset_applied (high priority)
- abnormal_ibc_transfer_spike
