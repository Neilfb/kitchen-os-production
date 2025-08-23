import { Suspense } from 'react';
import Loader from '../../../../components/Loader';
import AdminAnalyticsClient from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Analytics',
  description: 'Detailed analytics for a specific customer',
};

type Params = Promise<{ customerId: string }>;

export default async function AnalyticsDetailPage({ params }: { params: Params }) {
  const { customerId } = await params;
  
  return (
    <Suspense fallback={<Loader message="Loading customer analytics..." />}>
      <AdminAnalyticsClient customerId={customerId} />
    </Suspense>
  );
}
