import { Suspense } from "react";
import PublicMenuClient from './client';
import Loader from '@/components/Loader';

type Params = Promise<{ restaurantId: string }>;

export default async function PublicMenuPage({ params }: { params: Params }) {
  const { restaurantId } = await params;
  
  return (
    <Suspense fallback={<Loader message="Loading menu..." />}>
      <PublicMenuClient restaurantId={restaurantId} />
    </Suspense>
  );
}
