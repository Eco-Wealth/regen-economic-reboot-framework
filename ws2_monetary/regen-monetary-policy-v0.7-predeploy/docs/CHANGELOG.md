# Changelog

## v0.7-predeploy (2025-12-28)
- Fixed validator solvency bug in the simulation/audit logic.
- Mint/burn now accounts for **fee routing**: validator funding is based on `fees * VALIDATOR_RATIO`, not raw `fees`.
- Burn pool (`fees * BURN_RATIO`) is burned immediately from supply.
- Mint now covers validator **deficit after routing**; optional surplus burn is applied as `alpha * surplus`.
- Updated defaults: `BETA = 1.0` to cover operational deficits under the routed-fee model.
