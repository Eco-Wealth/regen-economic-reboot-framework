# Developer Onboarding — Regen PoA Migration v0.1

This repo is a **specification + simulation pack** intended to be *pulled into* Regen Ledger R&D work.
It does not (yet) compile into a live chain binary by itself.

---

## 1) Read the spec first
Start here:
- `docs/PoA_Migration_Spec_v0.1.md`
- `docs/Governance_Framework_v0.1.md`

---

## 2) Run the reference simulation + tests
No Cosmos SDK required.

### Run unit tests
```bash
python -m unittest discover -s tests -v
```

### Run the example scenario
```bash
python sim/poa_simulator.py sim/scenarios/example_epoch.json
```

---

## 3) Engineering integration (high-level)
When R&D decides the implementation route, the next step is to integrate into `regen-ledger`:

### Option A — Interim “Plan A” (no-code / minimal code)
- Pause emissions (inflation parameter → 0)
- Reduce max validator set (e.g. 7) via governance parameters
- Keeps PoS plumbing but removes emissions

### Option B — Full PoA migration
- Replace staking-derived validator selection with a governance-curated **authority registry**
- Remove delegation economics; validator compensation comes from fees
- Requires changes in how validator updates are produced for CometBFT

This repo focuses on **Option B** but includes Option A as a governance-safe fallback.

---

## 4) Where to implement (suggested)
- `x/authority`: authority registry, rotation, governance-managed validator set
- `x/compensation`: fee routing + validator compensation distribution

See `modules/` and `proto/` for drafts.

---

## 5) Quality gates for merging into regen-ledger
Minimum acceptance criteria:
- Deterministic validator updates across nodes
- Budget-conserving reward distribution (no minting required)
- Testnet run ≥ 90 days with no halts
- Public dashboard metrics for validator pay + fees
