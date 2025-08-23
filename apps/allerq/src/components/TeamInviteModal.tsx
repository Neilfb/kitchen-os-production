// Invite staff modal for restaurants
import { useEffect, useState } from "react";
import { useTeam } from "@/hooks/useTeam";
import { UserRole } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { Label } from "@/components/ui/label";

interface TeamInviteModalProps {
  restaurantId: string;
  onClose: () => void;
}

export default function TeamInviteModal({
  restaurantId,
  onClose,
}: TeamInviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [sent, setSent] = useState(false);
  const { invite, loading, error, fetchTeam } = useTeam(restaurantId);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await fetchTeam();
      if (!mounted) return;
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await invite(email, role);
      setSent(true);
      setEmail("");
      setRole("staff");
    } catch {
      // error handled by hook
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="text-center py-4">
            <Icons.checkCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-2 text-lg font-semibold text-green-600">Invitation Sent!</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="team@example.com"
              required
              disabled={loading}
            />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: string) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
