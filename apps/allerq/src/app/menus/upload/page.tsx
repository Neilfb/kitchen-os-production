// Bulk upload and AI processing
import React, { Suspense } from "react";
import MenuUploadClient from "./client";
import Loader from "@/components/Loader";

export default function MenuBulkUploadPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Bulk Upload Menus & Dishes</h1>
      <Suspense fallback={<Loader message="Loading uploader..." />}>
        <MenuUploadClient />
      </Suspense>
    </main>
  );
}
