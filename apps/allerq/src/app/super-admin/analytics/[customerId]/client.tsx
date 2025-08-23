'use client';

import { useMemo } from 'react';
import SuperAdminAnalyticsChart from '../../../../components/SuperAdminAnalyticsChart';

interface AdminAnalyticsClientProps {
  customerId: string;
}

export default function AdminAnalyticsClient({ customerId }: AdminAnalyticsClientProps) {
  // This could have local state for filters, etc.
  const customerIdStr = useMemo(() => 
    customerId ? String(customerId) : 'all', 
    [customerId]
  );

  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Analytics: {customerIdStr}</h1>
      <SuperAdminAnalyticsChart customerId={customerId} />
    </main>
  );
}
