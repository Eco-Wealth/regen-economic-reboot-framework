import React, { useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useGovernanceActions } from '@/hooks/useGovernanceActions';
import clsx from 'clsx';

function badgeTone(status?: string) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('open') || s.includes('voting')) return 'warn';
  if (s.includes('passed') || s.includes('executed')) return 'good';
  if (s.includes('rejected') || s.includes('failed')) return 'neutral';
  return 'neutral';
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'good' && 'bg-emerald-50 text-emerald-800',
        tone === 'warn' && 'bg-amber-50 text-amber-800',
        tone === 'neutral' && 'bg-gray-100 text-gray-800',
      )}
    >
      {children}
    </span>
  );
}

export default function GovernancePage() {
  const actions = useGovernanceActions();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const all = actions.data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter((a) => (a.title ?? '').toLowerCase().includes(term) || (a.type ?? '').toLowerCase().includes(term));
  }, [actions.data, q]);

  return (
    <Layout title="Governance" description="Governance actions and voting queue.">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Governance</h1>
            <p className="mt-1 text-sm text-gray-600">Data from <span className="font-mono">/regen-api/governance/actions</span>.</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <label className="block text-xs font-medium text-gray-700" htmlFor="gov-search">
              Search
            </label>
            <input
              id="gov-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by title or type…"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Due
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {actions.loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-4 w-64 rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-20 rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-28 rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="ml-auto h-4 w-12 rounded bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : actions.error ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-sm text-red-700">
                      Failed to load governance actions.
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-sm text-gray-700">
                      No governance actions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{a.title}</div>
                        {a.type ? <div className="mt-1 text-xs text-gray-600">{a.type}</div> : null}
                      </td>
                      <td className="px-4 py-4">
                        <Pill tone={badgeTone(a.status)}>{a.status ?? 'unknown'}</Pill>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {a.dueAt ? new Date(a.dueAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {a.url ? (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
