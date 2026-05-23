import { query } from "./_generated/server";
import { v } from "convex/values";

/* ─── A/R Aging Report ─── */
export const getArAging = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Only unpaid claims count for A/R
    const unpaid = claims.filter((c) => !["paid", "closed", "draft"].includes(c.status));

    const buckets = [
      { label: "0–30 days", min: 0, max: 30, claims: [] as typeof unpaid, total: 0 },
      { label: "31–60 days", min: 31, max: 60, claims: [] as typeof unpaid, total: 0 },
      { label: "61–90 days", min: 61, max: 90, claims: [] as typeof unpaid, total: 0 },
      { label: "91–120 days", min: 91, max: 120, claims: [] as typeof unpaid, total: 0 },
      { label: "120+ days", min: 121, max: 99999, claims: [] as typeof unpaid, total: 0 },
    ];

    for (const c of unpaid) {
      const dos = new Date(c.dateOfService).getTime();
      const ageDays = Math.floor((now - dos) / DAY);
      const bucket = buckets.find((b) => ageDays >= b.min && ageDays <= b.max);
      if (bucket) {
        bucket.claims.push(c);
        bucket.total += c.totalFee;
      }
    }

    const totalAR = unpaid.reduce((sum, c) => sum + c.totalFee, 0);

    // Enrich with patient names for drill-down
    const enrichedBuckets = await Promise.all(
      buckets.map(async (b) => {
        const enrichedClaims = await Promise.all(
          b.claims.slice(0, 10).map(async (c) => {
            const patient = await ctx.db.get(c.patientId);
            return {
              _id: c._id,
              claimNumber: c.claimNumber,
              patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
              insurancePayer: c.insurancePayer,
              totalFee: c.totalFee,
              dateOfService: c.dateOfService,
              status: c.status,
            };
          })
        );
        return {
          label: b.label,
          count: b.claims.length,
          total: b.total,
          percentage: totalAR > 0 ? Math.round((b.total / totalAR) * 100) : 0,
          claims: enrichedClaims,
        };
      })
    );

    return {
      totalAR,
      totalClaims: unpaid.length,
      buckets: enrichedBuckets,
    };
  },
});

/* ─── Payer Performance ─── */
export const getPayerPerformance = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    // Group by payer
    const payerMap = new Map<
      string,
      { billed: number; paid: number; denied: number; claimCount: number; paidCount: number; deniedCount: number; avgDaysToPayment: number; totalDays: number; paidWithDays: number }
    >();

    for (const c of claims) {
      const payer = c.insurancePayer;
      if (!payerMap.has(payer)) {
        payerMap.set(payer, { billed: 0, paid: 0, denied: 0, claimCount: 0, paidCount: 0, deniedCount: 0, avgDaysToPayment: 0, totalDays: 0, paidWithDays: 0 });
      }
      const p = payerMap.get(payer)!;
      p.billed += c.totalFee;
      p.claimCount++;
      if (c.status === "paid") {
        p.paidCount++;
        // Estimate days to payment from DOS to now (simulated)
        if (c.submissionDate) {
          const sub = new Date(c.submissionDate).getTime();
          const daysDiff = Math.floor((Date.now() - sub) / (24 * 60 * 60 * 1000));
          p.totalDays += Math.min(daysDiff, 45); // cap at realistic range
          p.paidWithDays++;
        }
      }
      if (c.status === "denied" || c.status === "appealed") {
        p.deniedCount++;
        p.denied += c.totalFee;
      }
    }

    // Add payment amounts
    for (const pay of payments) {
      if (pay.paymentType === "insurance" && (pay.status === "posted" || pay.status === "reconciled")) {
        // Find the payer name from the payment
        const existing = payerMap.get(pay.payerName);
        if (existing) {
          existing.paid += pay.amount;
        }
      }
    }

    const payers = Array.from(payerMap.entries())
      .map(([name, data]) => ({
        name,
        billed: data.billed,
        paid: data.paid,
        denied: data.denied,
        claimCount: data.claimCount,
        paidCount: data.paidCount,
        deniedCount: data.deniedCount,
        cleanRate: data.claimCount > 0 ? Math.round(((data.claimCount - data.deniedCount) / data.claimCount) * 100) : 0,
        collectionRate: data.billed > 0 ? Math.round((data.paid / data.billed) * 100) : 0,
        avgDaysToPayment: data.paidWithDays > 0 ? Math.round(data.totalDays / data.paidWithDays) : 0,
      }))
      .sort((a, b) => b.billed - a.billed);

    return { payers };
  },
});

/* ─── Provider Productivity ─── */
export const getProviderProductivity = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const providers = await ctx.db
      .query("providers")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const claims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const providerStats = providers.map((prov) => {
      const provClaims = claims.filter((c) => c.providerId === prov._id);
      const totalBilled = provClaims.reduce((sum, c) => sum + c.totalFee, 0);
      const paidClaims = provClaims.filter((c) => c.status === "paid");
      const totalPaid = paidClaims.reduce((sum, c) => sum + (c.paidAmount ?? c.totalFee), 0);
      const deniedClaims = provClaims.filter((c) => c.status === "denied" || c.status === "appealed");
      const scrubbed = provClaims.filter((c) => c.aiScrubResult);
      const avgScrubScore = scrubbed.length > 0
        ? Math.round(scrubbed.reduce((sum, c) => sum + (c.aiScrubResult?.score ?? 0), 0) / scrubbed.length)
        : 0;

      // Count unique patients
      const uniquePatients = new Set(provClaims.map((c) => c.patientId)).size;

      // Procedures count
      const totalProcedures = provClaims.reduce((sum, c) => sum + c.procedures.length, 0);

      return {
        _id: prov._id,
        name: `Dr. ${prov.firstName} ${prov.lastName}`,
        specialty: prov.specialty,
        totalClaims: provClaims.length,
        totalBilled,
        totalPaid,
        deniedCount: deniedClaims.length,
        avgScrubScore,
        uniquePatients,
        totalProcedures,
        collectionRate: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
        denialRate: provClaims.length > 0 ? Math.round((deniedClaims.length / provClaims.length) * 100) : 0,
      };
    });

    return { providers: providerStats.sort((a, b) => b.totalBilled - a.totalBilled) };
  },
});

/* ─── Monthly Collection Trends ─── */
export const getCollectionTrends = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    // Generate last 6 months of data
    const months: { month: string; label: string; billed: number; collected: number; denied: number; claimCount: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const monthClaims = claims.filter((c) => c.dateOfService.startsWith(monthStr));
      const monthPayments = payments.filter((p) => p.paymentDate.startsWith(monthStr));

      const billed = monthClaims.reduce((sum, c) => sum + c.totalFee, 0);
      const collected = monthPayments
        .filter((p) => p.status !== "pending")
        .reduce((sum, p) => sum + p.amount, 0);
      const denied = monthClaims
        .filter((c) => c.status === "denied" || c.status === "appealed")
        .reduce((sum, c) => sum + c.totalFee, 0);

      months.push({ month: monthStr, label, billed, collected, denied, claimCount: monthClaims.length });
    }

    // Totals
    const totalBilled = months.reduce((sum, m) => sum + m.billed, 0);
    const totalCollected = months.reduce((sum, m) => sum + m.collected, 0);
    const totalDenied = months.reduce((sum, m) => sum + m.denied, 0);

    return {
      months,
      totals: { billed: totalBilled, collected: totalCollected, denied: totalDenied },
    };
  },
});
