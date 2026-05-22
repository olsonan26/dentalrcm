import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByPractice = query({
  args: { practiceId: v.id("practices") },
  returns: v.array(v.object({
    _id: v.id("patients"),
    _creationTime: v.number(),
    practiceId: v.id("practices"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.string(),
    phone: v.string(),
    email: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    insurancePayer: v.optional(v.string()),
    insurancePlan: v.optional(v.string()),
    memberId: v.optional(v.string()),
    groupNumber: v.optional(v.string()),
    subscriberName: v.optional(v.string()),
    subscriberRelation: v.optional(v.string()),
    balance: v.number(),
    status: v.string(),
    claimsCount: v.number(),
  })),
  handler: async (ctx, { practiceId }) => {
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const enriched = await Promise.all(
      patients.map(async (p) => {
        const claims = await ctx.db
          .query("claims")
          .withIndex("by_patient", (q) => q.eq("patientId", p._id))
          .collect();
        return {
          ...p,
          claimsCount: claims.length,
        };
      })
    );

    return enriched.sort((a, b) => a.lastName.localeCompare(b.lastName));
  },
});
