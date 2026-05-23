import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useQuery } from "convex/react";
import {
  Activity,
  AlertCircle,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Filter,
  History,
  Shield,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

/* ─── Helpers ─── */
const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  claim: FileText,
  payment: CreditCard,
  patient: Users,
  provider: Stethoscope,
  task: ClipboardList,
  practice: Shield,
  member: UserCheck,
};

const actionColors: Record<string, string> = {
  create: "bg-success/15 text-success",
  update: "bg-info/15 text-info",
  delete: "bg-destructive/15 text-destructive",
  status_change: "bg-chart-1/15 text-chart-1",
  reconcile: "bg-success/15 text-success",
  batch_post: "bg-info/15 text-info",
  role_change: "bg-warning/15 text-warning",
  ai_scrub: "bg-chart-2/15 text-chart-2",
  appeal: "bg-warning/15 text-warning",
  eligibility_check: "bg-chart-1/15 text-chart-1",
};

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  status_change: "Status Change",
  reconcile: "Reconciled",
  batch_post: "Batch Post",
  role_change: "Role Change",
  ai_scrub: "AI Scrub",
  appeal: "Appeal",
  eligibility_check: "Eligibility Check",
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatTimestamp(ts);
}

/* ─── Audit Log Entry ─── */
function AuditLogEntry({ log }: { log: any }) {
  const Icon = entityIcons[log.entityType] || Activity;

  return (
    <div className="flex gap-4 py-3.5 px-5 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{log.description}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="secondary" className={`text-[10px] ${actionColors[log.action] ?? "bg-muted text-muted-foreground"}`}>
                {actionLabels[log.action] ?? log.action}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {log.entityType}
              </Badge>
              {log.performedByName && (
                <span className="text-xs text-muted-foreground">
                  by {log.performedByName}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {formatTimeAgo(log._creationTime)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AuditLogPage() {
  const { convexUserId } = useAuth();
  const practice = useQuery(api.practices.getByOwner, convexUserId ? { userId: convexUserId } : "skip");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const logs = useQuery(
    api.auditLog.listByPractice,
    practice
      ? {
          practiceId: practice._id,
          entityType: entityFilter !== "all" ? (entityFilter as any) : undefined,
          limit: 100,
        }
      : "skip"
  );
  const stats = useQuery(
    api.auditLog.getStats,
    practice ? { practiceId: practice._id } : "skip"
  );

  if (!practice || logs === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete compliance trail — every action, every change, every user
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <History className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xl font-bold">{stats?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-chart-1 shrink-0" />
            <div>
              <p className="text-xl font-bold">{stats?.today ?? 0}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-info shrink-0" />
            <div>
              <p className="text-xl font-bold">{stats?.thisWeek ?? 0}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-xl font-bold">
                {stats?.byAction?.status_change ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Status Changes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="claim">Claims</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="provider">Providers</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="member">Team Members</SelectItem>
            <SelectItem value="practice">Practice</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          Showing {logs.length} event{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <History className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No events found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {entityFilter !== "all"
                  ? "Try changing the filter"
                  : "Events will appear as actions are performed"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {logs.map((log: any) => (
                <AuditLogEntry key={log._id} log={log} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
