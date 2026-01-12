export type ProjectStatus = 'active' | 'paused' | 'completed' | 'draft' | string;

export interface Project {
  id: string;
  name: string;
  status?: ProjectStatus;
  role?: string;
  description?: string;
  impactCategory?: string;
  updatedAt?: string;
  url?: string;
}

export type RewardStatus = 'pending' | 'claimable' | 'claimed' | string;

export interface Reward {
  id: string;
  label?: string;
  amount: number;
  symbol?: string;
  status?: RewardStatus;
  projectId?: string;
  earnedAt?: string;
}

export interface RewardsResponse {
  rewards?: Reward[];
  totalEarned?: number;
  pending?: number;
  claimable?: number;
  claimed?: number;
}

export type GovernanceActionStatus = 'open' | 'voting' | 'passed' | 'rejected' | 'executed' | string;

export interface GovernanceAction {
  id: string;
  title: string;
  status?: GovernanceActionStatus;
  type?: string;
  dueAt?: string;
  url?: string;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  createdAt?: number;
  /**
   * Used by the Mentor UI to indicate a message is still being streamed/assembled.
   */
  partial?: boolean;
}

export interface KoiChatRequest {
  messages: ChatMessage[];
  context?: Record<string, unknown>;
}

export interface KoiChatResponse {
  reply: string;
  meta?: Record<string, unknown>;
}
