import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const claimDoc = v.object({
  _id: v.id("claims"),
  _creationTime: v.number(),
  practiceId: v.id("practices"),
  patientId: v.id("patients"),
  providerId: v.id("providers"),
  claimNumber: v.string(),
  dateOfService: v.string(),
  submissionDate: v.optional(v.string()),
  procedures: v.array(v.object({
    cdtCode: v.string(),
    description: v.string(),
    toothNumber: v.optional(v.string()),
    surface: v.optional(v.string()),
    fee: v.number(),
    units: v.number(),
  })),
  totalFee: v.number(),
  insurancePayer: v.string(),
  status: v.string(),
  aiScrubResult: v.optional(v.object({
    score: v.number(),
    issues: v.array(v.object({
      severity: v.string(),
      code: v.string(),
      message: v.string(),
      suggestion: v.string(),
    })),
    scrubDate: v.string(),
  })),
  paidAmount: v.optional(v.number()),
  adjustmentAmount: v.optional(v.number()),
  patientResponsibility: v.optional(v.number()),
  denialReason: v.optional(v.string()),
  denialCode: v.optional(v.string()),
  notes: v.optional(v.string()),
  assignedTo: v.optional(v.id("users")),
  patientName: v.string(),
  providerName: v.string(),
});

export const listByPractice = query({
  args: { practiceId: v.id("practices") },
  returns: v.array(claimDoc),
  handler: async (ctx, { practiceId }) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const enriched = await Promise.all(
      claims.map(async (c) => {
        const patient = await ctx.db.get(c.patientId);
        const provider = await ctx.db.get(c.providerId);
        return {
          ...c,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getById = query({
  args: { claimId: v.id("claims") },
  returns: v.union(claimDoc, v.null()),
  handler: async (ctx, { claimId }) => {
    const claim = await ctx.db.get(claimId);
    if (!claim) return null;

    const patient = await ctx.db.get(claim.patientId);
    const provider = await ctx.db.get(claim.providerId);

    return {
      ...claim,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
      providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
    };
  },
});

export const updateStatus = mutation({
  args: {
    claimId: v.id("claims"),
    status: v.union(
      v.literal("draft"),
      v.literal("scrubbing"),
      v.literal("ready"),
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("denied"),
      v.literal("paid"),
      v.literal("appealed"),
      v.literal("closed")
    ),
  },
  returns: v.null(),
  handler: async (ctx, { claimId, status }) => {
    await ctx.db.patch(claimId, { status });
    return null;
  },
});
