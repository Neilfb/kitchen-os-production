import { Suspense } from 'react';
import MenuEditClient from './client';
import Loader from '@/components/Loader';
import { use } from 'react';

type Params = Promise<{ menuId: string }>;

export default function MenuEditPage({ params }: { params: Params }) {
  const { menuId } = use(params);
  
  return (
    <Suspense fallback={<Loader message="Loading menu editor..." />}>
      <MenuEditClient menuId={menuId} />
    </Suspense>
  );
}
