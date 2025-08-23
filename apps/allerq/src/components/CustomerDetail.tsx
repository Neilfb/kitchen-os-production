"use client";
import { useEffect, useState } from "react";
import { useCustomers, Customer as HookCustomer } from "@/hooks/useCustomers";
import { Customer as ApiCustomer } from "@/lib/api/types";

// Combined type that accepts either customer type
type Customer = HookCustomer | (ApiCustomer & { role?: string });

interface CustomerDetailProps {
  customerId?: string;
  customer?: Customer;
}

export default function CustomerDetail({ customerId, customer: propCustomer }: CustomerDetailProps) {
  const { customers, loading, error, fetchCustomers, updateCustomerStatus } = useCustomers();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  
  useEffect(() => {
    if (customerId) {
      fetchCustomers();
    }
  }, [customerId, fetchCustomers]);
  
  const customerFromId = customerId ? customers.find((c) => c.id === customerId) : null;
  const customer = propCustomer || customerFromId;

  const handleAction = async (action: string) => {
    if (!customer) return;
    setActionLoading(true);
    setActionError("");
    try {
      await updateCustomerStatus(customer.id, action);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.name || 'Unnamed'}</h2>
            <p className="text-gray-600">{customer.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
              customer.status === 'suspended' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'}`}>
            {customer.status}
          </span>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-500">Restaurants</div>
            <div className="text-2xl font-bold">{customer.restaurantCount || 0}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-500">Menus</div>
            <div className="text-2xl font-bold">{customer.menuCount || 0}</div>
          </div>
        </div>

        {actionError && (
          <div className="mt-4 text-red-600">{actionError}</div>
        )}

        <div className="mt-6 flex space-x-4">
          {customer.status === 'active' ? (
            <button
              onClick={() => handleAction('suspend')}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Suspend Account
            </button>
          ) : (
            <button
              onClick={() => handleAction('activate')}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Activate Account
            </button>
          )}
          <button
            onClick={() => handleAction('delete')}
            disabled={actionLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
