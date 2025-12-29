# Regen PoA Migration (v0.1) — Spec + Simulation Pack

This repository is a **community-led, AI-assisted engineering handoff pack** for **Workstream 1: Consensus & Chain Security (PoA Migration)** from the *Regen Economic Reboot Roadmap v0.1*.

It is intended to help Regen R&D and contributors move from discussion → executable implementation plans.

## What this repo is
- A **v0.1 specification** for migrating Regen Ledger from PoS to a **PoA-style permissioned authority set**
- A **reference simulation** + test vectors for validator compensation funded by registry/network fees
- Protobuf message/interface drafts for `x/authority` and `x/compensation`

## What this repo is NOT
- A drop-in replacement for `regen-ledger` (it is not wired into the Regen app yet)
- A finalized security model or audited implementation
- A replacement for governance or legal review

## Quick Start (non-chain simulation)
```bash
python -m unittest discover -s tests -v
python sim/poa_simulator.py sim/scenarios/example_epoch.json
```

## Contents
- `docs/`: Specs and governance framework
- `proto/`: `.proto` drafts for messages and query services
- `modules/`: Module-level design notes and scaffolds
- `sim/`: Reference simulation (budget-conserving reward distribution)
- `tests/`: Unit tests + test vectors for the simulator
- `testnet/`: Testnet plan + parameter templates (conceptual)

## Versioning
- **v0.1** = “engineering threshold reached” (clear + testable + internally consistent), not audited

## Sources (primary threads)
- Regen Economic Reboot Roadmap v0.1: https://forum.regen.network/t/regen-economic-reboot-roadmap-v0-1/567
- Regen Network Proof of Authority Consensus RFC: https://forum.regen.network/t/regen-network-proof-of-authority-consensus-rfc/70
