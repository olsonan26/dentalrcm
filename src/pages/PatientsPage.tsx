import { useQuery } from "convex/react";
import { Search, Users, DollarSign, FileText, Activity } from "lucide-react";
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
import { formatCurrencyExact, formatDate } from "@/lib/formatters";

export default function PatientsPage() {
  const practice = useQuery(api.practices.getByOwner);
  const patients = useQuery(
    api.patients.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const [search, setSearch] = useState("");

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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <p className="text-sm text-muted-foreground">Patient roster and insurance information</p>
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
                <TableRow key={patient._id}>
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
    </div>
  );
}
