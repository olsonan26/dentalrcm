import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByPractice = query({
  args: { practiceId: v.id("practices") },
  returns: v.array(v.object({
    _id: v.id("payments"),
    _creationTime: v.number(),
    practiceId: v.id("practices"),
    claimId: v.optional(v.id("claims")),
    patientId: v.id("patients"),
    paymentDate: v.string(),
    amount: v.number(),
    paymentType: v.string(),
    payerName: v.string(),
    checkNumber: v.optional(v.string()),
    eraReferenceNumber: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
    patientName: v.string(),
  })),
  handler: async (ctx, { practiceId }) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const enriched = await Promise.all(
      payments.map(async (p) => {
        const patient = await ctx.db.get(p.patientId);
        return {
          ...p,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});
