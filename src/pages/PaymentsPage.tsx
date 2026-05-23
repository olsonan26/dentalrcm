import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeftRight,
  BanknoteIcon,
  CheckCircle2,
  Clock,
  FileCheck,
  Loader2,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { formatCurrencyExact, formatDate, paymentStatusColor } from "@/lib/formatters";

/* ─── Post Payment Dialog ─── */
function PostPaymentDialog({
  open,
  onOpenChange,
  practiceId,
  patients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practiceId: Id<"practices">;
  patients: Array<{ _id: Id<"patients">; firstName: string; lastName: string }>;
}) {
  const createPayment = useMutation(api.payments.create);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentType: "insurance" as "insurance" | "patient" | "adjustment",
    payerName: "",
    checkNumber: "",
    eraReferenceNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.amount || !form.payerName) return;
    setLoading(true);
    try {
      await createPayment({
        practiceId,
        patientId: form.patientId as Id<"patients">,
        paymentDate: form.paymentDate,
        amount: parseFloat(form.amount),
        paymentType: form.paymentType,
        payerName: form.payerName,
        checkNumber: form.checkNumber || undefined,
        eraReferenceNumber: form.eraReferenceNumber || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Payment posted successfully");
      onOpenChange(false);
      setForm({
        patientId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
        paymentType: "insurance",
        payerName: "",
        checkNumber: "",
        eraReferenceNumber: "",
        notes: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to post payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post Payment</DialogTitle>
          <DialogDescription>
            Record an insurance payment, patient payment, or adjustment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Patient *</Label>
              <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.lastName}, {p.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Type *</Label>
              <Select
                value={form.paymentType}
                onValueChange={(v) => setForm({ ...form, paymentType: v as any })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payer Name *</Label>
              <Input
                placeholder="e.g. Delta Dental"
                value={form.payerName}
                onChange={(e) => setForm({ ...form, payerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Check / EFT Number</Label>
              <Input
                placeholder="e.g. EFT-12345"
                value={form.checkNumber}
                onChange={(e) => setForm({ ...form, checkNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ERA Reference</Label>
              <Input
                placeholder="e.g. ERA-2026-0001"
                value={form.eraReferenceNumber}
                onChange={(e) => setForm({ ...form, eraReferenceNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.patientId || !form.amount || !form.payerName}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Post Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── All Payments Tab ─── */
function AllPaymentsTab({
  payments,
  search,
  setSearch,
  selectedIds,
  toggleSelection,
  toggleAll,
  allSelected,
}: {
  payments: any[];
  search: string;
  setSearch: (s: string) => void;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  toggleAll: () => void;
  allSelected: boolean;
}) {
  const filtered = payments.filter(
    (p: any) =>
      !search ||
      p.payerName.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (p.checkNumber ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by payer, patient, or check number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allSelected && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Payer</TableHead>
                <TableHead className="text-xs">Patient</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Reference</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment: any) => (
                <TableRow key={payment._id} className={selectedIds.has(payment._id) ? "bg-primary/5" : ""}>
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selectedIds.has(payment._id)}
                      onCheckedChange={() => toggleSelection(payment._id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{payment.payerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.patientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {payment.paymentType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {payment.checkNumber || payment.eraReferenceNumber || "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-medium text-success">
                    +{formatCurrencyExact(payment.amount)}
                  </TableCell>
                  <TableCell className="pr-5">
                    <Badge variant="secondary" className={`text-xs capitalize ${paymentStatusColor(payment.status)}`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Reconciliation Tab ─── */
function ReconciliationTab({ practiceId }: { practiceId: Id<"practices"> }) {
  const unreconciled = useQuery(api.payments.getUnreconciled, { practiceId });
  const batchReconcile = useMutation(api.payments.batchReconcile);
  const updateStatus = useMutation(api.payments.updateStatus);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  if (unreconciled === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchReconcile = async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    try {
      const result = await batchReconcile({
        paymentIds: Array.from(selectedIds) as Id<"payments">[],
      });
      toast.success(`Reconciled ${result.reconciled} payment(s)`);
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to reconcile");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleReconcile = async (paymentId: Id<"payments">) => {
    try {
      await updateStatus({ paymentId, status: "reconciled" });
      toast.success("Payment reconciled");
    } catch (err: any) {
      toast.error(err.message || "Failed to reconcile");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {unreconciled.length} posted payment(s) awaiting reconciliation
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button onClick={handleBatchReconcile} disabled={loading} size="sm">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            <FileCheck className="h-4 w-4 mr-1" />
            Reconcile {selectedIds.size} Selected
          </Button>
        )}
      </div>

      {unreconciled.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
            <p className="text-sm font-medium">All Caught Up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No payments pending reconciliation
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={selectedIds.size === unreconciled.length && unreconciled.length > 0}
                      onCheckedChange={() => {
                        if (selectedIds.size === unreconciled.length) {
                          setSelectedIds(new Set());
                        } else {
                          setSelectedIds(new Set(unreconciled.map((p: any) => p._id)));
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Payer</TableHead>
                  <TableHead className="text-xs">Patient</TableHead>
                  <TableHead className="text-xs">Claim</TableHead>
                  <TableHead className="text-xs">Reference</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unreconciled.map((payment: any) => (
                  <TableRow key={payment._id} className={selectedIds.has(payment._id) ? "bg-primary/5" : ""}>
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedIds.has(payment._id)}
                        onCheckedChange={() => toggleSelection(payment._id)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="text-sm font-medium">{payment.payerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{payment.patientName}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.claimNumber ? (
                        <Badge variant="outline" className="text-xs">{payment.claimNumber}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.checkNumber || payment.eraReferenceNumber || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium text-success">
                      +{formatCurrencyExact(payment.amount)}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleSingleReconcile(payment._id)}
                      >
                        Reconcile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function PaymentsPage() {
  const practice = useQuery(api.practices.getByOwner);
  const payments = useQuery(
    api.paymentsList.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const patients = useQuery(
    api.patients.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );

  const batchPost = useMutation(api.payments.batchPost);
  const [search, setSearch] = useState("");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  if (!practice || payments === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalAmount = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const reconciled = (payments ?? []).filter((p) => p.status === "reconciled");
  const pending = (payments ?? []).filter((p) => p.status === "pending");
  const posted = (payments ?? []).filter((p) => p.status === "posted");

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredPayments = (payments ?? []).filter(
    (p) =>
      !search ||
      p.payerName.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (p.checkNumber ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filteredPayments.length > 0 && filteredPayments.every((p) => selectedIds.has(p._id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPayments.map((p) => p._id)));
    }
  };

  const handleBatchPost = async () => {
    const pendingSelected = Array.from(selectedIds).filter((id) => {
      const p = (payments ?? []).find((pay) => pay._id === id);
      return p && p.status === "pending";
    });
    if (pendingSelected.length === 0) {
      toast.error("No pending payments selected");
      return;
    }
    setBatchLoading(true);
    try {
      const result = await batchPost({
        paymentIds: pendingSelected as Id<"payments">[],
      });
      toast.success(`Batch posted ${result.posted} payment(s)`);
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Batch post failed");
    } finally {
      setBatchLoading(false);
    }
  };

  const selectedPendingCount = Array.from(selectedIds).filter((id) => {
    const p = (payments ?? []).find((pay) => pay._id === id);
    return p && p.status === "pending";
  }).length;

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Insurance payments, patient payments, ERA posting &amp; reconciliation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && selectedPendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchPost}
              disabled={batchLoading}
            >
              {batchLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Batch Post ({selectedPendingCount})
            </Button>
          )}
          <Button size="sm" onClick={() => setShowPostDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Post Payment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-xl font-bold">{formatCurrencyExact(totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BanknoteIcon className="h-5 w-5 text-info shrink-0" />
            <div>
              <p className="text-xl font-bold">{posted.length}</p>
              <p className="text-xs text-muted-foreground">Posted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-xl font-bold">{reconciled.length}</p>
              <p className="text-xs text-muted-foreground">Reconciled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <BanknoteIcon className="h-3.5 w-3.5" /> All Payments
          </TabsTrigger>
          <TabsTrigger value="reconcile" className="gap-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5" /> Reconciliation
            {posted.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {posted.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          <AllPaymentsTab
            payments={payments ?? []}
            search={search}
            setSearch={setSearch}
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
            toggleAll={toggleAll}
            allSelected={allSelected}
          />
        </TabsContent>
        <TabsContent value="reconcile" className="pt-4">
          <ReconciliationTab practiceId={practice._id} />
        </TabsContent>
      </Tabs>

      {/* Post Payment Dialog */}
      {patients && (
        <PostPaymentDialog
          open={showPostDialog}
          onOpenChange={setShowPostDialog}
          practiceId={practice._id}
          patients={patients.map((p: any) => ({
            _id: p._id,
            firstName: p.firstName,
            lastName: p.lastName,
          }))}
        />
      )}
    </div>
  );
}
