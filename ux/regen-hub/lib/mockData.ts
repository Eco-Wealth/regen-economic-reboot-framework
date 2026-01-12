import type { GovernanceAction, KoiChatRequest, KoiChatResponse, Project, Reward, RewardsResponse } from '@/lib/types';

type Id = string;

const now = Date.now();
const isoDaysAgo = (daysAgo: number) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

const baseProjects: Project[] = [
  {
    id: 'proj-green-corridor',
    name: 'Green Corridor Retrofit',
    status: 'active',
    role: 'builder',
    description: 'Lightweight retrofit project to validate permitting → build flow.',
    impactCategory: 'Built Environment',
    updatedAt: isoDaysAgo(2),
    url: 'https://example.com/projects/proj-green-corridor',
  },
  {
    id: 'proj-soil-mrv',
    name: 'Soil MRV Pilot',
    status: 'active',
    role: 'validator',
    description: 'MRV pilot on regen testnet with sampling + verification checkpoints.',
    impactCategory: 'Soil & Carbon',
    updatedAt: isoDaysAgo(4),
    url: 'https://example.com/projects/proj-soil-mrv',
  },
  {
    id: 'proj-biochar-hub',
    name: 'Biochar Hub Ops',
    status: 'draft',
    role: 'operator',
    description: 'Operational blueprint for local biochar collection and distribution.',
    impactCategory: 'Circular Materials',
    updatedAt: isoDaysAgo(1),
    url: 'https://example.com/projects/proj-biochar-hub',
  },
  {
    id: 'proj-governance-signal',
    name: 'Governance Signal Index',
    status: 'active',
    role: 'member',
    description: 'UX-driven governance participation metrics and signal aggregation.',
    impactCategory: 'Governance',
    updatedAt: isoDaysAgo(6),
    url: 'https://example.com/projects/proj-governance-signal',
  },
];

const initialRewards: Reward[] = [
  {
    id: 'rwd-001',
    projectId: 'proj-green-corridor',
    label: 'Milestone: Permitting Approved',
    amount: 120,
    symbol: 'REGEN',
    status: 'claimable',
    earnedAt: isoDaysAgo(7),
  },
  {
    id: 'rwd-002',
    projectId: 'proj-soil-mrv',
    label: 'MRV Sample Batch #4',
    amount: 45,
    symbol: 'REGEN',
    status: 'pending',
    earnedAt: isoDaysAgo(3),
  },
  {
    id: 'rwd-003',
    projectId: 'proj-governance-signal',
    label: 'Participation: Vote Cast',
    amount: 10,
    symbol: 'REGEN',
    status: 'claimed',
    earnedAt: isoDaysAgo(12),
  },
];

let rewardsStore: Reward[] = [...initialRewards];

const baseGovernanceActions: GovernanceAction[] = [
  {
    id: 'gov-101',
    title: 'WS0 Parameters: HEB Coupon Rate',
    status: 'open',
    type: 'proposal',
    dueAt: isoDaysAgo(-3),
    url: 'https://example.com/governance/gov-101',
  },
  {
    id: 'gov-102',
    title: 'WS1: Validator Safety Requirements',
    status: 'open',
    type: 'vote',
    dueAt: isoDaysAgo(-1),
    url: 'https://example.com/governance/gov-102',
  },
  {
    id: 'gov-099',
    title: 'WS4: Publish Transparency Dashboard v0.2',
    status: 'closed',
    type: 'proposal',
    dueAt: isoDaysAgo(5),
    url: 'https://example.com/governance/gov-099',
  },
];

function summarizeRewards(rewards: Reward[]): RewardsResponse {
  const claimable = rewards.filter((r) => r.status === 'claimable');
  const pending = rewards.filter((r) => r.status === 'pending');
  const claimed = rewards.filter((r) => r.status === 'claimed');

  return {
    rewards,
    totalEarned: rewards.reduce((sum, r) => sum + r.amount, 0),
    pending: pending.reduce((sum, r) => sum + r.amount, 0),
    claimable: claimable.reduce((sum, r) => sum + r.amount, 0),
    claimed: claimed.reduce((sum, r) => sum + r.amount, 0),
  };
}

export const mockData = {
  getProjects(args: { role?: string } = {}): Project[] {
    if (!args.role) return [...baseProjects];
    return baseProjects.filter((p) => p.role === args.role);
  },

  getRewards(args: { projectId?: string } = {}): RewardsResponse {
    const filtered = args.projectId
      ? rewardsStore.filter((r) => r.projectId === args.projectId)
      : [...rewardsStore];
    return summarizeRewards(filtered);
  },

  claimReward(rewardId: Id): { ok: true; reward?: Reward } {
    rewardsStore = rewardsStore.map((r) => (r.id === rewardId ? { ...r, status: 'claimed' } : r));
    const reward = rewardsStore.find((r) => r.id === rewardId);
    return { ok: true, ...(reward ? { reward } : {}) };
  },

  getGovernanceActions(): GovernanceAction[] {
    return [...baseGovernanceActions];
  },

  koiChat(req: KoiChatRequest): KoiChatResponse {
    const lastUser = [...req.messages].reverse().find((m) => m.role === 'user')?.content?.trim();

    const contextJson = req.context ? JSON.stringify(req.context) : '';
    const contextHint = contextJson
      ? `\n\nContext received (${Math.min(contextJson.length, 180)} chars): ${contextJson.slice(0, 180)}${
          contextJson.length > 180 ? '…' : ''
        }`
      : '';

    const reply =
      `Mock GaiaAI Mentor (offline mode).\n\n` +
      (lastUser
        ? `You asked: “${lastUser}”.\n\nSuggested next step: pick one project and define a measurable outcome for the next 7 days.`
        : `Ask about projects, rewards, or governance actions.`) +
      contextHint;

    return { reply };
  },

  reset(): void {
    rewardsStore = [...initialRewards];
  },
} as const;
