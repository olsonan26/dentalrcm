import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByOwner = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("practices"),
      _creationTime: v.number(),
      name: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      phone: v.string(),
      email: v.string(),
      npi: v.string(),
      taxId: v.string(),
      pmsType: v.union(
        v.literal("open_dental"),
        v.literal("dentrix"),
        v.literal("eaglesoft"),
        v.literal("curve"),
        v.literal("other")
      ),
      status: v.union(v.literal("active"), v.literal("onboarding"), v.literal("inactive")),
      monthlyCollectionTarget: v.number(),
      ownerId: v.id("users"),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const practice = await ctx.db
      .query("practices")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();
    return practice;
  },
});
