// Create new menu page
import { Suspense } from "react";
import Loader from "@/components/Loader";
import CreateMenuClient from "./client";

export default function CreateMenuPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Menu</h1>
      <Suspense fallback={<Loader message="Loading..." />}>
        <CreateMenuClient />
      </Suspense>
    </main>
  );
}
