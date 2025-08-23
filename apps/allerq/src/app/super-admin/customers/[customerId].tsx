// Customer detail + subscription controls
import CustomerDetail from "../../../components/CustomerDetail";

export default function SuperAdminCustomerDetail({
  params,
}: {
  params: { customerId: string };
}) {
  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Analytics</h1>
      <CustomerDetail customerId={params.customerId} />
    </main>
  );
}
