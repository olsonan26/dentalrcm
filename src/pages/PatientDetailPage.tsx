import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { claimStatusColor, formatCurrencyExact, formatDate } from "@/lib/formatters";

/* ─── Edit Patient Dialog ─── */
function EditPatientDialog({
  open,
  onOpenChange,
  patient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: {
    _id: Id<"patients">;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    insurancePayer?: string;
    insurancePlan?: string;
    memberId?: string;
    groupNumber?: string;
    subscriberName?: string;
    subscriberRelation?: string;
    status: string;
  };
}) {
  const updatePatient = useMutation(api.patients.update);
  const [form, setForm] = useState({
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender as "male" | "female" | "other",
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    zip: patient.zip,
    insurancePayer: patient.insurancePayer ?? "",
    insurancePlan: patient.insurancePlan ?? "",
    memberId: patient.memberId ?? "",
    groupNumber: patient.groupNumber ?? "",
    subscriberName: patient.subscriberName ?? "",
    subscriberRelation: patient.subscriberRelation ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.firstName || !form.lastName) {
      toast.error("First and last name are required");
      return;
    }
    setIsSaving(true);
    try {
      await updatePatient({
        patientId: patient._id,
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        insurancePayer: form.insurancePayer || undefined,
        insurancePlan: form.insurancePlan || undefined,
        memberId: form.memberId || undefined,
        groupNumber: form.groupNumber || undefined,
        subscriberName: form.subscriberName || undefined,
        subscriberRelation: form.subscriberRelation || undefined,
      });
      toast.success("Patient updated");
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to update");
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>Update patient demographics and insurance information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Demographics */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Demographics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name *</Label>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Address</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-1.5 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">State</Label>
                <Input value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} />
              </div>
              <div>
                <Label className="text-xs">ZIP</Label>
                <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Insurance */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Insurance</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Insurance Payer</Label>
              <Input value={form.insurancePayer} onChange={(e) => set("insurancePayer", e.target.value)} placeholder="e.g. Delta Dental" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Plan Name</Label>
              <Input value={form.insurancePlan} onChange={(e) => set("insurancePlan", e.target.value)} placeholder="e.g. PPO Premier" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Member ID</Label>
              <Input value={form.memberId} onChange={(e) => set("memberId", e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Group Number</Label>
              <Input value={form.groupNumber} onChange={(e) => set("groupNumber", e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Subscriber Name</Label>
              <Input value={form.subscriberName} onChange={(e) => set("subscriberName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relationship to Subscriber</Label>
              <Select value={form.subscriberRelation} onValueChange={(v) => set("subscriberRelation", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Eligibility Verification Panel ─── */
type EligibilityResult = {
  verified: boolean;
  verificationDate: string;
  eligible: boolean;
  payer: string;
  plan: string;
  memberId: string;
  groupNumber: string;
  subscriberName: string;
  subscriberRelation: string;
  effectiveDate: string;
  terminationDate: string | null;
  coverageDetails: {
    annualMaximum: number;
    annualUsed: number;
    annualRemaining: number;
    deductible: number;
    deductibleMet: boolean;
    preventiveCoverage: number;
    basicCoverage: number;
    majorCoverage: number;
    orthodonticCoverage: number;
    waitingPeriods: {
      preventive: string;
      basic: string;
      major: string;
      orthodontic: string;
    };
  };
  ineligibilityReason: string | null;
};

function EligibilityPanel({ patientId, hasInsurance }: { patientId: Id<"patients">; hasInsurance: boolean }) {
  const checkEligibility = useMutation(api.patients.checkEligibility);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      const r = await checkEligibility({ patientId });
      setResult(r as EligibilityResult);
      toast.success("Eligibility verified");
    } catch (e: unknown) {
      toast.error((e as Error).message || "Verification failed");
    }
    setIsChecking(false);
  };

  if (!hasInsurance) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No Insurance on File</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Add insurance information to the patient record to run eligibility verification.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShieldCheck className="h-12 w-12 text-chart-1/40 mb-3" />
        <p className="text-sm font-medium mb-1">Insurance Eligibility Verification</p>
        <p className="text-xs text-muted-foreground mb-5 max-w-sm">
          Verify the patient's insurance coverage, benefits, remaining maximums, and deductible status in real time.
        </p>
        <Button onClick={handleCheck} disabled={isChecking} className="gap-2">
          <ShieldCheck className="h-4 w-4" />
          {isChecking ? "Verifying..." : "Verify Eligibility"}
        </Button>
      </div>
    );
  }

  const cov = result.coverageDetails;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div
        className={`rounded-lg border p-4 ${
          result.eligible
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        }`}
      >
        <div className="flex items-center gap-3">
          {result.eligible ? (
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
          ) : (
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {result.eligible ? "Active — Patient is Eligible" : "Ineligible — Coverage Issue"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified on {formatDate(result.verificationDate)}
              {!result.eligible && result.ineligibilityReason && ` · ${result.ineligibilityReason}`}
            </p>
          </div>
          <Button onClick={handleCheck} disabled={isChecking} variant="ghost" size="sm" className="ml-auto h-7 text-xs gap-1">
            <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
            Re-verify
          </Button>
        </div>
      </div>

      {/* Plan Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Payer</p>
          <p className="text-sm font-medium">{result.payer}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Plan</p>
          <p className="text-sm font-medium">{result.plan}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Member ID</p>
          <p className="text-sm font-mono">{result.memberId}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Group #</p>
          <p className="text-sm font-mono">{result.groupNumber}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Subscriber</p>
          <p className="text-sm">{result.subscriberName} ({result.subscriberRelation})</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Effective Date</p>
          <p className="text-sm">{formatDate(result.effectiveDate)}</p>
        </div>
      </div>

      <Separator />

      {/* Benefits */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Annual Benefits</p>
        <div className="space-y-3">
          {/* Annual Max Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm">Annual Maximum</span>
              <span className="text-sm font-mono font-medium">
                {formatCurrencyExact(cov.annualRemaining)} remaining
              </span>
            </div>
            <Progress value={(cov.annualUsed / cov.annualMaximum) * 100} className="h-2.5" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                Used: {formatCurrencyExact(cov.annualUsed)}
              </span>
              <span className="text-xs text-muted-foreground">
                Max: {formatCurrencyExact(cov.annualMaximum)}
              </span>
            </div>
          </div>

          {/* Deductible */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm">Deductible ({formatCurrencyExact(cov.deductible)})</span>
            <Badge variant="secondary" className={cov.deductibleMet ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
              {cov.deductibleMet ? "Met" : "Not Met"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Coverage Percentages */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Coverage Levels</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Preventive", pct: cov.preventiveCoverage, desc: "Exams, cleanings, X-rays" },
            { label: "Basic", pct: cov.basicCoverage, desc: "Fillings, extractions" },
            { label: "Major", pct: cov.majorCoverage, desc: "Crowns, bridges, dentures" },
            { label: "Orthodontic", pct: cov.orthodonticCoverage, desc: "Braces, aligners" },
          ].map((item) => (
            <div key={item.label} className="rounded-md border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={`text-sm font-bold ${item.pct > 0 ? "text-chart-1" : "text-muted-foreground"}`}>
                  {item.pct}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Waiting Periods */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Waiting Periods</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(cov.waitingPeriods).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-muted-foreground capitalize">{key}</p>
              <p className={`text-sm font-medium mt-0.5 ${value === "None" ? "text-success" : "text-warning"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Patient Detail Page ─── */
export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = useQuery(api.patients.getById, id ? { patientId: id as Id<"patients"> } : "skip");
  const [showEdit, setShowEdit] = useState(false);

  if (patient === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (patient === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-lg font-medium text-muted-foreground">Patient not found</p>
        <Button variant="outline" onClick={() => navigate("/patients")} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Patients
        </Button>
      </div>
    );
  }

  const age = (() => {
    const dob = new Date(patient.dateOfBirth);
    const today = new Date();
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  })();

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {patient.lastName}, {patient.firstName}
              </h1>
              <Badge
                variant="secondary"
                className={`capitalize ${
                  patient.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {patient.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {patient.gender === "male" ? "Male" : patient.gender === "female" ? "Female" : "Other"} · {age} years old · DOB: {formatDate(patient.dateOfBirth)}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEdit(true)} className="gap-1.5 shrink-0">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Billed", value: formatCurrencyExact(patient.summary.totalBilled), icon: FileText, color: "text-info" },
          { label: "Total Paid", value: formatCurrencyExact(patient.summary.totalPaid), icon: DollarSign, color: "text-success" },
          { label: "Outstanding", value: formatCurrencyExact(patient.balance), icon: Clock, color: "text-warning" },
          { label: "Active Claims", value: String(patient.summary.activeClaims), icon: Activity, color: "text-chart-1" },
          { label: "Total Claims", value: String(patient.summary.totalClaims), icon: CreditCard, color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">Claims ({patient.summary.totalClaims})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({patient.summary.totalPayments})</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-5 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{patient.email}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>
                    {patient.address}<br />
                    {patient.city}, {patient.state} {patient.zip}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>DOB: {formatDate(patient.dateOfBirth)} ({age} years old)</span>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" /> Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.insurancePayer ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Payer</p>
                        <p className="font-medium">{patient.insurancePayer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Plan</p>
                        <p className="font-medium">{patient.insurancePlan || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Member ID</p>
                        <p className="font-mono">{patient.memberId || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Group #</p>
                        <p className="font-mono">{patient.groupNumber || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Subscriber</p>
                        <p>{patient.subscriberName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Relationship</p>
                        <p className="capitalize">{patient.subscriberRelation || "—"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No insurance on file</p>
                    <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="mt-2 text-xs">
                      Add Insurance
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Claims</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs pl-5">Claim #</TableHead>
                    <TableHead className="text-xs">Date of Service</TableHead>
                    <TableHead className="text-xs">Provider</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.claims.slice(0, 5).map((claim) => (
                    <TableRow
                      key={claim._id}
                      className="cursor-pointer"
                      onClick={() => navigate("/claims")}
                    >
                      <TableCell className="pl-5 font-mono text-xs font-medium">{claim.claimNumber}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(claim.dateOfService)}</TableCell>
                      <TableCell className="text-sm">{claim.providerName}</TableCell>
                      <TableCell className="text-sm font-mono text-right">{formatCurrencyExact(claim.totalFee)}</TableCell>
                      <TableCell className="pr-5">
                        <Badge variant="secondary" className={`text-xs capitalize ${claimStatusColor(claim.status)}`}>
                          {claim.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patient.claims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No claims yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="pt-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs pl-5">Claim #</TableHead>
                    <TableHead className="text-xs">Date of Service</TableHead>
                    <TableHead className="text-xs">Provider</TableHead>
                    <TableHead className="text-xs">Payer</TableHead>
                    <TableHead className="text-xs">Procedures</TableHead>
                    <TableHead className="text-xs text-right">Billed</TableHead>
                    <TableHead className="text-xs text-right">Paid</TableHead>
                    <TableHead className="text-xs pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.claims.map((claim) => (
                    <TableRow key={claim._id} className="cursor-pointer" onClick={() => navigate("/claims")}>
                      <TableCell className="pl-5 font-mono text-xs font-medium">{claim.claimNumber}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(claim.dateOfService)}</TableCell>
                      <TableCell className="text-sm">{claim.providerName}</TableCell>
                      <TableCell className="text-sm">{claim.insurancePayer}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {claim.procedures.slice(0, 3).map((p, i) => (
                            <span key={i} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">
                              {p.cdtCode}
                            </span>
                          ))}
                          {claim.procedures.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{claim.procedures.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-right">{formatCurrencyExact(claim.totalFee)}</TableCell>
                      <TableCell className="text-sm font-mono text-right">
                        {claim.paidAmount != null ? formatCurrencyExact(claim.paidAmount) : "—"}
                      </TableCell>
                      <TableCell className="pr-5">
                        <Badge variant="secondary" className={`text-xs capitalize ${claimStatusColor(claim.status)}`}>
                          {claim.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patient.claims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No claims found for this patient
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Claims Summary */}
          {patient.summary.totalDenied > 0 && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {formatCurrencyExact(patient.summary.totalDenied)} in denied claims
                </span>
              </div>
              <p className="text-xs text-destructive/80 mt-1">
                {patient.claims.filter((c) => c.status === "denied").length} claim(s) denied — review and appeal where appropriate.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="pt-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs pl-5">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Payer</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="pl-5 text-sm text-muted-foreground">
                        {formatDate(payment.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {payment.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{payment.payerName}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.eraReferenceNumber || payment.checkNumber || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-right font-medium text-success">
                        {formatCurrencyExact(payment.amount)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <Badge
                          variant="secondary"
                          className={`text-xs capitalize ${
                            payment.status === "reconciled"
                              ? "bg-success/10 text-success"
                              : payment.status === "posted"
                                ? "bg-chart-1/10 text-chart-1"
                                : "bg-warning/10 text-warning"
                          }`}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patient.payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No payments found for this patient
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="pt-2">
          <Card>
            <CardContent className="p-5">
              <EligibilityPanel patientId={patient._id} hasInsurance={!!patient.insurancePayer} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {showEdit && (
        <EditPatientDialog open={showEdit} onOpenChange={setShowEdit} patient={patient} />
      )}
    </div>
  );
}
