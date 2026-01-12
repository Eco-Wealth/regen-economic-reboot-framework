import { fetchRewards } from '@/lib/rewardBridge';
import type { RewardsResponse } from '@/lib/types';
import { useAsync } from '@/hooks/useAsync';

export function useRewards(args: { projectId?: string } = {}) {
  return useAsync<RewardsResponse>(() => fetchRewards(args), [args.projectId]);
}
