import React from 'react';
import { Layout } from '@/components/Layout';
import { RoleDashboard } from '@/components/RoleDashboard';
import { MentorPanel } from '@/components/MentorPanel';

export default function Home() {
  return (
    <Layout title="Dashboard" description="Unified view of projects, rewards, governance, and mentor support.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <RoleDashboard />
        </section>
        <aside className="lg:col-span-1">
          <MentorPanel compact />
        </aside>
      </div>
    </Layout>
  );
}
