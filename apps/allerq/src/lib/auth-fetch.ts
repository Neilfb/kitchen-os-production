// src/lib/auth-fetch.ts
// Utility for making authenticated fetch requests from the frontend

/**
 * Makes an authenticated fetch request by automatically including the auth token from localStorage
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // Prepare headers
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  
  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Add Content-Type for POST/PUT requests if not already set
  if ((options.method === 'POST' || options.method === 'PUT') && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  
  // Make the request with auth headers
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Makes an authenticated fetch request and returns JSON response
 */
export async function authFetchJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await authFetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Helper for making authenticated POST requests
 */
export async function authPost<T = any>(url: string, data: any): Promise<T> {
  return authFetchJson<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Helper for making authenticated PUT requests
 */
export async function authPut<T = any>(url: string, data: any): Promise<T> {
  return authFetchJson<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Helper for making authenticated DELETE requests
 */
export async function authDelete<T = any>(url: string): Promise<T> {
  return authFetchJson<T>(url, {
    method: 'DELETE',
  });
}

/**
 * Helper for making authenticated GET requests
 */
export async function authGet<T = any>(url: string, signal?: AbortSignal): Promise<T> {
  return authFetchJson<T>(url, {
    method: 'GET',
    signal,
  });
}
