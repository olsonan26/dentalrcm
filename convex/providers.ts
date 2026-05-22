import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByPractice = query({
  args: { practiceId: v.id("practices") },
  returns: v.array(
    v.object({
      _id: v.id("providers"),
      _creationTime: v.number(),
      practiceId: v.id("practices"),
      firstName: v.string(),
      lastName: v.string(),
      npi: v.string(),
      specialty: v.string(),
      licenseNumber: v.string(),
      status: v.string(),
    })
  ),
  handler: async (ctx, { practiceId }) => {
    return await ctx.db
      .query("providers")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();
  },
});
