# Regen Monetary Policy Spec v0.1

## Goal
Establish a fixed-cap REGEN supply with adaptive, throughput-linked dynamic mint/burn to stabilize validator compensation while increasing long-run scarcity.

## Core idea
- Hard cap: 221,000,000 REGEN
- Fees fund validators and burns
- Controlled mint only occurs to cover validator cost shortfalls
- Optional ecological coupling adjusts mint/burn response to ecological throughput

## Control logic (conceptual)
If fees exceed validator cost, burn a portion of the surplus.
If fees fall below validator cost, mint just enough (bounded) to cover operations, preferably to a validator fund rather than general circulation.

## Notes for implementation
A Cosmos-SDK module can implement this via:
- a parameter store for alpha/beta bounds and routing splits
- end-block hooks for epoch accounting
- events for mint/burn and fund balance visibility
