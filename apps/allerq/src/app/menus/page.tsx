// List all menus
import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import MenuListClientWrapper from "@/components/MenuListClientWrapper";

export default function MenusPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Menus</h1>
      <Suspense fallback={<Loader message="Loading menus..." />}>
        <MenuListClientWrapper />
      </Suspense>
    </main>
  );
}
