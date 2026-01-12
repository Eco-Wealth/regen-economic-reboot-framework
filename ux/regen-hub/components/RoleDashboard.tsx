import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useProjects } from '@/hooks/useProjects';
import { useRewards } from '@/hooks/useRewards';
import { useGovernanceActions } from '@/hooks/useGovernanceActions';
import { claimReward, formatRewardAmount, summarizeRewards } from '@/lib/rewardBridge';
import type { GovernanceAction, Project, Reward } from '@/lib/types';
import { MOCK_DATA_MODE } from '@/lib/env';

function SectionHeader(props: { title: string; href: string; actionLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">{props.title}</h3>
      <Link
        href={props.href}
        className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        {props.actionLabel}
      </Link>
    </div>
  );
}

function Pill(props: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' }) {
  const tone = props.tone ?? 'neutral';
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'good' && 'bg-emerald-50 text-emerald-800',
        tone === 'warn' && 'bg-amber-50 text-amber-800',
        tone === 'neutral' && 'bg-gray-100 text-gray-800',
      )}
    >
      {props.children}
    </span>
  );
}

function StatCard(props: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-600">{props.label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{props.value}</div>
      {props.hint ? <div className="mt-1 text-xs text-gray-500">{props.hint}</div> : null}
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{project.name}</p>
          {project.status ? <Pill tone={project.status === 'active' ? 'good' : 'neutral'}>{project.status}</Pill> : null}
          {project.impactCategory ? <Pill>{project.impactCategory}</Pill> : null}
        </div>
        {project.description ? <p className="mt-1 text-sm text-gray-600">{project.description}</p> : null}
      </div>
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Open
        </a>
      ) : null}
    </li>
  );
}

function RewardRow({ reward, onClaim, claiming }: { reward: Reward; onClaim: (id: string) => void; claiming: boolean }) {
  const claimable = reward.status === 'claimable' || reward.status === 'pending';
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{reward.label ?? 'Reward'}</p>
          {reward.status ? <Pill tone={claimable ? 'warn' : 'neutral'}>{reward.status}</Pill> : null}
        </div>
        <p className="mt-1 text-sm text-gray-600">{formatRewardAmount(reward)}</p>
      </div>
      {claimable ? (
        <button
          type="button"
          onClick={() => onClaim(reward.id)}
          disabled={claiming}
          className={clsx(
            'rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm',
            'hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            claiming && 'opacity-60',
          )}
        >
          Claim
        </button>
      ) : null}
    </li>
  );
}

function GovernanceRow({ action }: { action: GovernanceAction }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{action.title}</p>
          {action.status ? <Pill>{action.status}</Pill> : null}
          {action.type ? <Pill>{action.type}</Pill> : null}
        </div>
        {action.dueAt ? <p className="mt-1 text-sm text-gray-600">Due: {new Date(action.dueAt).toLocaleString()}</p> : null}
      </div>
      {action.url ? (
        <a
          href={action.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          View
        </a>
      ) : null}
    </li>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
      ))}
    </div>
  );
}

function InlineState(props: {
  tone?: 'neutral' | 'error';
  title: string;
  body?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const tone = props.tone ?? 'neutral';
  return (
    <div
      className={clsx(
        'rounded-md border p-3 text-sm',
        tone === 'error' && 'border-red-200 bg-red-50 text-red-700',
        tone === 'neutral' && 'border-gray-200 bg-gray-50 text-gray-700',
      )}
    >
      <div className="font-medium">{props.title}</div>
      {props.body ? <div className="mt-1 text-xs text-gray-600">{props.body}</div> : null}
      {props.onRetry ? (
        <button
          type="button"
          onClick={props.onRetry}
          className={clsx(
            'mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold',
            tone === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              : 'bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
          )}
        >
          {props.retryLabel ?? 'Retry'}
        </button>
      ) : null}
    </div>
  );
}

export const RoleDashboard = () => {
  const projects = useProjects();
  const rewards = useRewards();
  const actions = useGovernanceActions();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  const rewardSummary = useMemo(() => (rewards.data ? summarizeRewards(rewards.data) : null), [rewards.data]);
  const topProjects = (projects.data ?? []).slice(0, 3);
  const topRewards = (rewards.data?.rewards ?? []).filter((r) => r.status !== 'claimed').slice(0, 3);
  const topActions = (actions.data ?? []).slice(0, 3);

  const handleClaim = async (id: string) => {
    setClaimMsg(null);
    setClaimingId(id);
    try {
      const res = await claimReward(id);
      if (!res.ok) {
        setClaimMsg(res.message || 'Unable to claim reward.');
        return;
      }
      setClaimMsg('Reward claimed.');
      await rewards.reload();
    } catch (e) {
      setClaimMsg(e instanceof Error ? e.message : 'Unable to claim reward.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-gray-900">Your Regen Role</h2>
          <p className="text-sm text-gray-600">
            Live status across projects, rewards, and governance. Data loads from <span className="font-mono">/regen-api/*</span>.
          </p>
          {MOCK_DATA_MODE ? (
            <p className="text-xs text-amber-700">
              Offline mock mode is enabled. Set <span className="font-mono">NEXT_PUBLIC_MOCK_DATA_MODE=0</span> to switch back to live APIs.
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Active projects"
            value={projects.loading ? '…' : String((projects.data ?? []).length)}
            hint={
              projects.error
                ? 'Failed to load'
                : !projects.loading && (projects.data ?? []).length === 0
                  ? 'No results'
                  : undefined
            }
          />
          <StatCard
            label="Claimable rewards"
            value={rewardSummary ? rewardSummary.claimable : rewards.loading ? '…' : '0'}
            hint={
              rewards.error
                ? 'Failed to load'
                : !rewards.loading && (rewards.data?.rewards ?? []).length === 0
                  ? 'No results'
                  : undefined
            }
          />
          <StatCard
            label="Open governance actions"
            value={actions.loading ? '…' : String((actions.data ?? []).length)}
            hint={
              actions.error
                ? 'Failed to load'
                : !actions.loading && (actions.data ?? []).length === 0
                  ? 'No results'
                  : undefined
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <SectionHeader title="Projects" href="/projects" actionLabel="View all" />
          <div className="mt-3">
            {projects.loading ? (
              <SkeletonList />
            ) : projects.error ? (
              <InlineState
                tone="error"
                title="Projects failed to load"
                body="Check REGEN_API_BASE_URL and that /regen-api/projects is reachable from the browser."
                onRetry={projects.reload}
              />
            ) : topProjects.length === 0 ? (
              <InlineState
                title="No projects returned"
                body={
                  MOCK_DATA_MODE
                    ? 'Mock mode is on, but the mock project list is empty (unexpected).'
                    : 'The API returned an empty list. If this is unexpected, verify your staging/testnet endpoint or enable mock mode for offline testing.'
                }
                onRetry={projects.reload}
                retryLabel="Refresh"
              />
            ) : (
              <ul role="list" className="divide-y divide-gray-100">
                {topProjects.map((p) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <SectionHeader title="Rewards" href="/projects" actionLabel="Manage" />
          <div className="mt-3">
            {rewards.loading ? (
              <SkeletonList />
            ) : rewards.error ? (
              <InlineState
                tone="error"
                title="Rewards failed to load"
                body="Check REGEN_API_BASE_URL and that /regen-api/rewards is reachable."
                onRetry={rewards.reload}
              />
            ) : topRewards.length === 0 ? (
              <InlineState
                title="No pending or claimable rewards"
                body={
                  MOCK_DATA_MODE
                    ? 'Mock mode is on. Claimable rewards will appear here once present in the mock store.'
                    : 'The API returned no claimable rewards. If this is unexpected, confirm your rewards engine is running and returning data.'
                }
                onRetry={rewards.reload}
                retryLabel="Refresh"
              />
            ) : (
              <ul role="list" className="divide-y divide-gray-100">
                {topRewards.map((r) => (
                  <RewardRow key={r.id} reward={r} onClaim={handleClaim} claiming={claimingId === r.id} />
                ))}
              </ul>
            )}
            {claimMsg ? <p className="mt-3 text-sm text-gray-700">{claimMsg}</p> : null}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <SectionHeader title="Governance" href="/governance" actionLabel="See actions" />
          <div className="mt-3">
            {actions.loading ? (
              <SkeletonList />
            ) : actions.error ? (
              <InlineState
                tone="error"
                title="Governance actions failed to load"
                body="Check REGEN_API_BASE_URL and that /regen-api/governance/actions is reachable."
                onRetry={actions.reload}
              />
            ) : topActions.length === 0 ? (
              <InlineState
                title="No governance actions returned"
                body={
                  MOCK_DATA_MODE
                    ? 'Mock mode is on, but the mock governance list is empty (unexpected).'
                    : 'The API returned an empty list. If this is unexpected, verify your governance aggregation endpoint.'
                }
                onRetry={actions.reload}
                retryLabel="Refresh"
              />
            ) : (
              <ul role="list" className="divide-y divide-gray-100">
                {topActions.map((a) => (
                  <GovernanceRow key={a.id} action={a} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
