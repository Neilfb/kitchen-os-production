import { useState, useCallback, useEffect } from "react";

import { UserRole } from "@/contexts/AuthContext";

export interface TeamMember {
  id: string;
  email: string;
  role: UserRole;
}

export function useTeam(restaurantId: string) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTeam = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/team`, { signal });
      if (signal?.aborted) return;
      if (!res.ok) throw new Error("Failed to fetch team");
      const data = await res.json();
      setTeam(data.team || []);
    } catch (err) {
      if (!signal?.aborted) {
        setError(err instanceof Error ? err.message : "Failed to fetch team.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [restaurantId]);

  const invite = useCallback(
    async (email: string, role: UserRole = "staff") => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/team`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        });
        if (!res.ok) throw new Error("Failed to invite team member");
        await fetchTeam();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to invite team member.");
      } finally {
        setLoading(false);
      }
    },
    [restaurantId, fetchTeam],
  );

  const removeTeamMember = useCallback(
    async (memberId: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/team/${memberId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove team member");
        setTeam(prev => prev.filter(member => member.id !== memberId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove team member.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  const updateTeamMember = useCallback(
    async (memberId: string, updates: Partial<Omit<TeamMember, "id">>) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/team/${memberId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Failed to update team member");
        const updatedMember = await res.json();
        setTeam(prev => prev.map(member => 
          member.id === memberId ? updatedMember : member
        ));
        return updatedMember;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update team member.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchTeam(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, [fetchTeam]);

  return { 
    team, 
    loading, 
    error, 
    fetchTeam, 
    invite,
    removeTeamMember,
    updateTeamMember
  };
}
