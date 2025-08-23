import { Suspense } from 'react';
import CustomerClient from './client';
import Loader from '@/components/Loader';

type Params = Promise<{ customerId: string }>;

export default async function CustomerDetailPage({ params }: { params: Params }) {
  const { customerId } = await params;
  
  return (
    <Suspense fallback={<Loader message="Loading customer details..." />}>
      <CustomerClient customerId={customerId} />
    </Suspense>
  );
}
