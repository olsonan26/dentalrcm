import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useMutation, useQuery } from "convex/react";
import {
  Activity,
  DollarSign,
  FileText,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { formatCurrencyExact, formatDate } from "@/lib/formatters";

/* ─── Create Patient Dialog ─── */
function CreatePatientDialog({
  open,
  onOpenChange,
  practiceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceId: string;
}) {
  const createPatient = useMutation(api.patients.create);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male" as "male" | "female" | "other",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    insurancePayer: "",
    insurancePlan: "",
    memberId: "",
    groupNumber: "",
    subscriberName: "",
    subscriberRelation: "",
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (!form.dateOfBirth) {
      toast.error("Date of birth is required");
      return;
    }
    setIsSaving(true);
    try {
      const id = await createPatient({
        practiceId: practiceId as any,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        insurancePayer: form.insurancePayer.trim() || undefined,
        insurancePlan: form.insurancePlan.trim() || undefined,
        memberId: form.memberId.trim() || undefined,
        groupNumber: form.groupNumber.trim() || undefined,
        subscriberName: form.subscriberName.trim() || undefined,
        subscriberRelation: form.subscriberRelation.trim() || undefined,
      });
      toast.success("Patient created");
      onOpenChange(false);
      navigate(`/patients/${id}`);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to create patient");
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
          <DialogDescription>Add a new patient to your practice.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Demographics */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Demographics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="John" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name *</Label>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Smith" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date of Birth *</Label>
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
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="patient@email.com" />
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Address</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Austin" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">State</Label>
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" maxLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">ZIP</Label>
              <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="78701" />
            </div>
          </div>

          <Separator />

          {/* Insurance */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Insurance (Optional)</p>
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
              <Input value={form.memberId} onChange={(e) => set("memberId", e.target.value)} className="font-mono" placeholder="DLT123456789" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Group Number</Label>
              <Input value={form.groupNumber} onChange={(e) => set("groupNumber", e.target.value)} className="font-mono" placeholder="GRP-00001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Subscriber Name</Label>
              <Input value={form.subscriberName} onChange={(e) => set("subscriberName", e.target.value)} placeholder="Same as patient if self" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relationship to Subscriber</Label>
              <Select value={form.subscriberRelation || "self"} onValueChange={(v) => set("subscriberRelation", v)}>
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
          <Button onClick={handleCreate} disabled={isSaving}>
            {isSaving ? "Creating..." : "+ Create Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ─── */
export default function PatientsPage() {
  const { convexUserId } = useAuth();
  const practice = useQuery(api.practices.getByOwner, convexUserId ? { userId: convexUserId } : "skip");
  const patients = useQuery(
    api.patients.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  if (!practice || patients === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const filtered = (patients ?? []).filter(
    (p) =>
      !search ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (p.insurancePayer ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.memberId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = (patients ?? []).reduce((sum, p) => sum + p.balance, 0);
  const withInsurance = (patients ?? []).filter((p) => p.insurancePayer).length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground">Patient roster and insurance information</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> New Patient
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-chart-3 shrink-0" />
            <div>
              <p className="text-xl font-bold">{patients?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-xl font-bold">{withInsurance}</p>
              <p className="text-xs text-muted-foreground">Insured</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-xl font-bold">{formatCurrencyExact(totalBalance)}</p>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-info shrink-0" />
            <div>
              <p className="text-xl font-bold">
                {patients && patients.length > 0
                  ? (patients.reduce((s, p) => s + p.claimsCount, 0) / patients.length).toFixed(1)
                  : "0"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Claims/Patient</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, payer, or member ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs pl-5">Patient</TableHead>
                <TableHead className="text-xs">DOB</TableHead>
                <TableHead className="text-xs">Insurance</TableHead>
                <TableHead className="text-xs">Member ID</TableHead>
                <TableHead className="text-xs text-center">Claims</TableHead>
                <TableHead className="text-xs text-right">Balance</TableHead>
                <TableHead className="text-xs pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => (
                <TableRow
                  key={patient._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/patients/${patient._id}`)}
                >
                  <TableCell className="pl-5">
                    <div>
                      <p className="text-sm font-medium">
                        {patient.lastName}, {patient.firstName}
                      </p>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(patient.dateOfBirth)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{patient.insurancePayer ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{patient.insurancePlan ?? ""}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{patient.memberId ?? "—"}</TableCell>
                  <TableCell className="text-center text-sm">{patient.claimsCount}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-mono text-sm ${
                        patient.balance > 0 ? "font-medium text-warning" : "text-muted-foreground"
                      }`}
                    >
                      {formatCurrencyExact(patient.balance)}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5">
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${
                        patient.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No patients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      {showCreate && practice && (
        <CreatePatientDialog open={showCreate} onOpenChange={setShowCreate} practiceId={practice._id} />
      )}
    </div>
  );
}
