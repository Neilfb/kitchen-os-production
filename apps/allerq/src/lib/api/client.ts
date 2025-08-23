import { Analytics, ApiResponse, Customer, Menu, Restaurant, Subscription } from './types';

// Generic fetch helper with typed response
async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  const res = await fetch(`/api/${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

// Restaurant API
export async function getRestaurant(id: string): Promise<Restaurant> {
  const response = await fetchApi<Restaurant>(`restaurants/${id}`);
  return response.data;
}

// Menu API
export async function getMenu(id: string): Promise<Menu> {
  const response = await fetchApi<Menu>(`menus/${id}`);
  return response.data;
}

// Customer API
export async function getCustomer(id: string): Promise<Customer> {
  const response = await fetchApi<Customer>(`customers/${id}`);
  return response.data;
}

// Analytics API
export async function getAnalytics(id: string): Promise<Analytics> {
  const response = await fetchApi<Analytics>(`analytics/${id}`);
  return response.data;
}

// Subscription API
export async function getSubscription(id: string): Promise<Subscription> {
  const response = await fetchApi<Subscription>(`subscriptions/${id}`);
  return response.data;
}
