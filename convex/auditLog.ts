import { query } from "./_generated/server";
import { v } from "convex/values";

// List audit logs for a practice with pagination-like limit
export const listByPractice = query({
  args: {
    practiceId: v.id("practices"),
    entityType: v.optional(
      v.union(
        v.literal("claim"),
        v.literal("payment"),
        v.literal("patient"),
        v.literal("provider"),
        v.literal("task"),
        v.literal("practice"),
        v.literal("member")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { practiceId, entityType, limit }) => {
    let logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .order("desc")
      .collect();

    if (entityType) {
      logs = logs.filter((l) => l.entityType === entityType);
    }

    const maxResults = limit ?? 100;
    return logs.slice(0, maxResults);
  },
});

// Get audit log stats
export const getStats = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const today = logs.filter((l) => now - l._creationTime < oneDay);
    const thisWeek = logs.filter((l) => now - l._creationTime < oneWeek);

    // Count by entity type
    const byEntity: Record<string, number> = {};
    for (const log of logs) {
      byEntity[log.entityType] = (byEntity[log.entityType] ?? 0) + 1;
    }

    // Count by action
    const byAction: Record<string, number> = {};
    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] ?? 0) + 1;
    }

    return {
      total: logs.length,
      today: today.length,
      thisWeek: thisWeek.length,
      byEntity,
      byAction,
    };
  },
});
