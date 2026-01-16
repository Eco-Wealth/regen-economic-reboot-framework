import { ClickPanel } from '@/components/ClickPanel';

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
               style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--card))' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: 'rgb(var(--accent))' }} />
            Base-first demand signal
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">ClickRegen</h1>
          <p className="text-sm opacity-80">
            One button. Verifiable demand. Receipts later. Regen execution only when budget + trust allow.
          </p>
        </header>

        <ClickPanel />

        <footer className="pt-2 text-xs opacity-60">
          v0: no guaranteed earnings. Sponsored execution is budgeted. Spam is capped.
        </footer>
      </div>
    </main>
  );
}
