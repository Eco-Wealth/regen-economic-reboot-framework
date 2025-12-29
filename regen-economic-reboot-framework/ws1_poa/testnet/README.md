# Regen-PoA-Alpha Testnet Plan (conceptual)

This repository does not ship a full PoA-enabled `regen` binary.
It ships a *plan and parameter template*.

## Phase 1 (interim / Track A)
- Set emissions (inflation) to 0 via governance parameter change
- Reduce max validator set (e.g. 7) via governance parameter change

## Phase 2 (Track B)
- Integrate x/authority validator updates into consensus
- Run PoA authority set on a dedicated testnet

## Metrics to publish
- authority set roster
- fees collected per epoch
- validator pay distributed per epoch
- burn vs pay ratio
