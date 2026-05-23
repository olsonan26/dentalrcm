import { useQuery } from "convex/react";
import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  Stethoscope,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../convex/_generated/api";
import { claimStatusColor, formatDate } from "@/lib/formatters";

/* ─── Color palette ─── */
const COLORS = {
  billed: "oklch(0.65 0.15 250)",   // blue
  collected: "oklch(0.65 0.17 155)", // green
  denied: "oklch(0.65 0.18 25)",     // red/coral
  aging: [
    "oklch(0.70 0.14 155)", // 0-30 green
    "oklch(0.72 0.13 85)",  // 31-60 yellow-green
    "oklch(0.68 0.15 65)",  // 61-90 amber
    "oklch(0.63 0.17 40)",  // 91-120 orange
    "oklch(0.60 0.18 25)",  // 120+ red
  ],
  pie: [
    "oklch(0.60 0.16 250)",
    "oklch(0.65 0.17 155)",
    "oklch(0.68 0.15 65)",
    "oklch(0.63 0.17 40)",
    "oklch(0.60 0.18 25)",
    "oklch(0.55 0.14 300)",
  ],
};

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatCurrencyFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium font-mono">{formatCurrencyFull(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── A/R Aging Report ─── */
function ArAgingReport({ practiceId }: { practiceId: string }) {
  const data = useQuery(api.reports.getArAging, { practiceId: practiceId as any });
  const [expandedBucket, setExpandedBucket] = useState<number | null>(null);

  if (!data) return <ReportSkeleton />;

  const chartData = data.buckets.map((b, i) => ({
    name: b.label,
    amount: b.total,
    count: b.count,
    fill: COLORS.aging[i],
  }));

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total A/R</p>
            <p className="text-2xl font-bold mt-1">{formatCurrencyFull(data.totalAR)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Open Claims</p>
            <p className="text-2xl font-bold mt-1">{data.totalClaims}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">0–30 Days</p>
            <p className="text-2xl font-bold mt-1 text-success">{formatCurrencyFull(data.buckets[0]?.total ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">90+ Days</p>
            <p className="text-2xl font-bold mt-1 text-destructive">
              {formatCurrencyFull((data.buckets[3]?.total ?? 0) + (data.buckets[4]?.total ?? 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">A/R by Aging Bucket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" name="Outstanding" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bucket Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Aging Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.buckets.map((bucket, i) => (
            <div key={i}>
              <button
                onClick={() => setExpandedBucket(expandedBucket === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedBucket === i ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS.aging[i] }}
                  />
                  <span className="text-sm font-medium">{bucket.label}</span>
                  <Badge variant="secondary" className="text-xs">{bucket.count} claims</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <Progress value={bucket.percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-mono font-medium w-28 text-right">
                    {formatCurrencyFull(bucket.total)}
                  </span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{bucket.percentage}%</span>
                </div>
              </button>
              {expandedBucket === i && bucket.claims.length > 0 && (
                <div className="bg-muted/30 px-5 pb-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs pl-10">Claim #</TableHead>
                        <TableHead className="text-xs">Patient</TableHead>
                        <TableHead className="text-xs">Payer</TableHead>
                        <TableHead className="text-xs">DOS</TableHead>
                        <TableHead className="text-xs text-right">Amount</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bucket.claims.map((claim) => (
                        <TableRow key={claim._id}>
                          <TableCell className="pl-10 font-mono text-xs">{claim.claimNumber}</TableCell>
                          <TableCell className="text-sm">{claim.patientName}</TableCell>
                          <TableCell className="text-sm">{claim.insurancePayer}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(claim.dateOfService)}</TableCell>
                          <TableCell className="text-sm font-mono text-right">{formatCurrencyFull(claim.totalFee)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`text-xs capitalize ${claimStatusColor(claim.status)}`}>
                              {claim.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {i < data.buckets.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Collection Trends ─── */
function CollectionTrends({ practiceId }: { practiceId: string }) {
  const data = useQuery(api.reports.getCollectionTrends, { practiceId: practiceId as any });

  if (!data) return <ReportSkeleton />;

  const collectionRate = data.totals.billed > 0
    ? Math.round((data.totals.collected / data.totals.billed) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Billed</p>
            <p className="text-2xl font-bold mt-1">{formatCurrencyFull(data.totals.billed)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold mt-1 text-success">{formatCurrencyFull(data.totals.collected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Denied</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrencyFull(data.totals.denied)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Collection Rate</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{collectionRate}%</p>
              {collectionRate >= 90 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-warning" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Billed vs Collected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.months} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="billed" name="Billed" fill={COLORS.billed} radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill={COLORS.collected} radius={[4, 4, 0, 0]} />
                <Bar dataKey="denied" name="Denied" fill={COLORS.denied} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs pl-5">Month</TableHead>
                <TableHead className="text-xs text-center">Claims</TableHead>
                <TableHead className="text-xs text-right">Billed</TableHead>
                <TableHead className="text-xs text-right">Collected</TableHead>
                <TableHead className="text-xs text-right">Denied</TableHead>
                <TableHead className="text-xs text-right pr-5">Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.months.map((m) => {
                const rate = m.billed > 0 ? Math.round((m.collected / m.billed) * 100) : 0;
                return (
                  <TableRow key={m.month}>
                    <TableCell className="pl-5 font-medium text-sm">{m.label}</TableCell>
                    <TableCell className="text-center text-sm">{m.claimCount}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrencyFull(m.billed)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-success">{formatCurrencyFull(m.collected)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-destructive">{formatCurrencyFull(m.denied)}</TableCell>
                    <TableCell className="text-right pr-5">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${rate >= 90 ? "bg-success/10 text-success" : rate >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}
                      >
                        {rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Payer Performance ─── */
function PayerPerformance({ practiceId }: { practiceId: string }) {
  const data = useQuery(api.reports.getPayerPerformance, { practiceId: practiceId as any });

  if (!data) return <ReportSkeleton />;

  const pieData = data.payers.map((p, i) => ({
    name: p.name,
    value: p.billed,
    fill: COLORS.pie[i % COLORS.pie.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Billed by Payer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name.length > 12 ? name.slice(0, 12) + "…" : name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrencyFull(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Cards */}
        <div className="lg:col-span-2 space-y-3">
          {data.payers.map((payer, i) => (
            <Card key={payer.name}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.pie[i % COLORS.pie.length] }} />
                    <div>
                      <p className="text-sm font-semibold">{payer.name}</p>
                      <p className="text-xs text-muted-foreground">{payer.claimCount} claims</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">{formatCurrencyFull(payer.billed)}</p>
                    <p className="text-xs text-muted-foreground">billed</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Collection Rate</p>
                    <p className={`text-sm font-bold ${payer.collectionRate >= 80 ? "text-success" : payer.collectionRate >= 50 ? "text-warning" : "text-destructive"}`}>
                      {payer.collectionRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clean Rate</p>
                    <p className={`text-sm font-bold ${payer.cleanRate >= 90 ? "text-success" : payer.cleanRate >= 70 ? "text-warning" : "text-destructive"}`}>
                      {payer.cleanRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Denied</p>
                    <p className="text-sm font-bold text-destructive">{payer.deniedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Days to Pay</p>
                    <p className="text-sm font-bold">{payer.avgDaysToPayment || "—"}</p>
                  </div>
                </div>
                <div className="mt-2.5">
                  <Progress value={payer.collectionRate} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Provider Productivity ─── */
function ProviderProductivity({ practiceId }: { practiceId: string }) {
  const data = useQuery(api.reports.getProviderProductivity, { practiceId: practiceId as any });

  if (!data) return <ReportSkeleton />;

  const chartData = data.providers.map((p) => ({
    name: p.name.replace("Dr. ", ""),
    billed: p.totalBilled,
    paid: p.totalPaid,
  }));

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue by Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="billed" name="Billed" fill={COLORS.billed} radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Collected" fill={COLORS.collected} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.providers.map((prov) => (
          <Card key={prov._id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-1/10">
                  <Stethoscope className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{prov.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{prov.specialty.replace("_", " ")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Total Billed</p>
                  <p className="font-bold font-mono">{formatCurrencyFull(prov.totalBilled)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="font-bold font-mono text-success">{formatCurrencyFull(prov.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Claims</p>
                  <p className="font-bold">{prov.totalClaims}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Procedures</p>
                  <p className="font-bold">{prov.totalProcedures}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patients</p>
                  <p className="font-bold">{prov.uniquePatients}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Scrub Score</p>
                  <p className={`font-bold ${prov.avgScrubScore >= 90 ? "text-success" : prov.avgScrubScore > 0 ? "text-warning" : "text-muted-foreground"}`}>
                    {prov.avgScrubScore > 0 ? `${prov.avgScrubScore}%` : "—"}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Collection Rate</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${prov.collectionRate >= 80 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                  >
                    {prov.collectionRate}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Denial Rate</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${prov.denialRate <= 10 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {prov.denialRate}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-28" /></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ReportsPage() {
  const practice = useQuery(api.practices.getByOwner);

  if (!practice) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <ReportSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Financial performance, A/R aging, payer analysis, and provider productivity
        </p>
      </div>

      <Tabs defaultValue="aging">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="aging" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" /> A/R Aging
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Collections
          </TabsTrigger>
          <TabsTrigger value="payers" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Payers
          </TabsTrigger>
          <TabsTrigger value="providers" className="gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" /> Providers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aging" className="pt-4">
          <ArAgingReport practiceId={practice._id} />
        </TabsContent>
        <TabsContent value="trends" className="pt-4">
          <CollectionTrends practiceId={practice._id} />
        </TabsContent>
        <TabsContent value="payers" className="pt-4">
          <PayerPerformance practiceId={practice._id} />
        </TabsContent>
        <TabsContent value="providers" className="pt-4">
          <ProviderProductivity practiceId={practice._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
