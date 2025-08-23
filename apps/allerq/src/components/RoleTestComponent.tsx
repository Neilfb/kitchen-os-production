'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import RoleGate from './RoleGate';

/**
 * Test component to verify role-based access control is working
 * This component should be removed after testing is complete
 */
export default function RoleTestComponent() {
  const { user, hasRole, loading } = useFirebaseAuth();

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded">Loading auth state...</div>;
  }

  if (!user) {
    return <div className="p-4 bg-red-100 rounded">Not authenticated</div>;
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm space-y-4">
      <h3 className="text-lg font-semibold">Role-Based Access Control Test</h3>
      
      {/* User Info */}
      <div className="p-3 bg-blue-50 rounded">
        <h4 className="font-medium">Current User:</h4>
        <p>Email: {user.email}</p>
        <p>Role: <span className="font-mono bg-blue-200 px-2 py-1 rounded">{user.role}</span></p>
        <p>UID: <span className="font-mono text-xs">{user.uid}</span></p>
      </div>

      {/* Role Checks */}
      <div className="space-y-2">
        <h4 className="font-medium">Role Checks:</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className={`p-2 rounded ${hasRole('superadmin') ? 'bg-green-100' : 'bg-red-100'}`}>
            Superadmin: {hasRole('superadmin') ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${hasRole('admin') ? 'bg-green-100' : 'bg-red-100'}`}>
            Admin: {hasRole('admin') ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded ${hasRole('manager') ? 'bg-green-100' : 'bg-red-100'}`}>
            Manager: {hasRole('manager') ? '✅' : '❌'}
          </div>
        </div>
      </div>

      {/* RoleGate Tests */}
      <div className="space-y-3">
        <h4 className="font-medium">RoleGate Component Tests:</h4>
        
        <RoleGate 
          allowedRoles="superadmin"
          fallback={<div className="p-2 bg-red-100 rounded text-sm">❌ Superadmin only content (hidden)</div>}
        >
          <div className="p-2 bg-green-100 rounded text-sm">✅ Superadmin only content (visible)</div>
        </RoleGate>

        <RoleGate 
          allowedRoles="admin"
          fallback={<div className="p-2 bg-red-100 rounded text-sm">❌ Admin only content (hidden)</div>}
        >
          <div className="p-2 bg-green-100 rounded text-sm">✅ Admin only content (visible)</div>
        </RoleGate>

        <RoleGate 
          allowedRoles={['admin', 'manager']}
          fallback={<div className="p-2 bg-red-100 rounded text-sm">❌ Admin/Manager content (hidden)</div>}
        >
          <div className="p-2 bg-green-100 rounded text-sm">✅ Admin/Manager content (visible)</div>
        </RoleGate>

        <RoleGate 
          allowedRoles={['superadmin', 'admin', 'manager']}
          fallback={<div className="p-2 bg-red-100 rounded text-sm">❌ All roles content (hidden)</div>}
        >
          <div className="p-2 bg-green-100 rounded text-sm">✅ All roles content (visible)</div>
        </RoleGate>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-yellow-50 rounded text-sm">
        <h4 className="font-medium">Test Instructions:</h4>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Green boxes should be visible for your current role</li>
          <li>Red boxes should be visible when you don't have the required role</li>
          <li>Default new users get 'admin' role</li>
          <li>To test different roles, manually update the user's role in Firestore</li>
        </ul>
      </div>
    </div>
  );
}
