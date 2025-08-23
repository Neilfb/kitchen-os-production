import { Suspense } from "react";
import AnalyticsClient from "./client";
import Loader from "../../../components/Loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Detail",
  description: "Detailed analytics view for your restaurant or menu",
};

type Params = Promise<{ id: string }>;

export default async function AnalyticsPage({ params }: { params: Params }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<Loader message="Loading analytics..." />}>
      <AnalyticsClient id={id} />
    </Suspense>
  );
}
