# PARAMETERS — Registry, owners, bounds, defaults (v0)

This is the parameter contract engineers implement first. Defaults are placeholders and must be set by governance.

## WS2 controller parameters (custom module or governance-owned param set)

| Param | Type | Owner | Default (v0) | Bounds | Max delta / window | Notes |
|---|---|---|---:|---|---|---|
| CapTotalSupply | uint64 | gov | 221000000000000 (example micro) | >0 | governance-only | Must align with denom and exponent |
| WindowType | enum | gov | EPOCH | {BLOCK,EPOCH} | governance-only | Window defines control cadence |
| WindowSize | uint64 | gov | 1 | >=1 | governance-only | If EPOCH, 1 = every epoch |
| MaxMintPerWindow | uint64 | gov | 0 | >=0 | governance-only | 0 = mint disabled |
| MaxBurnPerWindow | uint64 | gov | 0 | >=0 | governance-only | 0 = burn disabled |
| DeadbandBps | uint32 | gov | 25 | 0..500 | <=25 bps | No-change band |
| Alpha | dec | gov | 0.10 | 0..1 | 0.01 | Controller gain (bounded) |
| Beta | dec | gov | 0.10 | 0..1 | 0.01 | Controller gain (bounded) |
| EcoIndexEnabled | bool | gov | false | {true,false} | governance-only | If enabled, must define EcoIndex feed |
| EcoIndexWeight | dec | gov | 0.0 | 0..1 | 0.05 | Multiplier on EcoIndex effect |

## Protocolpool-related constraints (policy parameters)

These may be protocolpool module params or governance conventions; implement as appropriate:

- ProtocolpoolSpendRequiresGov: default true
- AllowlistRecipients (optional): empty by default
- ClaimWindow (optional): chain-specific

## Circuit breaker preset IDs

Define preset IDs to make ops fast:
- PresetA_ValueFreeze
- PresetB_InterchainIsolation
- PresetC_RoutingLockdown

Implementation: store a mapping preset_id -> list[msg_type_urls] in the WS2 controller module or ops tooling.
