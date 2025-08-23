// Customer detail & analytics for super-admin
import CustomerDetail from "../../../components/CustomerDetail";
import AnalyticsChart from "../../../components/AnalyticsChart";

export default function SuperAdminCustomerDetailPage({
  params,
}: {
  params: { customerId: string };
}) {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <CustomerDetail customerId={params.customerId} />
      <div className="mt-8">
        <AnalyticsChart customerId={params.customerId} />
      </div>
    </main>
  );
}
