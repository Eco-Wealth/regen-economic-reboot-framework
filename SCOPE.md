# Scope

This repository defines the **Regen Reboot v0.3 architecture**.

## In Scope

- Economic system design (monetary mechanics, tokenomics)
- Governance and market signaling systems
- Permissioned CosmWasm contract specifications and implementations
- MRV data flows and attestation logic
- UX convergence at the system level (not product UI)

## Out of Scope

- Production frontends
- Deployment scripts
- Chain-specific ops or validator tooling
- Marketing or community comms
- Finished SDK modules (this repo informs them)

## How to Use This Repo

- Treat **systems/** as the conceptual and governance layer
- Treat **contracts/** as the executable surface
- Treat **ux/** as the connective tissue between users, data, and contracts
- Treat **forum-refs/** as historical context, not authority

This repo exists to make downstream implementation easier, safer, and more legible.
