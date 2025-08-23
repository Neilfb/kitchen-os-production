'use client';

import { useEffect, useState } from 'react';
import { getMenu } from '@/lib/api/client';
import { Menu } from '@/lib/api/types';
import Loader from '@/components/Loader';
import ErrorDisplay from '@/components/ErrorDisplay';
import MenuDetails from '@/components/MenuDetails';

interface MenuClientProps {
  id: string;  // keeping this as 'id' since it's internal to the component
}

export default function MenuClient({ id }: MenuClientProps) {
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const data = await getMenu(id);
        setMenu(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load menu'));
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [id]);

  if (loading) {
    return <Loader message="Loading menu details..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!menu) {
    return <div>Menu not found</div>;
  }

  return <MenuDetails menu={menu} />;
}
