# Regen Ledger Proof-of-Authority (PoA) Migration Spec (v0.1)

**Status:**Draft for engineering execution & community review**Scope:**Workstream 1 from*Regen Economic Reboot Roadmap v0.1* **Last updated:** 2025-12-28

---

## 0. Context and motivation

Regen Ledger is currently described as a public Proof-of-Stake chain built on the Cosmos SDK.
The PoA RFC and the Economic Reboot Roadmap discuss the need to stabilize validator costs and reduce reliance on inflationary emissions, given the current market/security realities.

Primary source threads:
- Regen Network Proof of Authority Consensus RFC: https://forum.regen.network/t/regen-network-proof-of-authority-consensus-rfc/70
- Regen Economic Reboot Roadmap v0.1: https://forum.regen.network/t/regen-economic-reboot-roadmap-v0-1/567

---

## 1. Objectives

From the Economic Reboot Roadmap v0.1 (Workstream 1):
- **Stabilize network costs**-**Remove inflationary emissions**-**Align validator incentives with real ecosystem performance**- Produce an engineer-executable**RFC + validator roster + migration plan**

---

## 2. Decision framing: two viable paths

The PoA RFC thread contains an explicit “Plan A” recommendation:
- Pause emissions (set emissions parameter to 0)
- Reduce max validator set (example: 7)

This spec supports **two tracks**:

### Track A (interim): PoS hardening (Plan A)
- Minimal or no code changes
- Governance parameter updates
- Immediate cost relief

### Track B (target): Full PoA migration (authority set)
- Governance-curated validator/authority set
- No delegation-based selection
- Validators compensated from fee streams, not inflation
- Requires engineering work to decouple validator selection from staking economics

This document primarily specifies **Track B**, while treating Track A as fallback.

---

## 3. System design (Track B)

### 3.1 Modules
- `x/authority`: on-chain authority registry + rotation + validator set publishing
- `x/compensation`: fee routing + budget-conserving validator compensation distribution

### 3.2 Authority model

**Authority** = an entity authorized to sign blocks and participate in consensus.

Recommended authority set size:
- configurable; community discussions include 7 (cost-minimal), and potentially 11 or 17 depending on decentralization trade-offs

### 3.3 Authority record (conceptual schema)

Minimum fields:
- `authority_id` (valoper address)
- `consensus_pubkey` (CometBFT signing key)
- `compensation_address` (account receiving pay)
- `entity_type` (R&D / Partner / Steward / Community)
- `active` (bool)
- `rotation_epoch_end` (uint64)

Optional:
- `metadata_uri`, `reputation_score`, `notes`

See `proto/authority.proto`.

---

## 4. Governance model

### 4.1 Authority lifecycle
- **Nominate**→**Approve**(governance) →**Activate**-**Deactivate** (governance, emergency, or automatic SLA failure)
- **Rotate** (scheduled epoch boundary or governance-triggered)

### 4.2 Emergency controls
Define an emergency removal path with:
- strict quorum (e.g. 2/3 of governance voting power)
- explicit reason codes
- time-locked re-activation (to prevent churn/abuse)

See `docs/Governance_Framework_v0.1.md`.

---

## 5. Validator compensation (Track B)

### 5.1 Fee sources
Compensation MUST be funded from non-inflationary streams (fees), e.g.:
- registry module fees
- transaction fees
- marketplace fees (note: Regen marketplace fee pool and burn behavior exists today and may be adapted)

### 5.2 Budget-conserving payout (required)

To prevent “hidden inflation,” validator payouts MUST be **budget-conserving**:

Let:
- `F_total` = total fees collected in epoch
- `f_val` = fraction routed to validator pay (0–1)
- `F_val = floor(F_total * f_val)` = validator pay pool
- `β_i` = performance bonus coefficient for authority `i` (0..β_max)
- `w_i = 1 + clamp(β_i, 0, β_max)`

Then:
- `reward_i = floor(F_val * w_i / Σ w)`, remainder allocated deterministically (e.g. to highest weight, then by stable ordering)

This ensures: `Σ reward_i == F_val` (minus deterministic rounding remainder).

### 5.3 Performance inputs
Performance scoring should come from a mixture of:
- on-chain evidence (missed blocks, downtime, slashing-equivalent signals)
- off-chain monitoring (e.g. GaiaAI), anchored on-chain if used for pay

---

## 6. Rotation

Rotation is parameterized:
- `rotation_epoch_length` (e.g., 6 months)
- scheduled rotation at epoch boundary (BeginBlock preferred)
- governance-triggered rotation available for exceptional circumstances

---

## 7. Migration plan (high level)

### Phase 0 — Governance alignment
- ratify Track A vs Track B plan, or both (Track A interim then Track B)
- publish initial authority roster draft

### Phase 1 — Testnet (regen-poa-alpha)
- implement authority registry + deterministic validator set publishing
- implement compensation routing and distribution
- run ≥ 90 days

### Phase 2 — Mainnet upgrade
- coordinated upgrade height
- cutover procedure + rollback plan

See `testnet/README.md`.

---

## 8. Acceptance criteria (engineering threshold)

Minimum for “implementation-ready”:
- complete message & state definitions (`proto/`)
- deterministic reward distribution test vectors
- deterministic validator set updates test vectors
- documented governance procedures and emergency controls

This repo provides those for v0.1.

---

## 9. Open engineering questions (must be resolved in regen-ledger implementation)

1. **Validator set plumbing**- Will Regen implement PoA by**repurposing `x/staking`**(permissioned validator set, fixed power) or by introducing a**new validator-update provider** module?
   - What is the minimal change that produces deterministic CometBFT `ValidatorUpdate`s without delegation economics?

1. **Delegations / staking UX**
   - If `x/staking` remains for compatibility, how are delegations handled (disabled, ignored, or migrated)?
   - If `x/staking` is removed, what are the migration implications for modules that assume staking exists?

1. **Performance scoring source of truth**
   - Which signals are strictly on-chain (missed blocks, downtime) vs oracle-fed?
   - If oracle-fed, what is the on-chain anchoring mechanism and dispute process?

1. **Fee routing inventory**
   - Identify every fee stream (marketplace, ecocredit issuance, tx fees) and confirm where it lands today.
   - Decide whether validator pay is taken **before**burn,**after** burn, or as a replacement of governance-manual burn steps.

1. **Governance authority**
   - Will authority management live in `x/gov` proposals, `x/group` DAOs, or both?
   - Define the exact threshold and veto rules for emergency actions.

This v0.1 spec assumes these questions will be resolved by R&D during integration.
