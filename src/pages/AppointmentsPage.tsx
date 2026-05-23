import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useMutation, useQuery } from "convex/react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { formatCurrency } from "@/lib/formatters";

const appointmentTypes = [
  { value: "exam", label: "Exam" },
  { value: "cleaning", label: "Cleaning" },
  { value: "filling", label: "Filling" },
  { value: "crown", label: "Crown" },
  { value: "root_canal", label: "Root Canal" },
  { value: "extraction", label: "Extraction" },
  { value: "implant", label: "Implant" },
  { value: "orthodontics", label: "Orthodontics" },
  { value: "whitening", label: "Whitening" },
  { value: "emergency", label: "Emergency" },
  { value: "consultation", label: "Consultation" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "other", label: "Other" },
];

function statusColor(status: string) {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    checked_in: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    no_show: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
  };
  return colors[status] || colors.scheduled;
}

function typeColor(type: string) {
  const colors: Record<string, string> = {
    emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    root_canal: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    crown: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    extraction: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    implant: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  return colors[type] || "bg-muted text-muted-foreground";
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function CreateAppointmentDialog({
  practiceId,
  patients,
  providers,
}: {
  practiceId: Id<"practices">;
  patients: Array<{ _id: Id<"patients">; firstName: string; lastName: string }>;
  providers: Array<{ _id: Id<"providers">; firstName: string; lastName: string }>;
}) {
  const [open, setOpen] = useState(false);
  const create = useMutation(api.appointments.create);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    patientId: "",
    providerId: "",
    title: "",
    date: today,
    startTime: "09:00",
    endTime: "09:45",
    type: "exam",
    notes: "",
    estimatedCost: "",
  });

  const handleCreate = async () => {
    if (!form.patientId || !form.providerId || !form.title) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await create({
        practiceId,
        patientId: form.patientId as Id<"patients">,
        providerId: form.providerId as Id<"providers">,
        title: form.title,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        type: form.type as any,
        notes: form.notes || undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
      });
      toast.success("Appointment scheduled");
      setOpen(false);
      setForm({
        patientId: "",
        providerId: "",
        title: "",
        date: today,
        startTime: "09:00",
        endTime: "09:45",
        type: "exam",
        notes: "",
        estimatedCost: "",
      });
    } catch {
      toast.error("Failed to create appointment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 size-4" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="size-5" />
            Schedule Appointment
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select value={form.patientId} onValueChange={(v) => setForm((f) => ({ ...f, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Provider *</Label>
              <Select value={form.providerId} onValueChange={(v) => setForm((f) => ({ ...f, providerId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      Dr. {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Crown Prep — #14" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Est. Cost</Label>
              <Input type="number" value={form.estimatedCost} onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))} placeholder="$0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentCard({
  appointment,
  onStatusChange,
}: {
  appointment: any;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
      {/* Time block */}
      <div className="flex flex-col items-center rounded-lg bg-muted px-3 py-2 text-center min-w-[72px]">
        <span className="text-xs font-medium text-muted-foreground">
          {formatTime(appointment.startTime)}
        </span>
        <div className="my-0.5 h-3 w-px bg-border" />
        <span className="text-xs text-muted-foreground">
          {formatTime(appointment.endTime)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-sm leading-tight">{appointment.title}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3" />
                {appointment.patientName}
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="size-3" />
                {appointment.providerName}
              </span>
              {appointment.estimatedCost > 0 && (
                <span className="font-medium text-foreground">
                  {formatCurrency(appointment.estimatedCost)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {appointment.insuranceVerified && (
              <div className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-3.5" />
              </div>
            )}
            <Badge variant="secondary" className={typeColor(appointment.type)}>
              {appointmentTypes.find((t) => t.value === appointment.type)?.label || appointment.type}
            </Badge>
            <Badge variant="secondary" className={statusColor(appointment.status)}>
              {appointment.status.replace("_", " ")}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {appointment.status === "scheduled" && (
                  <DropdownMenuItem onClick={() => onStatusChange(appointment._id, "confirmed")}>
                    <Check className="size-4 mr-2" /> Confirm
                  </DropdownMenuItem>
                )}
                {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                  <DropdownMenuItem onClick={() => onStatusChange(appointment._id, "checked_in")}>
                    <MapPin className="size-4 mr-2" /> Check In
                  </DropdownMenuItem>
                )}
                {appointment.status === "checked_in" && (
                  <DropdownMenuItem onClick={() => onStatusChange(appointment._id, "in_progress")}>
                    <Clock className="size-4 mr-2" /> Start
                  </DropdownMenuItem>
                )}
                {appointment.status === "in_progress" && (
                  <DropdownMenuItem onClick={() => onStatusChange(appointment._id, "completed")}>
                    <Check className="size-4 mr-2" /> Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                  <DropdownMenuItem className="text-destructive" onClick={() => onStatusChange(appointment._id, "cancelled")}>
                    <X className="size-4 mr-2" /> Cancel
                  </DropdownMenuItem>
                )}
                {appointment.status !== "no_show" && appointment.status !== "completed" && appointment.status !== "cancelled" && (
                  <DropdownMenuItem className="text-destructive" onClick={() => onStatusChange(appointment._id, "no_show")}>
                    <X className="size-4 mr-2" /> No Show
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {appointment.notes && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">{appointment.notes}</p>
        )}
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const { convexUserId } = useAuth();
  const practice = useQuery(api.practices.getByOwner, convexUserId ? { userId: convexUserId } : "skip");
  const patients = useQuery(
    api.patients.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const providers = useQuery(
    api.providers.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const stats = useQuery(
    api.appointments.getStats,
    practice ? { practiceId: practice._id } : "skip"
  );

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const appointments = useQuery(
    api.appointments.listByPractice,
    practice ? { practiceId: practice._id, date: selectedDate } : "skip"
  );
  const allAppointments = useQuery(
    api.appointments.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const updateStatus = useMutation(api.appointments.updateStatus);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id: id as Id<"appointments">, status: status as any });
      toast.success(`Appointment ${status.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  // Navigate dates
  const changeDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const goToToday = () => setSelectedDate(new Date().toISOString().split("T")[0]);
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // Week view data
  const weekDates = useMemo(() => {
    const start = new Date(selectedDate + "T12:00:00");
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek); // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [selectedDate]);

  if (!practice) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        {patients && providers && (
          <CreateAppointmentDialog
            practiceId={practice._id}
            patients={patients}
            providers={providers}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CalendarDays className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.todayCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.upcomingCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Check className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.completedCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <X className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.cancelledCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Cancelled / No-Show</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="day" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="day">Day View</TabsTrigger>
            <TabsTrigger value="week">Week View</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" onClick={() => changeDate(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant={isToday ? "default" : "outline"} size="sm" className="min-w-32" onClick={goToToday}>
              {isToday ? "Today" : formatDateDisplay(selectedDate)}
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => changeDate(1)}>
              <ChevronRight className="size-4" />
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto h-8"
            />
          </div>
        </div>

        <TabsContent value="day" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="size-4" />
                {formatDateDisplay(selectedDate)}
                {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                <span className="text-muted-foreground font-normal text-sm ml-1">
                  ({appointments?.length ?? 0} appointment{appointments?.length !== 1 ? "s" : ""})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!appointments?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarDays className="size-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No appointments on this day</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "New Appointment" to schedule one</p>
                </div>
              ) : (
                appointments.map((appt) => (
                  <AppointmentCard key={appt._id} appointment={appt} onStatusChange={handleStatusChange} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-3">
          <div className="grid gap-3">
            {weekDates.map((dateStr) => {
              const dayAppts = allAppointments?.filter((a) => a.date === dateStr) ?? [];
              const isSelectedDay = dateStr === new Date().toISOString().split("T")[0];
              return (
                <Card key={dateStr} className={isSelectedDay ? "border-primary/30 bg-primary/[0.02]" : ""}>
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {formatDateDisplay(dateStr)}
                      {isSelectedDay && <Badge variant="secondary" className="text-xs">Today</Badge>}
                      <span className="text-muted-foreground font-normal">
                        {dayAppts.length} appt{dayAppts.length !== 1 ? "s" : ""}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 space-y-2">
                    {dayAppts.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No appointments</p>
                    ) : (
                      dayAppts.map((appt) => (
                        <div
                          key={appt._id}
                          className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="text-xs text-muted-foreground min-w-[52px]">
                            {formatTime(appt.startTime)}
                          </span>
                          <span className="font-medium flex-1 truncate">{appt.title}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{appt.patientName}</span>
                          <Badge variant="secondary" className={`text-xs ${statusColor(appt.status)}`}>
                            {appt.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
