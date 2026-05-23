import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BanknoteIcon,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: "Navigation" },
  { title: "Claims", url: "/claims", icon: FileText, group: "Revenue Cycle" },
  { title: "Patients", url: "/patients", icon: Users, group: "Revenue Cycle" },
  { title: "Appointments", url: "/appointments", icon: CalendarDays, group: "Revenue Cycle" },
  { title: "Reports", url: "/reports", icon: BarChart3, group: "Revenue Cycle" },
  { title: "Tasks", url: "/tasks", icon: ClipboardList, group: "Revenue Cycle" },
  { title: "Payments", url: "/payments", icon: BanknoteIcon, group: "Revenue Cycle" },
  { title: "Audit Log", url: "/audit-log", icon: Shield, group: "Administration" },
  { title: "Team", url: "/team", icon: UsersRound, group: "Administration" },
  { title: "Settings", url: "/settings", icon: Settings, group: "Settings" },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  const groups = [...new Set(navItems.map((item) => item.group))];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="size-4" />
        <span className="hidden lg:inline">Search pages...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group, index) => (
            <div key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      key={item.url}
                      value={item.title}
                      onSelect={() => runCommand(item.url)}
                    >
                      <item.icon className="mr-2 size-4" />
                      <span>{item.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
