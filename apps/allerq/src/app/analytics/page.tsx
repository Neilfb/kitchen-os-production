// Analytics dashboard overview with filters and charts
import { Suspense } from 'react';
import AnalyticsDashboardClient from '../../components/AnalyticsDashboardClient';
import Loader from '../../components/Loader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Overview of your restaurant analytics and insights',
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<Loader message="Loading analytics dashboard..." />}>
      <AnalyticsDashboardClient />
    </Suspense>
  );
}
