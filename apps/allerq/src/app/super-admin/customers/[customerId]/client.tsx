'use client';

import { useEffect, useState } from 'react';
import { getCustomer } from '@/lib/api/client';
import { Customer } from '@/lib/api/types';
import Loader from '@/components/Loader';
import ErrorDisplay from '@/components/ErrorDisplay';
import CustomerDetail from '@/components/CustomerDetail';

interface CustomerClientProps {
  customerId: string;
}

export default function CustomerClient({ customerId }: CustomerClientProps) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const data = await getCustomer(customerId);
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load customer'));
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [customerId]);

  if (loading) {
    return <Loader message="Loading customer details..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return <CustomerDetail customer={customer} />;
}
