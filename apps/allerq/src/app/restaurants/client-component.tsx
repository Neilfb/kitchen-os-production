'use client';

import { useRestaurants } from "../../hooks/useRestaurants";
import { Restaurant } from "../../lib/services/clientRestaurantService";
import Link from "next/link";

export default function RestaurantListClient() {
  const { restaurants, loading, error } = useRestaurants();
  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="min-w-full border mt-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4">
                No restaurants found.
              </td>
            </tr>
          ) : (
            restaurants.map((r: Restaurant) => (
              <tr key={r.id}>
                <td className="border px-4 py-2">{r.name}</td>
                <td className="border px-4 py-2">{r.address}</td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/restaurants/${r.id}/edit`}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
