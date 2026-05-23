import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useQuery, useMutation } from "convex/react";
import {
  Activity,
  AlertTriangle,

  BadgeCheck,
  BanknoteIcon,
  CircleDollarSign,
  ClipboardList,
  FileText,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../convex/_generated/api";
import {
  claimStatusColor,
  formatCurrency,
  formatCurrencyExact,
  formatDateShort,
  paymentStatusColor,
} from "@/lib/formatters";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  trend?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { convexUserId } = useAuth();
  const practice = useQuery(api.practices.getByOwner, convexUserId ? { userId: convexUserId } : "skip");
  const ensureSeed = useMutation(api.init.ensureSeedData);

  useEffect(() => {
    if (practice === null || practice !== undefined) {
      ensureSeed({ userId: convexUserId! });
    }
  }, [practice, ensureSeed]);

  const stats = useQuery(
    api.dashboard.getStats,
    practice ? { practiceId: practice._id } : "skip"
  );

  if (practice === undefined || (practice && stats === undefined)) {
    return <LoadingSkeleton />;
  }

  if (!practice || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Badge variant="outline" className="text-xs font-medium gap-1 bg-success/10 text-success border-success/20">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {practice.name} · Revenue cycle overview
        </p>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collections"
          value={formatCurrency(stats.totalCollections)}
          subtitle={`${stats.collectionRate}% collection rate`}
          icon={CircleDollarSign}
          iconColor="bg-success/10 text-success"
          trend="+12% vs last month"
        />
        <StatCard
          title="Outstanding A/R"
          value={formatCurrency(stats.totalOutstandingAR)}
          subtitle={`${formatCurrency(stats.over90AR)} over 90 days`}
          icon={BanknoteIcon}
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard
          title="Claims Pipeline"
          value={String(stats.totalClaims)}
          subtitle={`${stats.pendingClaims} pending · ${stats.paidClaims} paid`}
          icon={FileText}
          iconColor="bg-info/10 text-info"
        />
        <StatCard
          title="AI Clean Score"
          value={stats.avgCleanScore > 0 ? `${stats.avgCleanScore}%` : "—"}
          subtitle="Average claim quality"
          icon={ShieldCheck}
          iconColor="bg-chart-1/10 text-chart-1"
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Patients"
          value={String(stats.totalPatients)}
          icon={Users}
          iconColor="bg-chart-3/10 text-chart-3"
        />
        <StatCard
          title="Denied Claims"
          value={String(stats.deniedClaims)}
          subtitle="Require attention"
          icon={AlertTriangle}
          iconColor="bg-destructive/10 text-destructive"
        />
        <StatCard
          title="Open Tasks"
          value={String(stats.openTasks)}
          subtitle={stats.urgentTasks > 0 ? `${stats.urgentTasks} urgent` : "All on track"}
          icon={ClipboardList}
          iconColor="bg-chart-5/10 text-chart-5"
        />
        <StatCard
          title="Claim Throughput"
          value={`${stats.paidClaims}/${stats.totalClaims}`}
          subtitle="Paid / Total"
          icon={Activity}
          iconColor="bg-chart-2/10 text-chart-2"
        />
      </div>

      {/* Claims Pipeline Visual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-chart-1" />
            Claims Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: "Draft", key: "draft", color: "bg-muted-foreground" },
              { label: "Scrubbing", key: "scrubbing", color: "bg-info" },
              { label: "Ready", key: "ready", color: "bg-chart-1" },
              { label: "Submitted", key: "submitted", color: "bg-info" },
              { label: "Accepted", key: "accepted", color: "bg-chart-2" },
              { label: "Denied", key: "denied", color: "bg-destructive" },
              { label: "Appealed", key: "appealed", color: "bg-warning" },
              { label: "Paid", key: "paid", color: "bg-success" },
            ].map((stage) => {
              const count = stats.claimsByStatus.find((s) => s.status === stage.key)?.count ?? 0;
              const pct = stats.totalClaims > 0 ? (count / stats.totalClaims) * 100 : 0;
              return (
                <div key={stage.key} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground mb-2">{stage.label}</div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid: Recent Claims + Recent Payments */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Claims */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-info" />
                Recent Claims
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {stats.totalClaims} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs pl-6">Claim</TableHead>
                  <TableHead className="text-xs">Patient</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentClaims.map((claim) => (
                  <TableRow key={claim._id}>
                    <TableCell className="pl-6">
                      <div className="font-mono text-xs font-medium">{claim.claimNumber}</div>
                      <div className="text-xs text-muted-foreground">{formatDateShort(claim.dateOfService)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{claim.patientName}</div>
                      <div className="text-xs text-muted-foreground">{claim.insurancePayer}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatCurrencyExact(claim.totalFee)}</TableCell>
                    <TableCell className="pr-6">
                      <Badge variant="secondary" className={`text-xs capitalize ${claimStatusColor(claim.status)}`}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-success" />
                Recent Payments
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {formatCurrency(stats.totalCollections)} collected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs pl-6">Date</TableHead>
                  <TableHead className="text-xs">Payer</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="pl-6">
                      <div className="text-sm">{formatDateShort(payment.paymentDate)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{payment.payerName}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {payment.paymentType.replace("_", " ")}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium text-success">
                      +{formatCurrencyExact(payment.amount)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Badge variant="secondary" className={`text-xs capitalize ${paymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
