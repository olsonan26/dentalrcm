import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useMutation, useQuery } from "convex/react";
import {
  Crown,
  Loader2,
  Mail,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/* ─── Role config ─── */
const roleConfig: Record<
  string,
  { label: string; color: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  owner: {
    label: "Owner",
    color: "bg-warning/15 text-warning",
    description: "Full access — can manage team, billing, and practice settings",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    color: "bg-destructive/15 text-destructive",
    description: "Full access except practice ownership transfer",
    icon: ShieldCheck,
  },
  billing_manager: {
    label: "Billing Manager",
    color: "bg-chart-1/15 text-chart-1",
    description: "Manage claims, payments, and billing team",
    icon: Shield,
  },
  billing_specialist: {
    label: "Billing Specialist",
    color: "bg-info/15 text-info",
    description: "Work claims, post payments, and manage tasks",
    icon: Users,
  },
  viewer: {
    label: "Viewer",
    color: "bg-muted text-muted-foreground",
    description: "Read-only access to dashboard and reports",
    icon: Users,
  },
};

/* ─── Invite Dialog ─── */
function InviteMemberDialog({
  open,
  onOpenChange,
  practiceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceId: Id<"practices">;
}) {
  const addMember = useMutation(api.practiceMembers.addMember);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "billing_specialist" as "admin" | "billing_manager" | "billing_specialist" | "viewer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;
    setLoading(true);
    try {
      await addMember({
        practiceId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
      });
      toast.success(`Invited ${form.firstName} ${form.lastName}`);
      onOpenChange(false);
      setForm({ firstName: "", lastName: "", email: "", role: "billing_specialist" });
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your practice team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Last name"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="billing_manager">Billing Manager</SelectItem>
                <SelectItem value="billing_specialist">Billing Specialist</SelectItem>
                <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {roleConfig[form.role]?.description}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.firstName || !form.lastName || !form.email}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <Mail className="h-4 w-4 mr-1" />
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Member Card ─── */
function MemberCard({ member }: { member: any }) {
  const updateRole = useMutation(api.practiceMembers.updateRole);
  const deactivate = useMutation(api.practiceMembers.deactivate);
  const reactivate = useMutation(api.practiceMembers.reactivate);

  const config = roleConfig[member.role] ?? roleConfig.viewer;
  const RoleIcon = config.icon;
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  const isOwner = member.role === "owner";

  const handleRoleChange = async (newRole: string) => {
    try {
      await updateRole({ memberId: member._id, role: newRole as any });
      toast.success(`Updated ${member.firstName}'s role to ${roleConfig[newRole]?.label ?? newRole}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivate({ memberId: member._id });
      toast.success(`Deactivated ${member.firstName} ${member.lastName}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate");
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivate({ memberId: member._id });
      toast.success(`Reactivated ${member.firstName} ${member.lastName}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate");
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/30 ${member.status === "deactivated" ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3.5">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={`text-sm font-medium ${isOwner ? "bg-warning/20 text-warning" : "bg-primary/10 text-primary"}`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {member.firstName} {member.lastName}
            </p>
            {member.status === "invited" && (
              <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                Pending Invite
              </Badge>
            )}
            {member.status === "deactivated" && (
              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                Deactivated
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={`text-xs ${config.color}`}>
          <RoleIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
        {!isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRoleChange("admin")} disabled={member.role === "admin"}>
                Set as Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("billing_manager")} disabled={member.role === "billing_manager"}>
                Set as Billing Manager
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("billing_specialist")} disabled={member.role === "billing_specialist"}>
                Set as Billing Specialist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("viewer")} disabled={member.role === "viewer"}>
                Set as Viewer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {member.status === "deactivated" ? (
                <DropdownMenuItem onClick={handleReactivate}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleDeactivate}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

/* ─── Role Permissions Matrix ─── */
function PermissionsMatrix() {
  const perms = [
    { feature: "View Dashboard", owner: true, admin: true, billing_mgr: true, billing_spec: true, viewer: true },
    { feature: "View Reports", owner: true, admin: true, billing_mgr: true, billing_spec: true, viewer: true },
    { feature: "Manage Claims", owner: true, admin: true, billing_mgr: true, billing_spec: true, viewer: false },
    { feature: "Post Payments", owner: true, admin: true, billing_mgr: true, billing_spec: true, viewer: false },
    { feature: "Reconcile Payments", owner: true, admin: true, billing_mgr: true, billing_spec: false, viewer: false },
    { feature: "Manage Patients", owner: true, admin: true, billing_mgr: true, billing_spec: true, viewer: false },
    { feature: "View Audit Log", owner: true, admin: true, billing_mgr: true, billing_spec: false, viewer: false },
    { feature: "Manage Team", owner: true, admin: true, billing_mgr: false, billing_spec: false, viewer: false },
    { feature: "Practice Settings", owner: true, admin: true, billing_mgr: false, billing_spec: false, viewer: false },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Role Permissions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left text-xs font-medium text-muted-foreground py-2.5 px-5">Feature</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2.5 px-2">Owner</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2.5 px-2">Admin</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2.5 px-2">Billing Mgr</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2.5 px-2">Specialist</th>
              <th className="text-center text-xs font-medium text-muted-foreground py-2.5 px-2 pr-5">Viewer</th>
            </tr>
          </thead>
          <tbody>
            {perms.map((row) => (
              <tr key={row.feature} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 px-5 text-sm">{row.feature}</td>
                {[row.owner, row.admin, row.billing_mgr, row.billing_spec, row.viewer].map((has, i) => (
                  <td key={i} className="text-center py-2.5 px-2">
                    {has ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success text-xs">✓</span>
                    ) : (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */
export default function TeamPage() {
  const { convexUserId } = useAuth();
  const practice = useQuery(api.practices.getByOwner, convexUserId ? { userId: convexUserId } : "skip");
  const members = useQuery(
    api.practiceMembers.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const [showInvite, setShowInvite] = useState(false);

  if (!practice || members === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const active = members.filter((m: any) => m.status === "active");
  const invited = members.filter((m: any) => m.status === "invited");

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your practice team members and their access permissions
          </p>
        </div>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 mr-1" />
          Invite Member
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xl font-bold">{active.length}</p>
              <p className="text-xs text-muted-foreground">Active Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-xl font-bold">{invited.length}</p>
              <p className="text-xs text-muted-foreground">Pending Invites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Roles Defined</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member: any) => (
            <MemberCard key={member._id} member={member} />
          ))}
          {members.length === 0 && (
            <div className="py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <PermissionsMatrix />

      {/* Invite Dialog */}
      <InviteMemberDialog
        open={showInvite}
        onOpenChange={setShowInvite}
        practiceId={practice._id}
      />
    </div>
  );
}
