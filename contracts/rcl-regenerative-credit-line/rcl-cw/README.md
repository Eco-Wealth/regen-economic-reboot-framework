# Regenerative Credit Line (RCL) - CosmWasm Contract

This is a Rust / CosmWasm implementation of the Regenerative Credit Line for Regen Ledger v5+ (Cosmos SDK v0.53).

### Features
- Dynamic trust scores and credit limits
- Borrow / repay / update trust functions
- Compatible with IBC Wasm Client and GaiaAI MRV feeds

### Build
```
cargo wasm
wasmd tx wasm store artifacts/rcl_line.wasm --from validator
```
