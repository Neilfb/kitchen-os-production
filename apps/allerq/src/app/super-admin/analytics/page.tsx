// Super-admin analytics dashboard overview
import { Suspense } from 'react';
import SuperAdminDashboardClient from './client';
import Loader from '../../../components/Loader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Analytics',
  description: 'Comprehensive analytics dashboard for administrators',
};

export default function SuperAdminAnalyticsPage() {
  return (
    <Suspense fallback={<Loader message="Loading admin analytics..." />}>
      <SuperAdminDashboardClient />
    </Suspense>
  );
}
