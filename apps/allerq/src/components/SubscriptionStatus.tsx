"use client";

import React, { useEffect } from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  subscriptionId?: string;
}

export default function SubscriptionStatus({ subscriptionId = "default", className = "", ...props }: Props) {
  const { current: subscription, fetchCurrent } = useSubscriptions();

  useEffect(() => {
    const abortController = new AbortController();
    
    async function loadSubscription() {
      try {
        await fetchCurrent(subscriptionId);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error("Error loading subscription:", err);
        }
      }
    }

    loadSubscription();

    return () => {
      abortController.abort();
    };
  }, [subscriptionId, fetchCurrent]);

  return (
    <div 
      className={`mb-4 p-3 bg-white rounded shadow text-center ${className}`}
      {...props}
    >
      <div className="mt-2">
        <span className="font-medium">Status:</span>{" "}
        <span className="text-blue-700">{subscription?.status || "Loading..."}</span>
      </div>
    </div>
  );
}
