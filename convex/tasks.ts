import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPractice = query({
  args: { practiceId: v.id("practices") },
  returns: v.array(v.object({
    _id: v.id("tasks"),
    _creationTime: v.number(),
    practiceId: v.id("practices"),
    claimId: v.optional(v.id("claims")),
    patientId: v.optional(v.id("patients")),
    assignedTo: v.optional(v.id("users")),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.string(),
    status: v.string(),
    dueDate: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  })),
  handler: async (ctx, { practiceId }) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    return tasks.sort((a, b) => {
      // Sort: open first, then by priority
      const statusOrder: Record<string, number> = { open: 0, in_progress: 1, completed: 2, cancelled: 3 };
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const sDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (sDiff !== 0) return sDiff;
      return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    });
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  returns: v.null(),
  handler: async (ctx, { taskId, status }) => {
    const patch: Record<string, unknown> = { status };
    if (status === "completed") {
      patch.completedAt = new Date().toISOString().split("T")[0];
    }
    await ctx.db.patch(taskId, patch);
    return null;
  },
});
