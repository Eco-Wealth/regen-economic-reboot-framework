# Scripts

This folder is intentionally minimal. Typical next step:
- add `ts-node` deploy scripts using `@cosmjs/*`
- store chain config for Regen testnet
- build + upload wasm, then instantiate factory, then create series

Suggested structure:
- `deploy.ts`: upload wasm + instantiate
- `create_series.ts`: create a BondSeries via factory
- `helpers/`: denom/channel constants per environment
