# 🌍 **Regen Economic Reboot Framework (main)**

This repository unifies all Regen Network economic reboot workstreams under one coordination and publication layer — including the newly merged **UX Convergence Workstream (v0.4.1)**.

---

## 🧩 **Workstream Overview**

| ID | Name | Purpose | Status |
|----|------|----------|--------|
| WS0 | **Hybrid Ecological Bond (HEB)** | Regen-native regenerative finance instrument leveraging on-chain ecological collateral | Draft |
| WS1 | **PoA Migration** | Transition to Proof-of-Authority consensus for validator and governance reform | In Review |
| WS2 | **Monetary Policy** | Implementation of fixed cap + dynamic supply logic | Planned |
| WS3 | **Tokenomics 2.0** | Regen economic loop and ReFi integration | Planned |
| WS4 | **Market & Governance Signaling** | Coordination, transparency, and governance publication layer | Active |
| **UX Convergence** | **AI-Aligned User Experience** | Unified regenerative UX; GaiaAI + KOI aligned with JSON-LD schema and CI/CD workflow | ✅ **Merged to main (v0.4.1)** |

---

## 🧠 **Repository Structure**

Each workstream folder contains its own scope, documentation, and specs.  

- **`regen-ux-convergence/`** → AI-aligned UX layer with mock APIs, schema validation, and feedback integration  
- **`contracts/`** → Blueprint for permissioned CosmWasm modules (in progress)  
- **`governance/`** → Tokenomics, PoA migration, and market signaling specifications  
- **`.github/workflows/`** → CI/CD validation for mock schemas and endpoint consistency  

---

## 🚀 **Recent Updates**

- ✅ Added **UX Convergence v0.4.1** — includes GaiaAI + KOI schema alignment, REST + GraphQL mock endpoints, and JSON-LD compliance  
- 🧩 Structured feedback path for AI → UX → KOI loop integration  
- 🌿 Preparing next stage (v0.5) to include live AI dashboards and user data pathways  

---

## 🧱 **Technical Components**

| Layer | Technology | Purpose |
|--------|-------------|----------|
| Blockchain | Cosmos SDK | Registry, marketplace, governance |
| Smart Contracts | CosmWasm (permissioned) | HEB, Treasury, and Lifecycle automation |
| AI / Knowledge | GaiaAI + KOI MCP | Semantic verification, UX data ingestion |
| Frontend / UX | Regen.network + UX Convergence | User journey and data feedback flow |

---

## 🧩 **Contribution Flow**

All contributions follow this simple branch structure:  
(feature-branch) → pr/v0.2-meta → main  

1. Work on new features or fixes in a dedicated `feature/` branch.  
2. Merge completed work into `pr/v0.2-meta` for review and CI checks.  
3. After validation, merge `meta` into `main` for release and GaiaAI indexing.
