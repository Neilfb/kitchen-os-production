// List all restaurants
import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import RestaurantListClient from "./client-component";

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      <Suspense fallback={<Loader message="Loading restaurants..." />}>
        <RestaurantListClient />
      </Suspense>
    </main>
  );
}
