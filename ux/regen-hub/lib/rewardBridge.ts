import { regenApi } from '@/lib/apiClient';
import type { Reward, RewardsResponse } from '@/lib/types';

export interface RewardSummary {
  totalEarned: number;
  pending: number;
  claimable: number;
  claimed: number;
}

function safeNumber(n: unknown, fallback = 0): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

export function summarizeRewards(r: RewardsResponse): RewardSummary {
  const totalEarned = safeNumber(r.totalEarned);
  const pending = safeNumber(r.pending);
  const claimable = safeNumber(r.claimable);
  const claimed = safeNumber(r.claimed);

  // If the API does not provide aggregates, derive them from the rewards list.
  if (!r.totalEarned && Array.isArray(r.rewards) && r.rewards.length > 0) {
    const derivedTotal = r.rewards.reduce((acc, cur) => acc + safeNumber(cur.amount), 0);
    return {
      totalEarned: derivedTotal,
      pending: pending || r.rewards.filter((x) => x.status === 'pending').reduce((a, c) => a + safeNumber(c.amount), 0),
      claimable:
        claimable || r.rewards.filter((x) => x.status === 'claimable').reduce((a, c) => a + safeNumber(c.amount), 0),
      claimed: claimed || r.rewards.filter((x) => x.status === 'claimed').reduce((a, c) => a + safeNumber(c.amount), 0),
    };
  }

  return { totalEarned, pending, claimable, claimed };
}

/**
 * Pull rewards from `/regen-api/rewards`.
 */
export async function fetchRewards(args: { projectId?: string } = {}): Promise<RewardsResponse> {
  return regenApi.getRewards(args);
}

/**
 * Bridge/claim a reward via `/regen-api/rewards/claim`.
 */
export async function claimReward(rewardId: string): Promise<{ ok: true } | { ok: false; message?: string }> {
  return regenApi.claimReward(rewardId);
}

export function formatRewardAmount(r: Reward): string {
  const symbol = r.symbol ? ` ${r.symbol}` : '';
  return `${r.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}${symbol}`;
}
