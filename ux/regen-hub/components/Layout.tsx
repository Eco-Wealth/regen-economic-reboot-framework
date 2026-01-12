import React from 'react';
import Head from 'next/head';
import { OverlayNav } from '@/components/OverlayNav';

export function Layout(props: { children: React.ReactNode; title?: string; description?: string }) {
  const title = props.title ? `${props.title} · Regen Hub` : 'Regen Hub';
  const description = props.description ?? 'Unified Regen Hub interface.';

  return (
    <div className="min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <OverlayNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{props.children}</main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-gray-500 sm:px-6 lg:px-8">
          EcoWealth · Regen Hub UX
        </div>
      </footer>
    </div>
  );
}
