"use client";
import { useEffect, useState } from "react";
import { useCustomers, Customer } from "../hooks/useCustomers";
import { useRouter } from "next/navigation";

export default function CustomerTable() {
  const router = useRouter();
  const { customers, loading, error, fetchCustomers } = useCustomers();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (customerId: string, action: string) => {
    try {
      setActionLoading(customerId);
      const res = await fetch("/api/super-admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, action }),
      });

      if (!res.ok) throw new Error("Failed to perform action");

      await fetchCustomers();
    } catch (err) {
      console.error("Error performing action:", err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();

    async function loadCustomers() {
      if (!abortController.signal.aborted) {
        try {
          await fetchCustomers();
        } catch (err) {
          console.error("Error loading customers:", err);
        }
      }
    }

    loadCustomers();

    return () => {
      abortController.abort();
    };
  }, [fetchCustomers]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((customer: Customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 text-xs font-semibold rounded-full
                  ${
                    customer.status === "active"
                      ? "bg-green-100 text-green-800"
                      : customer.status === "suspended"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {customer.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div>{customer.restaurantCount || 0} restaurants</div>
                <div>{customer.menuCount || 0} menus</div>
              </td>
              <td className="px-6 py-4 text-sm space-x-3">
                <button
                  onClick={() => router.push(`/super-admin/customers/${customer.id}`)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </button>
                {customer.status === "active" ? (
                  <button
                    onClick={() => handleAction(customer.id, "suspend")}
                    disabled={actionLoading === customer.id}
                    className="text-red-600 hover:text-red-900"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(customer.id, "activate")}
                    disabled={actionLoading === customer.id}
                    className="text-green-600 hover:text-green-900"
                  >
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
