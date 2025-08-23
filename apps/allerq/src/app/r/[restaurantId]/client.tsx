'use client';

import { useEffect, useState } from 'react';
import { getRestaurant } from '@/lib/api/client';
import { Restaurant } from '@/lib/api/types';
import Loader from '@/components/Loader';
import ErrorDisplay from '@/components/ErrorDisplay';
import PublicMenu from '@/components/PublicMenu';

interface PublicMenuClientProps {
  restaurantId: string;
}

export default function PublicMenuClient({ restaurantId }: PublicMenuClientProps) {
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true);
        const data = await getRestaurant(restaurantId);
        setRestaurant(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load restaurant menu'));
      } finally {
        setLoading(false);
      }
    }
    loadRestaurant();
  }, [restaurantId]);

  if (loading) {
    return <Loader message="Loading menu..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!restaurant) {
    return <div>Restaurant menu not found</div>;
  }

  return <PublicMenu restaurantId={restaurantId} restaurant={restaurant} />;
}
