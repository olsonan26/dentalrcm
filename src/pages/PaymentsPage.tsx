import { useQuery } from "convex/react";
import {
  BanknoteIcon,
  CheckCircle2,
  Clock,
  Search,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatCurrencyExact, formatDate, paymentStatusColor } from "@/lib/formatters";

export default function PaymentsPage() {
  const practice = useQuery(api.practices.getByOwner);
  const payments = useQuery(
    api.paymentsList.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const [search, setSearch] = useState("");

  if (!practice || payments === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const filtered = (payments ?? []).filter(
    (p) =>
      !search ||
      p.payerName.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (p.checkNumber ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const reconciled = (payments ?? []).filter((p) => p.status === "reconciled");
  const pending = (payments ?? []).filter((p) => p.status === "pending");
  const insurancePayments = (payments ?? []).filter((p) => p.paymentType === "insurance");

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">Insurance payments, patient payments, and ERA posting</p>
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
            <BanknoteIcon className="h-5 w-5 text-info shrink-0" />
            <div>
              <p className="text-xl font-bold">{insurancePayments.length}</p>
              <p className="text-xs text-muted-foreground">Insurance Payments</p>
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
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by payer, patient, or check number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs pl-5">Date</TableHead>
                <TableHead className="text-xs">Payer</TableHead>
                <TableHead className="text-xs">Patient</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Reference</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="pl-5 text-sm">
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
