export type RoleTier =
  | "Creation"
  | "Circulation"
  | "Governance"
  | "Intelligence"
  | "Culture"
  | "Coordination";

export type RoleId =
  | "methodology-dev"
  | "land-steward"
  | "credit-issuer"
  | "buyer-retirer"
  | "basket-curator"
  | "voter"
  | "validator"
  | "researcher"
  | "ai-dev"
  | "storyteller"
  | "ux-builder"
  | "steward";

export type RoleFlow = {
  id: RoleId;
  tier: RoleTier;
  name: string;
  objective: string;
  startUrl: string;
  clickCountApprox: number;
  steps: string[];
  dataEntry: string;
  verification: string;
  output: string;

  hubRoutes?: Array<{ label: string; href: string }>;
  externalRefs?: Array<{ label: string; href: string }>;
};

export const ROLE_FLOWS: RoleFlow[] = [
  {
    id: "methodology-dev",
    tier: "Creation",
    name: "Methodology Developer",
    objective: "Propose and iterate new credit methodologies.",
    startUrl: "https://regen.network/develop/methodology",
    clickCountApprox: 6,
    steps: [
      "Log in with Regen ID",
      "Click “Propose Methodology”",
      "Fill form (name, description, metrics)",
      "Upload JSON-LD draft",
      "Preview",
      "Submit for governance",
    ],
    dataEntry: "Methodology title, metrics, document upload, optional MRV oracle references.",
    verification: "Proposal hash & deposit registered on-chain.",
    output: "New methodology proposal.",
    hubRoutes: [{ label: "Governance", href: "/governance" }],
    externalRefs: [{ label: "Regen methodology page", href: "https://regen.network/develop/methodology" }],
  },
  {
    id: "land-steward",
    tier: "Creation",
    name: "Land Steward / Project Originator",
    objective: "Register and verify regenerative projects.",
    startUrl: "https://app.regen.network/projects/new",
    clickCountApprox: 8,
    steps: [
      "Connect wallet",
      "Choose credit class",
      "Enter project name + region",
      "Upload docs + images",
      "Select MRV data source",
      "Submit",
      "Confirm registration",
      "View project dashboard",
    ],
    dataEntry: "Project metadata (title, location, area, methodology), MRV provider, contact.",
    verification: "On-chain project ID created (project registration).",
    output: "Project live for issuance and MRV verification.",
    hubRoutes: [{ label: "Projects", href: "/projects" }],
    externalRefs: [{ label: "Regen projects (new)", href: "https://app.regen.network/projects/new" }],
  },
  {
    id: "credit-issuer",
    tier: "Circulation",
    name: "Credit Issuer",
    objective: "Convert verified outcomes into credits (issue batches).",
    startUrl: "https://app.regen.network/issuance",
    clickCountApprox: 5,
    steps: ["Log in", "Choose project", "Define credit batch", "Verify MRV", "Issue credits"],
    dataEntry: "Batch quantity, start/end date, MRV upload.",
    verification: "Batch minted on-chain.",
    output: "Tradable credits.",
    hubRoutes: [{ label: "Projects", href: "/projects" }],
    externalRefs: [{ label: "Regen issuance", href: "https://app.regen.network/issuance" }],
  },
  {
    id: "buyer-retirer",
    tier: "Circulation",
    name: "Buyer / Retirer",
    objective: "Purchase and retire ecological credits.",
    startUrl: "https://app.regen.network/marketplace",
    clickCountApprox: 6,
    steps: ["Browse marketplace", "Filter", "Buy", "Confirm transaction", "Retire", "Download certificate"],
    dataEntry: "None (mostly read-only + signature).",
    verification: "On-chain retirement record created.",
    output: "Retirement proof / certificate.",
    hubRoutes: [{ label: "Dashboard", href: "/dashboard" }],
    externalRefs: [{ label: "Regen marketplace", href: "https://app.regen.network/marketplace" }],
  },
  {
    id: "basket-curator",
    tier: "Circulation",
    name: "Market Maker / Basket Curator",
    objective: "Pool credits into baskets and mint basket tokens.",
    startUrl: "https://app.regen.network/baskets",
    clickCountApprox: 5,
    steps: ["Log in", "Choose basket", "Add eligible batches", "Confirm pool", "Mint basket tokens"],
    dataEntry: "Basket criteria and eligible batch IDs.",
    verification: "Basket token created.",
    output: "New fungible basket token.",
    externalRefs: [{ label: "Regen baskets", href: "https://app.regen.network/baskets" }],
  },
  {
    id: "voter",
    tier: "Governance",
    name: "Token Holder / Voter",
    objective: "Vote or delegate on proposals.",
    startUrl: "https://app.regen.network/governance",
    clickCountApprox: 5,
    steps: ["Log in", "View proposals", "Open proposal", "Cast vote", "Confirm transaction"],
    dataEntry: "Vote choice.",
    verification: "Vote recorded on-chain.",
    output: "Voting record.",
    hubRoutes: [{ label: "Governance", href: "/governance" }],
    externalRefs: [{ label: "Regen governance", href: "https://app.regen.network/governance" }],
  },
  {
    id: "validator",
    tier: "Governance",
    name: "Validator / Node Operator",
    objective: "Secure the network by running a validator.",
    startUrl: "https://regen.network/validators",
    clickCountApprox: 6,
    steps: ["Log in", "Register validator", "Delegate stake", "Configure node", "Monitor uptime", "Claim rewards"],
    dataEntry: "Validator metadata (moniker, website, description).",
    verification: "Validator/distribution state visible via on-chain queries.",
    output: "Active validator node.",
    externalRefs: [{ label: "Regen validators", href: "https://regen.network/validators" }],
  },
  {
    id: "researcher",
    tier: "Intelligence",
    name: "Researcher / Analyst",
    objective: "Query registry and ledger data for insights.",
    startUrl: "https://registry.regen.network/search",
    clickCountApprox: 7,
    steps: ["Open registry", "Enter query", "View results", "Export", "Analyze", "Publish findings", "Share"],
    dataEntry: "Search query + filters.",
    verification: "Citation trace (KOI/GaiaAI) for provenance.",
    output: "Published insight or visualization.",
    hubRoutes: [{ label: "Mentor", href: "/mentor" }],
    externalRefs: [{ label: "Registry search", href: "https://registry.regen.network/search" }],
  },
  {
    id: "ai-dev",
    tier: "Intelligence",
    name: "AI Collaborator / Developer",
    objective: "Build AI integrations using GaiaAI/KOI + Regen APIs.",
    startUrl: "https://gaiaai.xyz",
    clickCountApprox: 8,
    steps: [
      "Log in",
      "Get API key",
      "Build query",
      "Test responses",
      "Connect Regen APIs",
      "Deploy",
      "Test",
      "Monitor",
    ],
    dataEntry: "API keys, query JSON, schema IDs.",
    verification: "API call receipts / traces.",
    output: "Working AI integration.",
    hubRoutes: [{ label: "Mentor", href: "/mentor" }],
    externalRefs: [{ label: "GaiaAI", href: "https://gaiaai.xyz" }],
  },
  {
    id: "storyteller",
    tier: "Culture",
    name: "Storyteller / Educator",
    objective: "Share narratives and teach regeneration.",
    startUrl: "https://forum.regen.network",
    clickCountApprox: 4,
    steps: ["Log in", "Create post", "Upload media", "Publish"],
    dataEntry: "Post title, text, media uploads.",
    verification: "Forum moderation + indexing (KOI).",
    output: "Indexed narrative post.",
    externalRefs: [{ label: "Regen forum", href: "https://forum.regen.network" }],
  },
  {
    id: "ux-builder",
    tier: "Culture",
    name: "UX Designer / Builder",
    objective: "Improve interfaces and workflows via shipped UX changes.",
    startUrl: "https://github.com/regen-network/ux-convergence",
    clickCountApprox: 7,
    steps: ["Open repo", "View issue", "Fork", "Edit", "Commit", "Open PR", "Merge"],
    dataEntry: "UX docs, designs, feedback text.",
    verification: "PR review + merge history.",
    output: "Merged UX improvement.",
    externalRefs: [{ label: "UX convergence repo", href: "https://github.com/regen-network/ux-convergence" }],
  },
  {
    id: "steward",
    tier: "Coordination",
    name: "Ecosystem Steward / Coordinator",
    objective: "Maintain coherence across roles via synthesis and coordination.",
    startUrl: "https://forum.regen.network/categories/governance",
    clickCountApprox: 6,
    steps: ["Review threads", "Summarize updates", "Post synthesis", "Tag teams", "Log links", "Close thread"],
    dataEntry: "Summary text, thread links, metadata.",
    verification: "Indexing + governance sync references.",
    output: "Cohesive cross-role communication.",
    externalRefs: [{ label: "Governance category", href: "https://forum.regen.network/categories/governance" }],
  },
];

export function getRoleById(id: string | string[] | undefined): RoleFlow | undefined {
  const key = Array.isArray(id) ? id[0] : id;
  if (!key) return undefined;
  return ROLE_FLOWS.find((r) => r.id === key);
}

export const TIERS: RoleTier[] = [
  "Creation",
  "Circulation",
  "Governance",
  "Intelligence",
  "Culture",
  "Coordination",
];
