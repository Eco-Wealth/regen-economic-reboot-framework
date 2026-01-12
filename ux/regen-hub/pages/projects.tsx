import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Layout } from '@/components/Layout';
import { useProjects } from '@/hooks/useProjects';
import { useRewards } from '@/hooks/useRewards';
import { claimReward, formatRewardAmount } from '@/lib/rewardBridge';
import type { Project, Reward } from '@/lib/types';

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {project.status ? <span className="rounded-full bg-gray-100 px-2 py-0.5">{project.status}</span> : null}
            {project.impactCategory ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">{project.impactCategory}</span>
            ) : null}
          </div>
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
      </div>
      {project.description ? <p className="mt-3 text-sm text-gray-700">{project.description}</p> : null}
    </div>
  );
}

function RewardItem({ reward, onClaim, claiming }: { reward: Reward; onClaim: (id: string) => void; claiming: boolean }) {
  const claimable = reward.status === 'claimable' || reward.status === 'pending';
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{reward.label ?? 'Reward'}</p>
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
      ) : (
        <span className="text-xs text-gray-500">{reward.status ?? ''}</span>
      )}
    </li>
  );
}

export default function ProjectsPage() {
  const projects = useProjects();
  const rewards = useRewards();
  const [q, setQ] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const all = projects.data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter((p) => (p.name ?? '').toLowerCase().includes(term) || (p.impactCategory ?? '').toLowerCase().includes(term));
  }, [projects.data, q]);

  const claimableRewards = useMemo(() => {
    const all = rewards.data?.rewards ?? [];
    return all.filter((r) => r.status === 'pending' || r.status === 'claimable');
  }, [rewards.data]);

  const onClaim = async (id: string) => {
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
    <Layout title="Projects" description="Projects and reward management.">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-600">Data from <span className="font-mono">/regen-api/projects</span> and <span className="font-mono">/regen-api/rewards</span>.</p>
          </div>

          <div className="w-full sm:max-w-sm">
            <label className="block text-xs font-medium text-gray-700" htmlFor="project-search">
              Search
            </label>
            <input
              id="project-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name or impact…"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2">
            {projects.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : projects.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load projects.
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                No projects found.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </section>

          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Claimable rewards</h2>
                <Link href="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                  Dashboard
                </Link>
              </div>
              <div className="mt-3">
                {rewards.loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
                    ))}
                  </div>
                ) : rewards.error ? (
                  <p className="text-sm text-red-600">Failed to load rewards.</p>
                ) : claimableRewards.length === 0 ? (
                  <p className="text-sm text-gray-600">No rewards to claim.</p>
                ) : (
                  <ul role="list" className="divide-y divide-gray-100">
                    {claimableRewards.slice(0, 6).map((r) => (
                      <RewardItem key={r.id} reward={r} onClaim={onClaim} claiming={claimingId === r.id} />
                    ))}
                  </ul>
                )}

                {claimMsg ? <p className="mt-3 text-sm text-gray-700">{claimMsg}</p> : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
