import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ─── List all patients for a practice ─── */
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

/* ─── Get a single patient by ID with full details ─── */
export const getById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const patient = await ctx.db.get(patientId);
    if (!patient) return null;

    // Get all claims for this patient
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_patient", (q) => q.eq("patientId", patientId))
      .collect();

    // Enrich claims with provider names
    const enrichedClaims = await Promise.all(
      claims.map(async (c) => {
        const provider = await ctx.db.get(c.providerId);
        return {
          _id: c._id,
          claimNumber: c.claimNumber,
          dateOfService: c.dateOfService,
          submissionDate: c.submissionDate ?? null,
          procedures: c.procedures,
          totalFee: c.totalFee,
          insurancePayer: c.insurancePayer,
          status: c.status,
          paidAmount: c.paidAmount ?? null,
          denialReason: c.denialReason ?? null,
          denialCode: c.denialCode ?? null,
          aiScrubResult: c.aiScrubResult ?? null,
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
        };
      })
    );

    // Get all payments for this patient
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_patient", (q) => q.eq("patientId", patientId))
      .collect();

    // Calculate summary stats
    const totalBilled = claims.reduce((sum, c) => sum + c.totalFee, 0);
    const totalPaid = payments
      .filter((p) => p.status === "posted" || p.status === "reconciled")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalDenied = claims
      .filter((c) => c.status === "denied")
      .reduce((sum, c) => sum + c.totalFee, 0);
    const activeClaims = claims.filter(
      (c) => !["paid", "closed", "denied"].includes(c.status)
    ).length;

    return {
      ...patient,
      claims: enrichedClaims.sort(
        (a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime()
      ),
      payments: payments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      ),
      summary: {
        totalBilled,
        totalPaid,
        totalDenied,
        activeClaims,
        totalClaims: claims.length,
        totalPayments: payments.length,
      },
    };
  },
});

/* ─── Create a new patient ─── */
export const create = mutation({
  args: {
    practiceId: v.id("practices"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
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
  },
  handler: async (ctx, args) => {
    const patientId = await ctx.db.insert("patients", {
      ...args,
      balance: 0,
      status: "active",
    });
    return patientId;
  },
});

/* ─── Update an existing patient ─── */
export const update = mutation({
  args: {
    patientId: v.id("patients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    insurancePayer: v.optional(v.string()),
    insurancePlan: v.optional(v.string()),
    memberId: v.optional(v.string()),
    groupNumber: v.optional(v.string()),
    subscriberName: v.optional(v.string()),
    subscriberRelation: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, { patientId, ...fields }) => {
    const patient = await ctx.db.get(patientId);
    if (!patient) throw new Error("Patient not found");

    // Filter out undefined values
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(patientId, updates);
    }

    return patientId;
  },
});

/* ─── Check insurance eligibility (simulated) ─── */
export const checkEligibility = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, { patientId }) => {
    const patient = await ctx.db.get(patientId);
    if (!patient) throw new Error("Patient not found");
    if (!patient.insurancePayer) {
      throw new Error("No insurance information on file for this patient");
    }

    // Simulate eligibility verification with realistic results
    const isEligible = Math.random() > 0.15; // 85% chance eligible
    const now = new Date().toISOString().split("T")[0];

    // Build realistic coverage details based on the payer
    const annualMax = [1000, 1500, 2000, 2500][Math.floor(Math.random() * 4)];
    const used = Math.floor(Math.random() * annualMax * 0.6);
    const deductible = [0, 25, 50, 75, 100][Math.floor(Math.random() * 5)];
    const deductibleMet = Math.random() > 0.4;

    const result = {
      verified: true,
      verificationDate: now,
      eligible: isEligible,
      payer: patient.insurancePayer,
      plan: patient.insurancePlan ?? "Standard Plan",
      memberId: patient.memberId ?? "N/A",
      groupNumber: patient.groupNumber ?? "N/A",
      subscriberName: patient.subscriberName ?? `${patient.firstName} ${patient.lastName}`,
      subscriberRelation: patient.subscriberRelation ?? "self",
      effectiveDate: "2026-01-01",
      terminationDate: isEligible ? null : now,
      coverageDetails: {
        annualMaximum: annualMax,
        annualUsed: used,
        annualRemaining: annualMax - used,
        deductible,
        deductibleMet,
        preventiveCoverage: 100,
        basicCoverage: 80,
        majorCoverage: 50,
        orthodonticCoverage: isEligible && Math.random() > 0.5 ? 50 : 0,
        waitingPeriods: {
          preventive: "None",
          basic: "None",
          major: Math.random() > 0.5 ? "12 months" : "6 months",
          orthodontic: "12 months",
        },
      },
      ineligibilityReason: isEligible
        ? null
        : ["Coverage terminated", "Premium not paid", "Member ID not found"][
            Math.floor(Math.random() * 3)
          ],
    };

    return result;
  },
});
