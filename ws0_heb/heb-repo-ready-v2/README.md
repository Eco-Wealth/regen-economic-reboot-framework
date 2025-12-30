# Hybrid Ecological Bonds (HEB) — Engineer Handoff Pack (v0.1)

This repo is a **CosmWasm workspace skeleton** for implementing Hybrid Ecological Bonds on Regen Ledger.

It includes:
- `contracts/bond_factory`: deploys/registries BondSeries contracts
- `contracts/bond_series`: a single bond issuance + a CW20-like bond token (minimal subset)
- `packages/heb-types`: shared messages/types between contracts
- `docs/PRD.md, docs/IMPLEMENTATION_NOTES.md, docs/ORACLE_SPEC.md, docs/ACCEPTANCE_TESTS.md`: product/engineering spec (interface-first)
- `scripts/`: placeholder deployment script layout

## Quick start (dev)
1. Install Rust stable + wasm target:
   - `rustup target add wasm32-unknown-unknown`
1. Build:
   - `cargo build --release --target wasm32-unknown-unknown`
1. Run unit tests:
   - `cargo test`
1. Schema (optional):
   - `cargo run -p bond_series --example schema`
   - `cargo run -p bond_factory --example schema`

## Status
This is a **skeleton** designed to accelerate real implementation. It compiles, has message/state scaffolding, and includes TODOs where teams typically need to decide specifics (oracle wiring, liquidation math, full CW20 allowance support, etc.).

## License
Apache-2.0 (placeholder — update to match your project policy).

## Supplement docs
See `docs/*_SUPPLEMENT.md` for deterministic math, oracle wiring spec, acceptance tests, and a paste-ready forum follow-up.
