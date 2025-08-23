// Role-based access control component
import { ReactNode } from "react";
import { useFirebaseAuth, UserRole } from "@/contexts/FirebaseAuthContext";

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: UserRole | UserRole[];
  fallback?: ReactNode;
}

export default function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { hasRole, loading } = useFirebaseAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return fallback || null;
  }

  // Check if user has required role
  if (hasRole(allowedRoles)) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
