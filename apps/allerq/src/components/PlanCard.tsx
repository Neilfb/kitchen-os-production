// Plan card for subscription plans
import React from "react";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  features?: string[];
}

export default function PlanCard({
  plan,
  onSelect,
}: {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
}) {
  return (
    <div className="border rounded p-4 flex flex-col gap-2">
      <h2 className="text-lg font-bold">{plan.name}</h2>
      <p className="text-gray-600">{plan.description}</p>
      <div className="font-bold text-xl">${plan.price}/mo</div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => onSelect(plan)}
      >
        Select
      </button>
    </div>
  );
}
