import { KitchenOSUser } from '@kitchen-os/database';

export interface AuthState {
  user: KitchenOSUser | null;
  loading: boolean;
  error: string | null;
}

export function isAuthenticated(user: KitchenOSUser | null): boolean {
  return user !== null;
}
