# Regen Economic Reboot Framework

This repository is the **v0.3 umbrella framework** for restructuring Regen Network’s
economic, governance, contract, and UX systems.

It is not a product repo.  
It is a systems-level reboot: architecture, specs, and permissioned contract surfaces
that inform downstream implementation.

## Start Here

- **meta/regen-reboot-index.md** — canonical index and navigation
- **systems/system-map.md** — how WS0–WS5 fit together

## Repository Structure (v0.3)

- **contracts/**  
  WS0 permissioned CosmWasm contracts (specs, schemas, code)
  - Hybrid Ecological Bonds
  - Credit Lifecycle Controller
  - MRV Adapter

- **systems/**  
  WS1–WS5 conceptual and governance workstreams
  - Proof of Authority
  - Monetary mechanics
  - Tokenomics 2.0
  - Market & governance signaling
  - UX convergence (system-level)

- **ux/**  
  Regen UX Convergence artifacts, data models, and validation flows

- **forum-refs/**  
  Source references from community and ecosystem discussion
  (context only, not canonical specs)

- **meta/**  
  Coordination layer: indexes, AI integration, refactor planning

## Status

This repo is in **active refactor + build phase**.
Structure is stable; contents will evolve as WS0 contracts and WS1–WS4 systems are specified.
