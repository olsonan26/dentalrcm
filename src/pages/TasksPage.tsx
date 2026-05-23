import { useQuery, useMutation } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { formatDate, taskPriorityColor, taskCategoryLabel } from "@/lib/formatters";

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "open":
      return <Circle className="h-4 w-4 text-muted-foreground" />;
    case "in_progress":
      return <Loader2 className="h-4 w-4 text-info animate-spin" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function TaskCard({
  task,
  onUpdateStatus,
}: {
  task: {
    _id: Id<"tasks">;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    dueDate?: string;
  };
  onUpdateStatus: (taskId: Id<"tasks">, status: "open" | "in_progress" | "completed" | "cancelled") => void;
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate + "T23:59:59") < new Date() && task.status !== "completed" && task.status !== "cancelled";

  return (
    <Card className={`transition-all hover:shadow-sm ${task.status === "completed" ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 shrink-0"
            onClick={() => {
              if (task.status === "open") onUpdateStatus(task._id, "in_progress");
              else if (task.status === "in_progress") onUpdateStatus(task._id, "completed");
            }}
          >
            <TaskStatusIcon status={task.status} />
          </button>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-medium leading-tight ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              <Badge className={`text-[10px] shrink-0 ${taskPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">
                {taskCategoryLabel(task.category)}
              </Badge>
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  <Clock className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                  {isOverdue && " · Overdue"}
                </span>
              )}
            </div>
          </div>
        </div>
        {task.status !== "completed" && task.status !== "cancelled" && (
          <div className="flex gap-2 mt-3 ml-7">
            {task.status === "open" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onUpdateStatus(task._id, "in_progress")}
              >
                Start
              </Button>
            )}
            {task.status === "in_progress" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onUpdateStatus(task._id, "completed")}
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const practice = useQuery(api.practices.getByOwner);
  const tasks = useQuery(
    api.tasks.listByPractice,
    practice ? { practiceId: practice._id } : "skip"
  );
  const updateTaskStatus = useMutation(api.tasks.updateStatus);

  if (!practice || tasks === undefined) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const handleUpdateStatus = (taskId: Id<"tasks">, status: "open" | "in_progress" | "completed" | "cancelled") => {
    updateTaskStatus({ taskId, status });
  };

  const open = (tasks ?? []).filter((t) => t.status === "open");
  const inProgress = (tasks ?? []).filter((t) => t.status === "in_progress");
  const completed = (tasks ?? []).filter((t) => t.status === "completed");
  const urgent = (tasks ?? []).filter((t) => t.priority === "urgent" && t.status !== "completed" && t.status !== "cancelled");

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">Billing tasks and workflow management</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-info shrink-0" />
            <div>
              <p className="text-xl font-bold">{open.length}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-chart-1 shrink-0" />
            <div>
              <p className="text-xl font-bold">{inProgress.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-xl font-bold">{urgent.length}</p>
              <p className="text-xs text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-xl font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Open */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                Open
                <Badge variant="secondary" className="ml-auto text-xs">{open.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          {open.map((task) => (
            <TaskCard key={task._id} task={task} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>

        {/* In Progress */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-info" />
                In Progress
                <Badge variant="secondary" className="ml-auto text-xs">{inProgress.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          {inProgress.map((task) => (
            <TaskCard key={task._id} task={task} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>

        {/* Completed */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Completed
                <Badge variant="secondary" className="ml-auto text-xs">{completed.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          {completed.map((task) => (
            <TaskCard key={task._id} task={task} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      </div>
    </div>
  );
}
