import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const activityDoc = v.object({
  _id: v.id("claimActivities"),
  _creationTime: v.number(),
  practiceId: v.id("practices"),
  claimId: v.id("claims"),
  type: v.string(),
  content: v.string(),
  metadata: v.optional(v.object({
    oldStatus: v.optional(v.string()),
    newStatus: v.optional(v.string()),
    scrubScore: v.optional(v.number()),
    appealLetterText: v.optional(v.string()),
  })),
  createdBy: v.optional(v.id("users")),
});

export const listByClaim = query({
  args: { claimId: v.id("claims") },
  returns: v.array(activityDoc),
  handler: async (ctx, { claimId }) => {
    const activities = await ctx.db
      .query("claimActivities")
      .withIndex("by_claim", (q) => q.eq("claimId", claimId))
      .collect();

    return activities.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const addNote = mutation({
  args: {
    claimId: v.id("claims"),
    content: v.string(),
  },
  returns: v.id("claimActivities"),
  handler: async (ctx, { claimId, content }) => {
    const userId = null; // Auth handled by Supabase on frontend

    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");

    return await ctx.db.insert("claimActivities", {
      practiceId: claim.practiceId,
      claimId,
      type: "note",
      content,
      createdBy: userId ?? undefined,
    });
  },
});
