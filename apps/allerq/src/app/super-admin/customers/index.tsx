// Table of all customers
import CustomerTable from "../../../components/CustomerTable";

export default function SuperAdminCustomersIndex() {
  return (
    <main className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">All Customers</h1>
      <CustomerTable />
    </main>
  );
}
