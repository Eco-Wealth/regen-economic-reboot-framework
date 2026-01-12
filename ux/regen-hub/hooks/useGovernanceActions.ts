import { regenApi } from '@/lib/apiClient';
import type { GovernanceAction } from '@/lib/types';
import { useAsync } from '@/hooks/useAsync';

export function useGovernanceActions() {
  return useAsync<GovernanceAction[]>(() => regenApi.getGovernanceActions(), []);
}
