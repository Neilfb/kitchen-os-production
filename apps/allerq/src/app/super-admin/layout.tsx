'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useFirebaseAuth();
  const isSuperadmin = false; // TODO: Implement superadmin logic for Firebase
  const router = useRouter();

  useEffect(() => {
    if (!user || !isSuperadmin) {
      // Use alternative navigation approach for compatibility with strict route typing
      window.location.href = '/auth/login';
    }
  }, [user, isSuperadmin, router]);

  if (!user || !isSuperadmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">AllerQ-Forge Admin</div>
          <div className="flex space-x-6">
            <Link href="/super-admin/dashboard" className="hover:text-blue-200">Dashboard</Link>
            <Link href="/super-admin/customers" className="hover:text-blue-200">Customers</Link>
            <Link href="/super-admin/analytics" className="hover:text-blue-200">Analytics</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
