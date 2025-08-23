export type ProductType = 'food-label-system' | 'allerq';
export type UserRole = 'admin' | 'manager' | 'staff';

export interface KitchenOSUser {
  uid: string;
  email: string;
  displayName: string;
  tenantId: string;
  products: ProductType[];
  role: UserRole;
}
