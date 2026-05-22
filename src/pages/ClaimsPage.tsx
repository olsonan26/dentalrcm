import { useQuery } from "convex/react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  claimStatusColor,
  formatCurrencyExact,
  formatDate,
} from "@/lib/formatters";

function AiScrubPanel({ result }: { result: { score: number; issues: Array<{ severity: string; code: string; message: string; suggestion: string }>; scrubDate: string } }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-chart-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">AI Clean Score</span>
            <span className={`text-lg font-bold ${result.score >= 90 ? "text-success" : result.score >= 70 ? "text-warning" : "text-destructive"}`}>
              {result.score}%
            </span>
          </div>
          <Progress
            value={result.score}
            className="h-2 mt-1"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Scrubbed on {formatDate(result.scrubDate)}</p>
      <div className="space-y-2">
        {result.issues.map((issue, i) => (
          <div
            key={i}
            className={`rounded-md border p-3 text-sm ${
              issue.severity === "error"
                ? "border-destructive/30 bg-destructive/5"
                : issue.severity === "warning"
                  ? "border-warning/30 bg-warning/5"
                  : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-start gap-2">
              {issue.severity === "error" ? (
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              ) : issue.severity === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-medium">{issue.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">{issue.code}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClaimDetail({ claimId, onClose }: { claimId: Id<"claims">; onClose: () => void }) {
  const claim = useQuery(api.claims.getById, { claimId });

  if (!claim) return null;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-mono">{claim.claimNumber}</SheetTitle>
            <Badge className={`capitalize ${claimStatusColor(claim.status)}`}>{claim.status}</Badge>
          </div>
        </SheetHeader>

        <div className="space-y-5 pt-2">
          {/* Patient & Provider */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Patient</p>
              <p className="text-sm font-medium">{claim.patientName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Provider</p>
              <p className="text-sm font-medium">{claim.providerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Date of Service</p>
              <p className="text-sm">{formatDate(claim.dateOfService)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Insurance</p>
              <p className="text-sm">{claim.insurancePayer}</p>
            </div>
          </div>

          <Separator />

          {/* Procedures */}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Procedures</p>
            <div className="space-y-2">
              {claim.procedures.map((proc, i) => (
                <div key={i} className="flex items-start justify-between rounded-md border p-3 bg-muted/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {proc.cdtCode}
                      </span>
                      {proc.toothNumber && (
                        <span className="text-xs text-muted-foreground">
                          Tooth #{proc.toothNumber}
                          {proc.surface && ` (${proc.surface})`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{proc.description}</p>
                  </div>
                  <span className="font-mono text-sm font-medium whitespace-nowrap ml-3">
                    {formatCurrencyExact(proc.fee * proc.units)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="text-sm font-semibold">Total</span>
              <span className="font-mono text-base font-bold">{formatCurrencyExact(claim.totalFee)}</span>
            </div>
          </div>

          {/* Financial Summary (if paid) */}
          {claim.paidAmount != null && (
            <>
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Financial Summary</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance Paid</span>
                    <span className="font-mono font-medium text-success">{formatCurrencyExact(claim.paidAmount ?? 0)}</span>
                  </div>
                  {claim.adjustmentAmount != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adjustments</span>
                      <span className="font-mono text-muted-foreground">-{formatCurrencyExact(claim.adjustmentAmount)}</span>
                    </div>
                  )}
                  {claim.patientResponsibility != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patient Responsibility</span>
                      <span className="font-mono">{formatCurrencyExact(claim.patientResponsibility)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Denial Info */}
          {claim.denialReason && (
            <>
              <Separator />
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Denial</span>
                  {claim.denialCode && (
                    <span className="font-mono text-xs text-destructive/80">{claim.denialCode}</span>
                  )}
                </div>
                <p className="text-sm text-destructive/90">{claim.denialReason}</p>
              </div>
            </>
          )}

          {/* AI Scrub Results */}
          {claim.aiScrubResult && (
            <>
              <Separator />
              <AiScrubPanel result={claim.aiScrubResult} />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ClaimsPage() {
  const practice = useQuery(api.practices.getByOwner);
  const claims = useQuery(
    api.claims.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaimId, setSelectedClaimId] = useState<Id<"claims"> | null>(null);

  if (!practice || claims === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const filtered = (claims ?? []).filter((c) => {
    const matchesSearch =
      !search ||
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.patientName.toLowerCase().includes(search.toLowerCase()) ||
      c.insurancePayer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["all", "draft", "scrubbing", "ready", "submitted", "accepted", "denied", "paid", "appealed", "closed"];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Claims</h1>
        <p className="text-sm text-muted-foreground">
          Manage insurance claims across the revenue cycle
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Claims", value: claims?.length ?? 0, icon: FileText, color: "text-info" },
          { label: "Ready to Submit", value: claims?.filter((c) => c.status === "ready").length ?? 0, icon: CheckCircle2, color: "text-chart-1" },
          { label: "Denied", value: claims?.filter((c) => c.status === "denied").length ?? 0, icon: AlertCircle, color: "text-destructive" },
          { label: "AI Scrubbed", value: claims?.filter((c) => c.aiScrubResult).length ?? 0, icon: ShieldCheck, color: "text-chart-1" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search claims, patients, payers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Claims Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs pl-5">Claim #</TableHead>
                <TableHead className="text-xs">Patient</TableHead>
                <TableHead className="text-xs">Provider</TableHead>
                <TableHead className="text-xs">Payer</TableHead>
                <TableHead className="text-xs">DOS</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs">AI Score</TableHead>
                <TableHead className="text-xs pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((claim) => (
                <TableRow
                  key={claim._id}
                  className="cursor-pointer"
                  onClick={() => setSelectedClaimId(claim._id)}
                >
                  <TableCell className="pl-5">
                    <span className="font-mono text-xs font-medium">{claim.claimNumber}</span>
                  </TableCell>
                  <TableCell className="text-sm">{claim.patientName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{claim.providerName}</TableCell>
                  <TableCell className="text-sm">{claim.insurancePayer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(claim.dateOfService)}</TableCell>
                  <TableCell className="text-sm font-mono text-right">{formatCurrencyExact(claim.totalFee)}</TableCell>
                  <TableCell>
                    {claim.aiScrubResult ? (
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${claim.aiScrubResult.score >= 90 ? "bg-success" : claim.aiScrubResult.score >= 70 ? "bg-warning" : "bg-destructive"}`} />
                        <span className="text-xs font-medium">{claim.aiScrubResult.score}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-5">
                    <Badge variant="secondary" className={`text-xs capitalize ${claimStatusColor(claim.status)}`}>
                      {claim.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No claims found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Claim Detail Sheet */}
      {selectedClaimId && (
        <ClaimDetail claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
      )}
    </div>
  );
}
