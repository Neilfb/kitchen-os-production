import { Analytics } from '../api/types';

// Analytics API
export async function getAnalytics(id?: string): Promise<Analytics | Analytics[]> {
  const endpoint = id ? `/api/analytics/${id}` : '/api/analytics';
  const res = await fetch(endpoint);
  
  if (!res.ok) {
    throw new Error(`Analytics API error: ${res.statusText}`);
  }
  
  const data = await res.json();
  return data;
}
