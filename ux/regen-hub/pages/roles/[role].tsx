import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getRoleById } from "../../lib/uxConvergenceMap";

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-blue-700 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-600"
    >
      {label}
    </a>
  );
}

export default function RoleDetailPage() {
  const router = useRouter();
  const role = getRoleById(router.query.role);

  return (
    <>
      <Head>
        <title>{role ? `${role.name} • Regen Hub` : "Role • Regen Hub"}</title>
      </Head>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <Link href="/roles" className="text-sm text-slate-600 underline underline-offset-4">
            ← Back to Roles
          </Link>
        </div>

        {!role ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h1 className="text-xl font-semibold">Role not found</h1>
            <p className="mt-2 text-sm text-slate-600">Check the URL or return to the roles list.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">{role.name}</h1>
                  <p className="mt-2 text-sm text-slate-600">{role.objective}</p>
                </div>
                <div className="text-sm text-slate-500">~{role.clickCountApprox} clicks</div>
              </div>

              <div className="mt-4 text-sm">
                <span className="text-slate-500">Start URL: </span>
                <ExternalLink href={role.startUrl} label={role.startUrl} />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-medium">Base-first execution model</div>
                <div className="mt-1">
                  The Hub teaches the flow. When an action is automated, the user signs an intent on Base; an executor
                  performs the corresponding Regen Ledger transaction and returns a receipt to the Hub.
                </div>
              </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Steps</h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  {role.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Signals</h2>
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data entry</div>
                    <div className="mt-1 text-slate-700">{role.dataEntry}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification</div>
                    <div className="mt-1 text-slate-700">{role.verification}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Output</div>
                    <div className="mt-1 text-slate-700">{role.output}</div>
                  </div>
                </div>
              </div>
            </section>

            {(role.hubRoutes?.length || role.externalRefs?.length) ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Go do the work</h2>
                <p className="mt-2 text-sm text-slate-600">Relevant next clicks inside the Hub or external reference UIs.</p>

                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hub routes</div>
                    <div className="mt-2 space-y-2">
                      {(role.hubRoutes ?? []).length ? (
                        role.hubRoutes!.map((r) => (
                          <Link
                            key={r.href}
                            href={r.href}
                            className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 hover:bg-slate-100"
                          >
                            {r.label} <span className="text-slate-500">({r.href})</span>
                          </Link>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">None yet.</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">External refs</div>
                    <div className="mt-2 space-y-2">
                      {(role.externalRefs ?? []).length ? (
                        role.externalRefs!.map((r) => (
                          <div key={r.href} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                            <ExternalLink href={r.href} label={r.label} />
                            <div className="mt-1 break-all text-xs text-slate-500">{r.href}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">None yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
