import React from "react";
import PlanSelector from "../../components/PlanSelector";
import SubscriptionStatus from "../../components/SubscriptionStatus";

export default function SubscriptionsIndex() {
  return (
    <main className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      <PlanSelector />
      <SubscriptionStatus />
    </main>
  );
}
