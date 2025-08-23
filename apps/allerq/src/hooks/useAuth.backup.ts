import { useCallback } from "react";

export function useAuth() {
  // Mock user data that can be enhanced with actual user data from a storage or context
  const user = { role: 'user' };
  const signup = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Signup failed");
      return await res.json();
    } catch (err) {
      throw err;
    }
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Signin failed");
      return await res.json();
    } catch (err) {
      throw err;
    }
  }, []);

  const invite = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Invite failed");
      return await res.json();
    } catch (err) {
      throw err;
    }
  }, []);

  return { signup, signin, invite, user };
}
