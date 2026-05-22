import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: { practiceId: v.id("practices") },
  returns: v.object({
    totalClaims: v.number(),
    totalCollections: v.number(),
    pendingClaims: v.number(),
    deniedClaims: v.number(),
    paidClaims: v.number(),
    avgCleanScore: v.number(),
    openTasks: v.number(),
    urgentTasks: v.number(),
    totalOutstandingAR: v.number(),
    over90AR: v.number(),
    collectionRate: v.number(),
    totalPatients: v.number(),
    recentClaims: v.array(v.object({
      _id: v.id("claims"),
      claimNumber: v.string(),
      patientName: v.string(),
      status: v.string(),
      totalFee: v.number(),
      dateOfService: v.string(),
      insurancePayer: v.string(),
    })),
    claimsByStatus: v.array(v.object({
      status: v.string(),
      count: v.number(),
    })),
    recentPayments: v.array(v.object({
      _id: v.id("payments"),
      amount: v.number(),
      paymentDate: v.string(),
      payerName: v.string(),
      paymentType: v.string(),
      status: v.string(),
    })),
  }),
  handler: async (ctx, { practiceId }) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const patients = await ctx.db
      .query("patients")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    // Stats
    const totalClaims = claims.length;
    const paidClaims = claims.filter((c) => c.status === "paid");
    const deniedClaims = claims.filter((c) => c.status === "denied" || c.status === "appealed");
    const pendingClaims = claims.filter((c) => ["submitted", "accepted", "scrubbing", "ready", "draft"].includes(c.status));
    const totalCollections = payments.filter((p) => p.status !== "pending").reduce((sum, p) => sum + p.amount, 0);
    const totalFees = claims.reduce((sum, c) => sum + c.totalFee, 0);
    const collectionRate = totalFees > 0 ? Math.round((totalCollections / totalFees) * 100) : 0;

    // A/R calculations
    const unpaidClaims = claims.filter((c) => !["paid", "closed", "draft"].includes(c.status));
    const totalOutstandingAR = unpaidClaims.reduce((sum, c) => sum + c.totalFee, 0);
    const now = Date.now();
    const over90AR = unpaidClaims
      .filter((c) => {
        const dos = new Date(c.dateOfService).getTime();
        return now - dos > 90 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, c) => sum + c.totalFee, 0);

    // AI scrub scores
    const scrubbed = claims.filter((c) => c.aiScrubResult);
    const avgCleanScore = scrubbed.length > 0
      ? Math.round(scrubbed.reduce((sum, c) => sum + (c.aiScrubResult?.score ?? 0), 0) / scrubbed.length)
      : 0;

    // Tasks
    const openTasks = tasks.filter((t) => t.status === "open" || t.status === "in_progress").length;
    const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed" && t.status !== "cancelled").length;

    // Claims by status
    const statusCounts = new Map<string, number>();
    for (const c of claims) {
      statusCounts.set(c.status, (statusCounts.get(c.status) ?? 0) + 1);
    }
    const claimsByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));

    // Recent claims with patient names
    const sortedClaims = [...claims].sort((a, b) => b._creationTime - a._creationTime).slice(0, 5);
    const recentClaims = await Promise.all(
      sortedClaims.map(async (c) => {
        const patient = await ctx.db.get(c.patientId);
        return {
          _id: c._id,
          claimNumber: c.claimNumber,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
          status: c.status,
          totalFee: c.totalFee,
          dateOfService: c.dateOfService,
          insurancePayer: c.insurancePayer,
        };
      })
    );

    // Recent payments
    const recentPayments = [...payments]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        payerName: p.payerName,
        paymentType: p.paymentType,
        status: p.status,
      }));

    return {
      totalClaims,
      totalCollections,
      pendingClaims: pendingClaims.length,
      deniedClaims: deniedClaims.length,
      paidClaims: paidClaims.length,
      avgCleanScore,
      openTasks,
      urgentTasks,
      totalOutstandingAR,
      over90AR,
      collectionRate,
      totalPatients: patients.length,
      recentClaims,
      claimsByStatus,
      recentPayments,
    };
  },
});
