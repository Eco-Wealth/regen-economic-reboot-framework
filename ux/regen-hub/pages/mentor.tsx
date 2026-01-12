import React, { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { MentorPanel } from '@/components/MentorPanel';
import { useProjects } from '@/hooks/useProjects';
import { useRewards } from '@/hooks/useRewards';
import { useGovernanceActions } from '@/hooks/useGovernanceActions';
import { summarizeRewards } from '@/lib/rewardBridge';

export default function MentorPage() {
  const projects = useProjects();
  const rewards = useRewards();
  const actions = useGovernanceActions();

  const context = useMemo(() => {
    const projectList = (projects.data ?? []).slice(0, 10);
    const rewardSummary = rewards.data ? summarizeRewards(rewards.data) : null;
    const governance = (actions.data ?? []).slice(0, 10);

    return {
      projects: projectList,
      rewards: rewardSummary,
      governance,
    };
  }, [projects.data, rewards.data, actions.data]);

  return (
    <Layout title="Mentor" description="GaiaAI mentor chat, enriched with your current hub context.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h1 className="text-lg font-semibold text-gray-900">Mentor</h1>
            <p className="mt-1 text-sm text-gray-600">
              This chat uses <span className="font-mono">/api/koi/chat</span>. It also sends a compact context snapshot
              (projects, reward totals, governance queue) for better guidance.
            </p>
          </div>

          <div className="mt-4">
            <MentorPanel context={context} />
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">Context being sent</h2>
            <p className="mt-1 text-sm text-gray-600">
              Use this to confirm the mentor has what it needs. If these are empty, configure <span className="font-mono">REGEN_API_BASE_URL</span>
              or ensure <span className="font-mono">/regen-api/*</span> is available.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Projects loaded</dt>
                <dd className="font-medium text-gray-900">{projects.loading ? '…' : (projects.data ?? []).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Rewards loaded</dt>
                <dd className="font-medium text-gray-900">{rewards.loading ? '…' : (rewards.data?.rewards ?? []).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Governance actions</dt>
                <dd className="font-medium text-gray-900">{actions.loading ? '…' : (actions.data ?? []).length}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
