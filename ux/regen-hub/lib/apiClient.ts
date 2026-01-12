import { GovernanceAction, KoiChatRequest, KoiChatResponse, Project, Reward, RewardsResponse } from '@/lib/types';
import { MOCK_DATA_MODE } from '@/lib/env';
import { mockData } from '@/lib/mockData';

export class ApiError extends Error {
  status: number;
  url: string;
  details?: unknown;

  constructor(message: string, args: { status: number; url: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = args.status;
    this.url = args.url;
    this.details = args.details;
  }
}

type JsonRecord = Record<string, unknown>;

function isJsonResponse(res: Response): boolean {
  const ct = res.headers.get('content-type');
  return Boolean(ct && ct.includes('application/json'));
}

async function parseResponseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  if (isJsonResponse(res)) return res.json();
  return res.text();
}

function withTimeout(init: RequestInit, timeoutMs: number): { init: RequestInit; cleanup: () => void } {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return {
    init: { ...init, signal: controller.signal },
    cleanup: () => clearTimeout(timeout),
  };
}

export async function requestJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const timeoutMs = init.timeoutMs ?? 15_000;
  const { init: initWithTimeout, cleanup } = withTimeout(init, timeoutMs);
  try {
    const res = await fetch(url, {
      ...initWithTimeout,
      headers: {
        Accept: 'application/json',
        ...(initWithTimeout.headers ?? {}),
      },
      // Session cookies (if used by Regen Hub auth)
      credentials: 'include',
    });

    const body = await parseResponseBody(res);
    if (!res.ok) {
      throw new ApiError(`Request failed (${res.status})`, { status: res.status, url, details: body });
    }
    return body as T;
  } finally {
    cleanup();
  }
}

function normalizeArray<T>(payload: unknown, key: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any)[key])) return (payload as any)[key] as T[];
  return [];
}

function normalizeNumber(payload: unknown, key: string): number | undefined {
  if (payload && typeof payload === 'object') {
    const v = (payload as any)[key];
    if (typeof v === 'number') return v;
  }
  return undefined;
}

/**
 * Regen API (proxied via Next rewrite): client calls `/regen-api/*`.
 * Configure server env: REGEN_API_BASE_URL=https://<regen-api-host>
 */
export const regenApi = {
  async getProjects(args: { role?: string } = {}): Promise<Project[]> {
    if (MOCK_DATA_MODE) return mockData.getProjects(args);
    const qs = args.role ? `?role=${encodeURIComponent(args.role)}` : '';
    const payload = await requestJson<unknown>(`/regen-api/projects${qs}`);
    return normalizeArray<Project>(payload, 'projects');
  },

  async getRewards(args: { projectId?: string } = {}): Promise<RewardsResponse> {
    if (MOCK_DATA_MODE) return mockData.getRewards(args);
    const qs = args.projectId ? `?projectId=${encodeURIComponent(args.projectId)}` : '';
    const payload = await requestJson<unknown>(`/regen-api/rewards${qs}`);

    const rewards = normalizeArray<Reward>(payload, 'rewards');
    return {
      rewards,
      totalEarned: normalizeNumber(payload, 'totalEarned'),
      pending: normalizeNumber(payload, 'pending'),
      claimable: normalizeNumber(payload, 'claimable'),
      claimed: normalizeNumber(payload, 'claimed'),
    };
  },

  async claimReward(rewardId: string): Promise<{ ok: true } | { ok: false; message?: string }> {
    if (MOCK_DATA_MODE) {
      mockData.claimReward(rewardId);
      return { ok: true };
    }
    const payload = await requestJson<unknown>(`/regen-api/rewards/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });

    if (payload && typeof payload === 'object' && (payload as any).ok === false) {
      return { ok: false, message: String((payload as any).message ?? '') };
    }
    return { ok: true };
  },

  async getGovernanceActions(): Promise<GovernanceAction[]> {
    if (MOCK_DATA_MODE) return mockData.getGovernanceActions();
    const payload = await requestJson<unknown>(`/regen-api/governance/actions`);
    return normalizeArray<GovernanceAction>(payload, 'actions');
  },
};

/**
 * KOI/Gaia AI endpoints live under `/api/koi/*` (Next API routes).
 */
export const koiApi = {
  async chat(req: KoiChatRequest): Promise<KoiChatResponse> {
    if (MOCK_DATA_MODE) return mockData.koiChat(req);
    return requestJson<KoiChatResponse>(`/api/koi/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      timeoutMs: 30_000,
    });
  },
};
