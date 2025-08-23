// Invite staff modal for AllerQ-Forge
import { useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function InviteStaffModal() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  // TODO: Implement invite functionality with Supabase
  // const { invite } = useSupabaseAuth();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // TODO: Implement invite functionality with Supabase
      // await invite(email, 'staff'); // Default to staff role
      setError("Invite functionality not yet implemented with Supabase");
      // setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-80">
      <h2 className="text-2xl font-bold mb-4">Invite Staff</h2>
      {sent ? (
        <div className="text-green-600">Invite sent!</div>
      ) : (
        <form onSubmit={handleInvite}>
          <label htmlFor="invite-email" className="block mb-2">
            Staff Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded mb-4"
            autoComplete="email"
          />
          {error && (
            <div className="text-red-600 mb-2" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Send Invite
          </button>
        </form>
      )}
    </div>
  );
}
