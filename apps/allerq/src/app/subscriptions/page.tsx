// Subscriptions list and management UI
import PlanSelector from "@/components/PlanSelector";
import SubscriptionStatus from "@/components/SubscriptionStatus";

export default function SubscriptionsPage() {
  return (
    <main className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Subscriptions</h1>
      <PlanSelector />
      <div className="mt-8">
        <SubscriptionStatus />
      </div>
    </main>
  );
}
