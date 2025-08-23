import { useState } from "react";

export function useBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startPayment = async (
    provider: "stripe" | "gocardless",
    planId: string,
  ) => {
    setLoading(true);
    setError("");
    try {
      let url = "";
      if (provider === "stripe") {
        const res = await fetch("/api/billing/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        if (!res.ok) throw new Error("Stripe payment failed");
        const data = await res.json();
        url = data.url;
      } else if (provider === "gocardless") {
        const res = await fetch("/api/billing/gocardless", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        if (!res.ok) throw new Error("GoCardless payment failed");
        const data = await res.json();
        url = data.url;
      }
      if (url) window.location.href = url;
    } catch (err) {
      if (err instanceof Error) setError(err.message || "Payment failed");
      else setError("Payment failed");
    } finally {
      setLoading(false);
    }
  };
  return { loading, error, startPayment };
}
