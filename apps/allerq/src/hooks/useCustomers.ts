import { useState, useCallback } from "react";

export interface Customer {
  id: string;
  name?: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  role: string;
  restaurantCount?: number;
  menuCount?: number;
  createdAt?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/super-admin/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: unknown) {
      if (err instanceof Error)
        setError(err.message || "Failed to fetch customers.");
      else setError("Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCustomerStatus = useCallback(async (customerId: string, action: string) => {
    try {
      const res = await fetch("/api/super-admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, action }),
      });
      if (!res.ok) throw new Error("Failed to update customer status");
      await fetchCustomers();
      return true;
    } catch (error) {
      console.error("Error updating customer status:", error);
      throw error;
    }
  }, [fetchCustomers]);

  return { customers, loading, error, fetchCustomers, updateCustomerStatus };
}
