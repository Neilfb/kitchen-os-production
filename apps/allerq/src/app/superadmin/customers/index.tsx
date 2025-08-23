// List all customers for super-admin
import CustomerTable from "../../../components/CustomerTable";

export default function SuperAdminCustomersPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">All Customers</h1>
      <CustomerTable />
    </main>
  );
}
