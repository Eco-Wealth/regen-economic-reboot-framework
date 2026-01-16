import Head from "next/head";
import Link from "next/link";
import { ROLE_FLOWS, TIERS, RoleTier } from "../../lib/uxConvergenceMap";

function groupByTier() {
  const grouped: Record<RoleTier, typeof ROLE_FLOWS> = {
    Creation: [],
    Circulation: [],
    Governance: [],
    Intelligence: [],
    Culture: [],
    Coordination: [],
  };
  for (const role of ROLE_FLOWS) grouped[role.tier].push(role);
  return grouped;
}

export default function RolesIndexPage() {
  const grouped = groupByTier();

  return (
    <>
      <Head>
        <title>Roles • Regen Hub</title>
      </Head>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Regen Roles Map</h1>
          <p className="mt-2 text-sm text-slate-600">
            Education layer: roles, flows, data entry, and verification signals. Each role page links to relevant Hub
            routes (where available) and external reference UIs.
          </p>
        </div>

        <div className="space-y-10">
          {TIERS.map((tier) => (
            <section key={tier}>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-lg font-semibold">{tier}</h2>
                <span className="text-xs text-slate-500">{grouped[tier].length} roles</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {grouped[tier].map((role) => (
                  <Link
                    key={role.id}
                    href={`/roles/${role.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold">{role.name}</div>
                        <div className="mt-1 text-sm text-slate-600">{role.objective}</div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-slate-500">~{role.clickCountApprox} clicks</div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      Start: <span className="break-all">{role.startUrl}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
