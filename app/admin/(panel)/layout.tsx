import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { requireAdmin } from '@/lib/auth/guard';
import { logoutAction } from '../belepes/actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Admin – Kapucinus', template: '%s – Kapucinus admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-cream-100">
      <AdminNav logoutAction={logoutAction} />
      <main className="px-4 pb-16 pt-8 sm:px-8 lg:ml-64 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
