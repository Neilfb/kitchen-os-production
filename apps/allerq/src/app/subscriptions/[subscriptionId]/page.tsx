import { Suspense } from 'react';
import SubscriptionClient from './client';
import Loader from '../../../components/Loader';

type Params = Promise<{ subscriptionId: string }>;

export default async function SubscriptionDetailPage({ params }: { params: Params }) {
  const { subscriptionId } = await params;
  
  return (
    <Suspense fallback={<Loader message="Loading subscription details..." />}>
      <SubscriptionClient subscriptionId={subscriptionId} />
    </Suspense>
  );
}
