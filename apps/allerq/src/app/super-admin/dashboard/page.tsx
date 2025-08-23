import { Suspense } from 'react';
import SuperAdminDashboardClient from './client';
import Loader from '@/components/Loader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard',
  description: 'AllerQ-Forge super administrator dashboard',
};

export default function SuperAdminDashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<Loader message="Loading dashboard..." />}>
        <SuperAdminDashboardClient />
      </Suspense>
    </main>
  );
}
