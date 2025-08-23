// Complete password reset page
import { Suspense } from "react";
import CompleteResetForm from "@/components/CompleteResetForm";
import Loader from "@/components/Loader";

export default function CompleteResetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Suspense fallback={<Loader message="Loading..." />}>
        <CompleteResetForm />
      </Suspense>
    </main>
  );
}
