# PoA Governance Framework (v0.1)

This document describes how the authority set is managed under a PoA migration.

---

## 1. Roles

- **Regen DAO / Governance**: approves additions/removals/rotations
- **Foundation / R&D (interim)**: coordinates implementation, publishes dashboards
- **Community**: oversight via transparent metrics

---

## 2. Authority nomination & approval

### Nomination package (minimum)
- identity: organization name, contacts, jurisdiction
- infrastructure: operator address, consensus pubkey, endpoints
- compliance: KYC/contractual requirements if needed
- compensation address

### Approval
- governance vote with a defined quorum/threshold
- activation at deterministic block height

---

## 3. Rotation policy

Rotation can be:
- scheduled (epoch boundary), or
- exceptional (emergency removal)

Requirements:
- deterministic ordering of updates
- avoid mid-block or EndBlock consensus surprises

---

## 4. Emergency removal

Emergency removal SHOULD require:
- 2/3 governance threshold
- explicit reason code
- public postmortem within 14 days

---

## 5. Transparency

Publish:
- active authority set
- uptime / performance score components
- fee inflow and validator pay outflow per epoch
