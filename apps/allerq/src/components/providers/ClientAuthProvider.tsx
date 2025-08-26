'use client';

import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { useEffect, useState } from 'react';

interface ClientAuthProviderProps {
  children: React.ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, render children without auth provider
  if (!isClient) {
    return <>{children}</>;
  }

  // On client, render with auth provider
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}
