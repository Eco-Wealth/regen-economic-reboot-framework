import { regenApi } from '@/lib/apiClient';
import type { Project } from '@/lib/types';
import { useAsync } from '@/hooks/useAsync';

export function useProjects(args: { role?: string } = {}) {
  return useAsync<Project[]>(() => regenApi.getProjects(args), [args.role]);
}
