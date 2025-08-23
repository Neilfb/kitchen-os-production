"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'staff';

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  restaurantId?: string; // For restaurant-specific roles
  permissions?: string[]; // Additional permissions
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  invite: (email: string, role: UserRole, restaurantId?: string) => Promise<string | null>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced auth restoration with validation
  useEffect(() => {
    const restoreAuthState = async () => {
      console.log('[AuthContext] Starting auth state restoration...');
      setIsLoading(true);

      try {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("user");

        console.log('[AuthContext] Loading from localStorage - token:', !!t, 'user:', !!u);

        if (t && u) {
          try {
            // Validate token before restoring
            const { isTokenValid } = await import('@/lib/auth');

            if (!isTokenValid(t)) {
              console.warn('[AuthContext] Token is invalid, clearing storage');
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              setToken(null);
              setUser(null);
            } else {
              const parsedUser = JSON.parse(u);
              console.log('[AuthContext] Restored valid user from localStorage:', parsedUser);
              setToken(t);
              setUser(parsedUser);

              // Ensure cookie is set for server-side access
              document.cookie = `token=${t}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
            }
          } catch (error) {
            console.error("Failed to parse stored user data or validate token:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setToken(null);
            setUser(null);
          }
        } else {
          console.log('[AuthContext] No stored authentication found');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error during auth restoration:', error);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('[AuthContext] Auth state restoration completed');
      }
    };

    restoreAuthState();
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(`Login failed: ${res.status}`);
    }

    const data = await res.json();
    if (data.success) {
      console.log('[AuthContext] Login successful for user:', data.user?.email);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Also set cookie for server-side access
      document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    } else {
      throw new Error(data.error || "Login failed");
    }
  }

  async function signup(email: string, password: string, name?: string) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Also set cookie for server-side access
      document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    } else {
      throw new Error(data.error || "Signup failed");
    }
  }

  async function invite(email: string, role: string) {
    const res = await fetch("/api/auth/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (data.success) {
      return data.inviteUrl;
    } else {
      throw new Error(data.error || "Invite failed");
    }
  }

  async function logout() {
    try {
      // Call server-side signout endpoint
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
    } catch (error) {
      console.warn('[AuthContext] Server signout failed, proceeding with client-side cleanup:', error);
    }

    // Clear client-side state
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Also clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    console.log('[AuthContext] Logout completed');
  }

  function hasRole(roleOrRoles: UserRole | UserRole[]) {
    if (!user?.role) return false;
    if (Array.isArray(roleOrRoles)) {
      return roleOrRoles.includes(user.role);
    }
    return user.role === roleOrRoles;
  }

  function hasPermission(permission: string) {
    return user?.permissions?.includes(permission) || false;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isInitialized,
        login,
        signup,
        invite,
        logout,
        hasRole,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
