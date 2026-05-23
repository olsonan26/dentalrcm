import { useQuery } from "convex/react";
import { Bell, ChevronRight } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { AppSidebar } from "./AppSidebar";
import { CommandMenu } from "./CommandMenu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

const pageTitles: Record<string, { label: string; parent?: { label: string; href: string } }> = {
  "/dashboard": { label: "Dashboard" },
  "/claims": { label: "Claims" },
  "/patients": { label: "Patients" },
  "/appointments": { label: "Appointments" },
  "/reports": { label: "Reports & Analytics" },
  "/tasks": { label: "Task Board" },
  "/payments": { label: "Payments" },
  "/audit-log": { label: "Audit Log" },
  "/team": { label: "Team Management" },
  "/settings": { label: "Settings" },
};

function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  // Handle patient detail /patients/:id
  const isPatientDetail = path.startsWith("/patients/") && path !== "/patients";
  const pageInfo = isPatientDetail
    ? { label: "Patient Detail", parent: { label: "Patients", href: "/patients" } }
    : pageTitles[path] || { label: "Page" };

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <ChevronRight className="size-3.5" />
      {pageInfo.parent && (
        <>
          <Link to={pageInfo.parent.href} className="hover:text-foreground transition-colors">
            {pageInfo.parent.label}
          </Link>
          <ChevronRight className="size-3.5" />
        </>
      )}
      <span className="font-medium text-foreground">{pageInfo.label}</span>
    </nav>
  );
}

function NotificationBell({ practiceId }: { practiceId: string | undefined }) {
  // Simulated notifications based on real data
  const tasks = useQuery(
    api.tasks.listByPractice,
    practiceId ? { practiceId: practiceId as any } : "skip"
  );

  const openTasks = tasks?.filter((t) => t.status === "open" || t.status === "in_progress").length ?? 0;
  const urgentTasks = tasks?.filter((t) => t.priority === "urgent" && t.status !== "completed").length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          {openTasks > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {openTasks > 9 ? "9+" : openTasks}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {openTasks > 0 && (
            <Badge variant="secondary" className="text-xs">
              {openTasks} active
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {urgentTasks > 0 && (
          <DropdownMenuItem asChild>
            <Link to="/tasks" className="cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-destructive">
                  {urgentTasks} urgent task{urgentTasks !== 1 ? "s" : ""} pending
                </span>
                <span className="text-xs text-muted-foreground">
                  Requires immediate attention
                </span>
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        {openTasks > 0 && (
          <DropdownMenuItem asChild>
            <Link to="/tasks" className="cursor-pointer">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm">{openTasks} open task{openTasks !== 1 ? "s" : ""}</span>
                <span className="text-xs text-muted-foreground">
                  View all in task board
                </span>
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        {openTasks === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            All caught up! No pending items.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout() {
  const practice = useQuery(api.practices.getByOwner);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <Breadcrumbs />
          <div className="ml-auto flex items-center gap-2">
            <CommandMenu />
            <NotificationBell practiceId={practice?._id} />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="w-full min-w-0">
          <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
