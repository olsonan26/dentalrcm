import { useQuery, useMutation } from "convex/react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Info,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  claimStatusColor,
  formatCurrencyExact,
  formatDate,
} from "@/lib/formatters";

/* ─── Types ─── */
type Procedure = {
  cdtCode: string;
  description: string;
  toothNumber?: string;
  surface?: string;
  fee: number;
  units: number;
};

/* ─── AI Scrub Panel ─── */
function AiScrubPanel({
  result,
  onRunScrub,
  isRunning,
}: {
  result?: { score: number; issues: Array<{ severity: string; code: string; message: string; suggestion: string }>; scrubDate: string } | null;
  onRunScrub?: () => void;
  isRunning?: boolean;
}) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground mb-1">Not yet scrubbed</p>
        <p className="text-xs text-muted-foreground/70 mb-4 max-w-[280px]">
          Run the AI CoPilot to check for coding errors, missing documentation, and payer-specific rules.
        </p>
        {onRunScrub && (
          <Button onClick={onRunScrub} disabled={isRunning} size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isRunning ? "Scrubbing..." : "Run AI Scrub"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-chart-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">AI Clean Score</span>
            <span
              className={`text-lg font-bold ${
                result.score >= 90 ? "text-success" : result.score >= 70 ? "text-warning" : "text-destructive"
              }`}
            >
              {result.score}%
            </span>
          </div>
          <Progress value={result.score} className="h-2 mt-1" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Scrubbed on {formatDate(result.scrubDate)}</p>
        {onRunScrub && (
          <Button onClick={onRunScrub} disabled={isRunning} variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <Zap className="h-3 w-3" />
            {isRunning ? "Running..." : "Re-scrub"}
          </Button>
        )}
      </div>
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

/* ─── Activity Timeline ─── */
function ActivityTimeline({ claimId }: { claimId: Id<"claims"> }) {
  const activities = useQuery(api.claimActivities.listByClaim, { claimId });
  const addNote = useMutation(api.claimActivities.addNote);
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAdding(true);
    try {
      await addNote({ claimId, content: newNote.trim() });
      setNewNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
    setIsAdding(false);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "status_change": return <ChevronRight className="h-3.5 w-3.5 text-info" />;
      case "scrub_result": return <ShieldCheck className="h-3.5 w-3.5 text-chart-1" />;
      case "appeal_letter": return <FileText className="h-3.5 w-3.5 text-warning" />;
      case "note": return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
      default: return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[60px] text-sm"
        />
        <Button
          size="sm"
          onClick={handleAddNote}
          disabled={!newNote.trim() || isAdding}
          className="shrink-0 self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {activities === undefined ? (
          <Skeleton className="h-20 w-full" />
        ) : activities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No activity yet</p>
        ) : (
          activities.map((a) => (
            <div key={a._id} className="flex items-start gap-3 text-sm">
              <div className="mt-1 shrink-0">{typeIcon(a.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(a._creationTime).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Appeal Letter Panel ─── */
function AppealPanel({ claimId, claimStatus }: { claimId: Id<"claims">; claimStatus: string }) {
  const generateAppeal = useMutation(api.claims.generateAppealLetter);
  const [letter, setLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = claimStatus === "denied" || claimStatus === "appealed";

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAppeal({ claimId });
      setLetter(result);
      toast.success("Appeal letter generated");
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to generate letter");
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    toast.success("Copied to clipboard");
  };

  if (!canGenerate) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Not applicable</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Appeal letters can only be generated for denied claims.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!letter ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <FileText className="h-10 w-10 text-warning/60 mb-3" />
          <p className="text-sm font-medium mb-1">Generate Appeal Letter</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[280px]">
            Auto-generate a professional appeal letter based on the claim details, denial reason, and clinical documentation.
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Appeal Letter"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Appeal Letter</p>
            <Button onClick={handleCopy} variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
          <div className="rounded-md border bg-muted/20 p-4 max-h-[400px] overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{letter}</pre>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} variant="outline" size="sm" className="gap-1">
            <Zap className="h-3 w-3" />
            {isGenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Claim Detail Sheet ─── */
function ClaimDetail({
  claimId,
  onClose,
}: {
  claimId: Id<"claims">;
  onClose: () => void;
}) {
  const claim = useQuery(api.claims.getById, { claimId });
  const updateStatus = useMutation(api.claims.updateStatus);
  const runScrub = useMutation(api.claims.runAiScrub);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const handleScrub = async () => {
    setIsScrubbing(true);
    try {
      await runScrub({ claimId });
      toast.success("AI scrub completed");
    } catch {
      toast.error("Scrub failed");
    }
    setIsScrubbing(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ claimId, status: newStatus as "draft" | "scrubbing" | "ready" | "submitted" | "accepted" | "denied" | "paid" | "appealed" | "closed" });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (!claim) return null;

  // Workflow action based on current status
  const nextAction = (): { label: string; status: string; variant?: "default" | "outline" } | null => {
    switch (claim.status) {
      case "draft": return { label: "Run AI Scrub & Submit", status: "scrubbing" };
      case "scrubbing": return claim.aiScrubResult && claim.aiScrubResult.score >= 70 ? { label: "Mark Ready", status: "ready" } : null;
      case "ready": return { label: "Submit Claim", status: "submitted" };
      case "denied": return { label: "Start Appeal", status: "appealed" };
      default: return null;
    }
  };

  const action = nextAction();

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-mono">{claim.claimNumber}</SheetTitle>
            <Badge className={`capitalize ${claimStatusColor(claim.status)}`}>{claim.status}</Badge>
          </div>
        </SheetHeader>

        {/* Quick action bar */}
        <div className="flex gap-2 py-3">
          {action && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (claim.status === "draft") {
                  handleScrub();
                } else {
                  handleStatusChange(action.status);
                }
              }}
            >
              {claim.status === "draft" && <Sparkles className="h-3.5 w-3.5" />}
              {claim.status === "ready" && <Send className="h-3.5 w-3.5" />}
              {action.label}
            </Button>
          )}
          <Select value={claim.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-auto h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["draft", "scrubbing", "ready", "submitted", "accepted", "denied", "paid", "appealed", "closed"].map((s) => (
                <SelectItem key={s} value={s} className="text-xs capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1 text-xs">Details</TabsTrigger>
            <TabsTrigger value="scrub" className="flex-1 text-xs">
              AI Scrub
              {claim.aiScrubResult && (
                <span className={`ml-1 text-[10px] ${claim.aiScrubResult.score >= 90 ? "text-success" : claim.aiScrubResult.score >= 70 ? "text-warning" : "text-destructive"}`}>
                  {claim.aiScrubResult.score}%
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="appeal" className="flex-1 text-xs">Appeal</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 text-xs">Activity</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-5 pt-2">
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
              {claim.submissionDate && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Submitted</p>
                  <p className="text-sm">{formatDate(claim.submissionDate)}</p>
                </div>
              )}
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

            {/* Financial Summary */}
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

            {/* Notes */}
            {claim.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{claim.notes}</p>
                </div>
              </>
            )}
          </TabsContent>

          {/* AI Scrub Tab */}
          <TabsContent value="scrub" className="pt-2">
            <AiScrubPanel
              result={claim.aiScrubResult ?? undefined}
              onRunScrub={handleScrub}
              isRunning={isScrubbing}
            />
          </TabsContent>

          {/* Appeal Tab */}
          <TabsContent value="appeal" className="pt-2">
            <AppealPanel claimId={claimId} claimStatus={claim.status} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="pt-2">
            <ActivityTimeline claimId={claimId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Create Claim Dialog ─── */
function CreateClaimDialog({
  open,
  onOpenChange,
  practiceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceId: Id<"practices">;
}) {
  const patients = useQuery(api.patients.listByPractice, { practiceId });
  const providers = useQuery(api.providers.listByPractice, { practiceId });
  const createClaim = useMutation(api.claims.create);

  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [dateOfService, setDateOfService] = useState(new Date().toISOString().split("T")[0]);
  const [insurancePayer, setInsurancePayer] = useState("");
  const [notes, setNotes] = useState("");
  const [procedures, setProcedures] = useState<Procedure[]>([
    { cdtCode: "", description: "", fee: 0, units: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProcedure = (index: number, field: keyof Procedure, value: string | number) => {
    const updated = [...procedures];
    (updated[index] as Record<string, unknown>)[field] = value;
    setProcedures(updated);
  };

  const addProcedure = () => {
    setProcedures([...procedures, { cdtCode: "", description: "", fee: 0, units: 1 }]);
  };

  const removeProcedure = (index: number) => {
    if (procedures.length > 1) {
      setProcedures(procedures.filter((_, i) => i !== index));
    }
  };

  const totalFee = procedures.reduce((sum, p) => sum + (p.fee || 0) * (p.units || 1), 0);

  // Auto-fill insurance when patient selected
  const selectedPatient = patients?.find((p) => p._id === patientId);
  const effectiveInsurer = insurancePayer || selectedPatient?.insurancePayer || "";

  const handleSubmit = async () => {
    if (!patientId || !providerId || procedures.some((p) => !p.cdtCode)) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await createClaim({
        practiceId,
        patientId: patientId as Id<"patients">,
        providerId: providerId as Id<"providers">,
        dateOfService,
        procedures: procedures.map((p) => ({
          cdtCode: p.cdtCode,
          description: p.description,
          toothNumber: p.toothNumber || undefined,
          surface: p.surface || undefined,
          fee: Number(p.fee) || 0,
          units: Number(p.units) || 1,
        })),
        insurancePayer: effectiveInsurer,
        notes: notes || undefined,
      });
      toast.success("Claim created as draft");
      onOpenChange(false);
      // Reset form
      setPatientId("");
      setProviderId("");
      setDateOfService(new Date().toISOString().split("T")[0]);
      setInsurancePayer("");
      setNotes("");
      setProcedures([{ cdtCode: "", description: "", fee: 0, units: 1 }]);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to create claim");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Claim</DialogTitle>
          <DialogDescription>Add a new insurance claim. It will be created as a draft.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Patient & Provider */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Patient *</Label>
              <Select value={patientId} onValueChange={(v) => {
                setPatientId(v);
                const pat = patients?.find((p) => p._id === v);
                if (pat?.insurancePayer) setInsurancePayer(pat.insurancePayer);
              }}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.lastName}, {p.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Provider *</Label>
              <Select value={providerId} onValueChange={setProviderId}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers?.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      Dr. {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Insurance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date of Service *</Label>
              <Input type="date" value={dateOfService} onChange={(e) => setDateOfService(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Insurance Payer *</Label>
              <Input
                value={effectiveInsurer}
                onChange={(e) => setInsurancePayer(e.target.value)}
                placeholder="e.g. Delta Dental"
              />
            </div>
          </div>

          <Separator />

          {/* Procedures */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs uppercase tracking-wider">Procedures</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addProcedure} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {procedures.map((proc, i) => (
                <div key={i} className="rounded-md border p-3 space-y-2">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">CDT Code *</Label>
                      <Input
                        value={proc.cdtCode}
                        onChange={(e) => updateProcedure(i, "cdtCode", e.target.value)}
                        placeholder="D0120"
                        className="font-mono text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Description</Label>
                      <Input
                        value={proc.description}
                        onChange={(e) => updateProcedure(i, "description", e.target.value)}
                        placeholder="Periodic oral evaluation"
                        className="text-sm h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Tooth #</Label>
                      <Input
                        value={proc.toothNumber || ""}
                        onChange={(e) => updateProcedure(i, "toothNumber", e.target.value)}
                        placeholder="—"
                        className="text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Surface</Label>
                      <Input
                        value={proc.surface || ""}
                        onChange={(e) => updateProcedure(i, "surface", e.target.value)}
                        placeholder="—"
                        className="text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Fee ($)</Label>
                      <Input
                        type="number"
                        value={proc.fee || ""}
                        onChange={(e) => updateProcedure(i, "fee", parseFloat(e.target.value) || 0)}
                        className="font-mono text-sm h-8"
                      />
                    </div>
                    <div className="flex gap-1 items-end">
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground">Units</Label>
                        <Input
                          type="number"
                          value={proc.units}
                          onChange={(e) => updateProcedure(i, "units", parseInt(e.target.value) || 1)}
                          min={1}
                          className="text-sm h-8"
                        />
                      </div>
                      {procedures.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProcedure(i)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2 pt-2 border-t">
              <span className="text-sm font-semibold">Total: {formatCurrencyExact(totalFee)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Clinical Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical narrative, supporting documentation notes..."
              className="min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1.5">
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Bulk Action Bar ─── */
function BulkActionBar({
  count,
  onStatusChange,
  onClearSelection,
}: {
  count: number;
  onStatusChange: (status: string) => void;
  onClearSelection: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground shadow-lg rounded-xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in">
      <span className="text-sm font-medium">{count} selected</span>
      <Separator orientation="vertical" className="h-5 bg-primary-foreground/20" />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => onStatusChange("submitted")}>
          <Send className="h-3 w-3 mr-1" /> Submit
        </Button>
        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => onStatusChange("ready")}>
          <CheckCircle2 className="h-3 w-3 mr-1" /> Ready
        </Button>
        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => onStatusChange("closed")}>
          Close
        </Button>
      </div>
      <Button size="sm" variant="ghost" className="h-7 text-xs text-primary-foreground/80 hover:text-primary-foreground" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}

/* ─── Main Claims Page ─── */
export default function ClaimsPage() {
  const practice = useQuery(api.practices.getByOwner);
  const claims = useQuery(
    api.claims.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const bulkUpdate = useMutation(api.claims.bulkUpdateStatus);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClaimId, setSelectedClaimId] = useState<Id<"claims"> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filtered = useMemo(() => {
    return (claims ?? []).filter((c) => {
      const matchesSearch =
        !search ||
        c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.insurancePayer.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, search, statusFilter]);

  const statuses = ["all", "draft", "scrubbing", "ready", "submitted", "accepted", "denied", "paid", "appealed", "closed"];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c._id)));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    try {
      const ids = Array.from(selectedIds) as Id<"claims">[];
      const result = await bulkUpdate({ claimIds: ids, status: status as "draft" | "submitted" | "ready" | "closed" });
      toast.success(`${result.updated} claims updated to ${status}`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Bulk update failed");
    }
  };

  if (!practice || claims === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Claims</h1>
          <p className="text-sm text-muted-foreground">
            Manage insurance claims across the revenue cycle
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          New Claim
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: claims.length, icon: FileText, color: "text-info" },
          { label: "Draft", value: claims.filter((c) => c.status === "draft").length, icon: Clock, color: "text-muted-foreground" },
          { label: "Ready", value: claims.filter((c) => c.status === "ready").length, icon: CheckCircle2, color: "text-chart-1" },
          { label: "Denied", value: claims.filter((c) => c.status === "denied").length, icon: AlertCircle, color: "text-destructive" },
          { label: "AI Scrubbed", value: claims.filter((c) => c.aiScrubResult).length, icon: ShieldCheck, color: "text-chart-1" },
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
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-3">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-xs">Claim #</TableHead>
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
                  className={`cursor-pointer ${selectedIds.has(claim._id) ? "bg-primary/5" : ""}`}
                  onClick={() => setSelectedClaimId(claim._id)}
                >
                  <TableCell className="pl-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(claim._id)}
                      onCheckedChange={() => toggleSelect(claim._id)}
                    />
                  </TableCell>
                  <TableCell>
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
                        <div
                          className={`h-2 w-2 rounded-full ${
                            claim.aiScrubResult.score >= 90
                              ? "bg-success"
                              : claim.aiScrubResult.score >= 70
                                ? "bg-warning"
                                : "bg-destructive"
                          }`}
                        />
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
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No claims found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Claim Detail Sheet */}
      {selectedClaimId && (
        <ClaimDetail claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
      )}

      {/* Create Claim Dialog */}
      {showCreateDialog && (
        <CreateClaimDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          practiceId={practice._id}
        />
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onStatusChange={handleBulkStatusChange}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}
    </div>
  );
}
