import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByPractice = query({
  args: {
    practiceId: v.id("practices"),
    date: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let appts;
    if (args.date) {
      appts = await ctx.db
        .query("appointments")
        .withIndex("by_practice_and_date", (q) =>
          q.eq("practiceId", args.practiceId).eq("date", args.date!)
        )
        .collect();
    } else {
      appts = await ctx.db
        .query("appointments")
        .withIndex("by_practice", (q) => q.eq("practiceId", args.practiceId))
        .collect();
    }

    if (args.status) {
      appts = appts.filter((a) => a.status === args.status);
    }

    // Enrich with patient and provider names
    const enriched = await Promise.all(
      appts.map(async (appt) => {
        const patient = await ctx.db.get(appt.patientId);
        const provider = await ctx.db.get(appt.providerId);
        return {
          ...appt,
          patientName: patient
            ? `${patient.firstName} ${patient.lastName}`
            : "Unknown",
          providerName: provider
            ? `Dr. ${provider.firstName} ${provider.lastName}`
            : "Unknown",
        };
      })
    );

    return enriched.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  },
});

export const getStats = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("appointments")
      .withIndex("by_practice", (q) => q.eq("practiceId", args.practiceId))
      .collect();

    const today = new Date().toISOString().split("T")[0];
    const todayAppts = all.filter((a) => a.date === today);
    const upcoming = all.filter(
      (a) => a.date >= today && (a.status === "scheduled" || a.status === "confirmed")
    );
    const completed = all.filter((a) => a.status === "completed");
    const cancelled = all.filter(
      (a) => a.status === "cancelled" || a.status === "no_show"
    );

    return {
      total: all.length,
      todayCount: todayAppts.length,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      todayAppointments: todayAppts,
    };
  },
});

export const create = mutation({
  args: {
    practiceId: v.id("practices"),
    patientId: v.id("patients"),
    providerId: v.id("providers"),
    title: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    type: v.union(
      v.literal("exam"),
      v.literal("cleaning"),
      v.literal("filling"),
      v.literal("crown"),
      v.literal("root_canal"),
      v.literal("extraction"),
      v.literal("implant"),
      v.literal("orthodontics"),
      v.literal("whitening"),
      v.literal("emergency"),
      v.literal("consultation"),
      v.literal("follow_up"),
      v.literal("other")
    ),
    notes: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
      insuranceVerified: false,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("checked_in"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const update = mutation({
  args: {
    id: v.id("appointments"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("exam"),
        v.literal("cleaning"),
        v.literal("filling"),
        v.literal("crown"),
        v.literal("root_canal"),
        v.literal("extraction"),
        v.literal("implant"),
        v.literal("orthodontics"),
        v.literal("whitening"),
        v.literal("emergency"),
        v.literal("consultation"),
        v.literal("follow_up"),
        v.literal("other")
      )
    ),
    notes: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    insuranceVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
