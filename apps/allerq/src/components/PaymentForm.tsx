"use client";

// Stripe & GoCardless payment entry form (placeholder)
import React from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  subscriptionId: string;
}

export default function PaymentForm({ subscriptionId, className = "", ...props }: Props) {
  const { current: subscription } = useSubscriptions();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement Stripe/GoCardless payment processing
    console.log('Processing payment for subscription:', subscriptionId);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`bg-white rounded shadow p-4 ${className}`}
      {...props}
    >
      <div className="font-bold mb-2">Payment Details for {subscriptionId}</div>
      {subscription && (
        <div className="text-gray-500 text-sm mb-2">
          Current Plan: {subscription.planId}
        </div>
      )}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Card number"
          className="border rounded px-2 py-1 w-full"
          required
        />
        <input
          type="text"
          placeholder="MM/YY"
          className="border rounded px-2 py-1 w-full"
          required
          pattern="\d{2}/\d{2}"
        />
        <input
          type="text"
          placeholder="CVC"
          className="border rounded px-2 py-1 mb-2 w-full"
          required
          pattern="\d{3,4}"
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition-colors"
        >
          Process Payment
        </button>
      </div>
    </form>
  );
}
