import { Suspense } from 'react';
import MenuClient from './client';
import Loader from '@/components/Loader';

type Params = Promise<{ menuId: string }>;

export default async function MenuDetailPage({ params }: { params: Params }) {
  const { menuId } = await params;
  
  return (
    <Suspense fallback={<Loader message="Loading menu..." />}>
      <MenuClient id={menuId} />
    </Suspense>
  );
}
