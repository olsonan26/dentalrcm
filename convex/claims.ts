import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ─── Shared Types ─── */

const procedureValidator = v.object({
  cdtCode: v.string(),
  description: v.string(),
  toothNumber: v.optional(v.string()),
  surface: v.optional(v.string()),
  fee: v.number(),
  units: v.number(),
});

const scrubIssueValidator = v.object({
  severity: v.union(v.literal("error"), v.literal("warning"), v.literal("info")),
  code: v.string(),
  message: v.string(),
  suggestion: v.string(),
});

const aiScrubValidator = v.object({
  score: v.number(),
  issues: v.array(scrubIssueValidator),
  scrubDate: v.string(),
});

const claimStatuses = v.union(
  v.literal("draft"),
  v.literal("scrubbing"),
  v.literal("ready"),
  v.literal("submitted"),
  v.literal("accepted"),
  v.literal("denied"),
  v.literal("paid"),
  v.literal("appealed"),
  v.literal("closed")
);

const claimDoc = v.object({
  _id: v.id("claims"),
  _creationTime: v.number(),
  practiceId: v.id("practices"),
  patientId: v.id("patients"),
  providerId: v.id("providers"),
  claimNumber: v.string(),
  dateOfService: v.string(),
  submissionDate: v.optional(v.string()),
  procedures: v.array(procedureValidator),
  totalFee: v.number(),
  insurancePayer: v.string(),
  status: v.string(),
  aiScrubResult: v.optional(aiScrubValidator),
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

/* ─── Queries ─── */

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

/* ─── Mutations ─── */

export const create = mutation({
  args: {
    practiceId: v.id("practices"),
    patientId: v.id("patients"),
    providerId: v.id("providers"),
    dateOfService: v.string(),
    procedures: v.array(procedureValidator),
    insurancePayer: v.string(),
    notes: v.optional(v.string()),
  },
  returns: v.id("claims"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Auto-generate claim number
    const existingClaims = await ctx.db
      .query("claims")
      .withIndex("by_practice", (q) => q.eq("practiceId", args.practiceId))
      .collect();
    const nextNum = existingClaims.length + 1;
    const claimNumber = `CLM-2026-${String(nextNum).padStart(4, "0")}`;

    const totalFee = args.procedures.reduce((sum, p) => sum + p.fee * p.units, 0);

    const claimId = await ctx.db.insert("claims", {
      practiceId: args.practiceId,
      patientId: args.patientId,
      providerId: args.providerId,
      claimNumber,
      dateOfService: args.dateOfService,
      procedures: args.procedures,
      totalFee,
      insurancePayer: args.insurancePayer,
      status: "draft",
      notes: args.notes,
    });

    // Log activity
    await ctx.db.insert("claimActivities", {
      practiceId: args.practiceId,
      claimId,
      type: "system",
      content: `Claim ${claimNumber} created as draft`,
      createdBy: userId,
    });

    return claimId;
  },
});

export const update = mutation({
  args: {
    claimId: v.id("claims"),
    dateOfService: v.optional(v.string()),
    procedures: v.optional(v.array(procedureValidator)),
    insurancePayer: v.optional(v.string()),
    notes: v.optional(v.string()),
    patientId: v.optional(v.id("patients")),
    providerId: v.optional(v.id("providers")),
  },
  returns: v.null(),
  handler: async (ctx, { claimId, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");

    const patch: Record<string, unknown> = {};
    if (updates.dateOfService !== undefined) patch.dateOfService = updates.dateOfService;
    if (updates.procedures !== undefined) {
      patch.procedures = updates.procedures;
      patch.totalFee = updates.procedures.reduce((sum, p) => sum + p.fee * p.units, 0);
    }
    if (updates.insurancePayer !== undefined) patch.insurancePayer = updates.insurancePayer;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.patientId !== undefined) patch.patientId = updates.patientId;
    if (updates.providerId !== undefined) patch.providerId = updates.providerId;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(claimId, patch);

      await ctx.db.insert("claimActivities", {
        practiceId: claim.practiceId,
        claimId,
        type: "note",
        content: `Claim updated: ${Object.keys(patch).join(", ")}`,
        createdBy: userId,
      });
    }

    return null;
  },
});

export const updateStatus = mutation({
  args: {
    claimId: v.id("claims"),
    status: claimStatuses,
  },
  returns: v.null(),
  handler: async (ctx, { claimId, status }) => {
    const userId = await getAuthUserId(ctx);
    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");

    const oldStatus = claim.status;
    await ctx.db.patch(claimId, {
      status,
      ...(status === "submitted" ? { submissionDate: new Date().toISOString().split("T")[0] } : {}),
    });

    await ctx.db.insert("claimActivities", {
      practiceId: claim.practiceId,
      claimId,
      type: "status_change",
      content: `Status changed from ${oldStatus} to ${status}`,
      metadata: { oldStatus, newStatus: status },
      createdBy: userId ?? undefined,
    });

    return null;
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    claimIds: v.array(v.id("claims")),
    status: claimStatuses,
  },
  returns: v.object({ updated: v.number() }),
  handler: async (ctx, { claimIds, status }) => {
    const userId = await getAuthUserId(ctx);
    let updated = 0;

    for (const claimId of claimIds) {
      const claim = await ctx.db.get(claimId);
      if (!claim) continue;

      const oldStatus = claim.status;
      await ctx.db.patch(claimId, {
        status,
        ...(status === "submitted" ? { submissionDate: new Date().toISOString().split("T")[0] } : {}),
      });

      await ctx.db.insert("claimActivities", {
        practiceId: claim.practiceId,
        claimId,
        type: "status_change",
        content: `Bulk status change: ${oldStatus} → ${status}`,
        metadata: { oldStatus, newStatus: status },
        createdBy: userId ?? undefined,
      });
      updated++;
    }

    return { updated };
  },
});

export const runAiScrub = mutation({
  args: { claimId: v.id("claims") },
  returns: v.null(),
  handler: async (ctx, { claimId }) => {
    const userId = await getAuthUserId(ctx);
    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");

    const patient = await ctx.db.get(claim.patientId);

    // Simulated AI scrubbing logic based on claim data
    const issues: Array<{ severity: "error" | "warning" | "info"; code: string; message: string; suggestion: string }> = [];

    // Check for missing narrative on SRP claims
    for (const proc of claim.procedures) {
      if (proc.cdtCode.startsWith("D4") && !claim.notes) {
        issues.push({
          severity: "error",
          code: "NARR-001",
          message: `Missing clinical narrative for ${proc.cdtCode} (${proc.description})`,
          suggestion: "Add periodontal charting documentation showing pocket depths ≥ 4mm to support medical necessity.",
        });
      }
      // Check for crown without buildup
      if (proc.cdtCode === "D2750" || proc.cdtCode === "D2740") {
        const hasBuildup = claim.procedures.some((p) => p.cdtCode === "D2950");
        if (!hasBuildup) {
          issues.push({
            severity: "warning",
            code: "PROC-003",
            message: `Crown ${proc.cdtCode} without core buildup — verify if D2950 is needed`,
            suggestion: "Most payers expect D2950 to be bundled when the tooth structure is compromised.",
          });
        }
      }
      // Check tooth number required
      if (["D2750", "D2740", "D2391", "D2392", "D3310", "D3330", "D7210"].includes(proc.cdtCode) && !proc.toothNumber) {
        issues.push({
          severity: "error",
          code: "TOOTH-001",
          message: `Tooth number required for ${proc.cdtCode}`,
          suggestion: "Add the specific tooth number to avoid automatic denial.",
        });
      }
      // Check surface required for restorations
      if (proc.cdtCode.startsWith("D239") && !proc.surface) {
        issues.push({
          severity: "error",
          code: "SURF-001",
          message: `Surface designation required for ${proc.cdtCode}`,
          suggestion: "Specify the restoration surfaces (e.g., MO, MOD, OB).",
        });
      }
      // High-fee procedures need pre-auth
      if (proc.fee * proc.units > 2000) {
        issues.push({
          severity: "warning",
          code: "AUTH-001",
          message: `Pre-authorization recommended for ${proc.cdtCode} ($${(proc.fee * proc.units).toLocaleString()})`,
          suggestion: "Procedures over $2,000 often require prior authorization from the payer.",
        });
      }
    }

    // Check subscriber info
    if (patient && !patient.memberId) {
      issues.push({
        severity: "error",
        code: "ELIG-001",
        message: "Missing insurance member ID",
        suggestion: "Verify patient insurance eligibility and add member ID before submission.",
      });
    }

    // Check frequency limitations
    const evalCodes = claim.procedures.filter((p) => p.cdtCode === "D0120" || p.cdtCode === "D0150");
    const prophyCodes = claim.procedures.filter((p) => p.cdtCode === "D1110");
    if (evalCodes.length > 0 && prophyCodes.length > 0) {
      issues.push({
        severity: "info",
        code: "FREQ-001",
        message: "Eval + Prophy combination — verify frequency limits",
        suggestion: "Most plans allow 2 prophylaxis per year and 2 exams per year. Check patient history.",
      });
    }

    // Always add a positive note if clean
    if (issues.filter((i) => i.severity === "error").length === 0) {
      issues.push({
        severity: "info",
        code: "DOC-001",
        message: "No critical issues found — claim appears clean",
        suggestion: "Review any warnings before submission for optimal first-pass acceptance.",
      });
    }

    // Calculate score
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    const score = Math.max(0, Math.min(100, 100 - errorCount * 20 - warningCount * 8));

    const scrubResult = {
      score,
      issues,
      scrubDate: new Date().toISOString().split("T")[0],
    };

    await ctx.db.patch(claimId, {
      aiScrubResult: scrubResult,
      status: claim.status === "draft" ? "scrubbing" : claim.status,
    });

    await ctx.db.insert("claimActivities", {
      practiceId: claim.practiceId,
      claimId,
      type: "scrub_result",
      content: `AI scrub completed — Score: ${score}% (${errorCount} errors, ${warningCount} warnings)`,
      metadata: { scrubScore: score },
      createdBy: userId ?? undefined,
    });

    return null;
  },
});

export const generateAppealLetter = mutation({
  args: { claimId: v.id("claims") },
  returns: v.string(),
  handler: async (ctx, { claimId }) => {
    const userId = await getAuthUserId(ctx);
    const claim = await ctx.db.get(claimId);
    if (!claim) throw new Error("Claim not found");
    if (claim.status !== "denied" && claim.status !== "appealed") {
      throw new Error("Can only generate appeal letters for denied or appealed claims");
    }

    const patient = await ctx.db.get(claim.patientId);
    const provider = await ctx.db.get(claim.providerId);
    const practice = await ctx.db.get(claim.practiceId);

    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient";
    const providerName = provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Provider";
    const practiceName = practice?.name ?? "Practice";
    const procedureList = claim.procedures
      .map((p) => `  • ${p.cdtCode} — ${p.description} (Tooth ${p.toothNumber ?? "N/A"}): $${(p.fee * p.units).toFixed(2)}`)
      .join("\n");

    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const letter = `${today}

${claim.insurancePayer}
Claims Review Department

RE: Appeal for Claim ${claim.claimNumber}
Patient: ${patientName}
Member ID: ${patient?.memberId ?? "N/A"}
Group Number: ${patient?.groupNumber ?? "N/A"}
Date of Service: ${claim.dateOfService}
Denial Code: ${claim.denialCode ?? "N/A"}

Dear Claims Review Department,

I am writing on behalf of ${practiceName} to formally appeal the denial of the above-referenced claim. The claim was denied with reason: "${claim.denialReason ?? "Not specified"}".

The following procedures were performed and are medically necessary for the treatment of ${patientName}:

${procedureList}

Total Billed: $${claim.totalFee.toFixed(2)}

CLINICAL JUSTIFICATION:

The procedures listed above were performed based on thorough clinical examination and diagnostic findings. ${providerName} determined that these treatments were essential to address the patient's dental condition and prevent further deterioration of oral health.

${claim.denialCode === "CO-50" ? "Regarding the request for pre-operative radiographs: the required radiographic documentation has been obtained and is enclosed with this appeal. The radiographs clearly demonstrate the clinical necessity for the treatment provided." : ""}
${claim.denialCode === "CO-96" ? "Regarding the coverage determination: the procedures performed fall within the patient's plan benefits as outlined in the subscriber agreement. The clinical documentation supports the medical necessity of each procedure." : ""}

We respectfully request that you reconsider this claim for payment. Enclosed please find:
  1. Complete clinical notes for the date of service
  2. Relevant diagnostic radiographs
  3. Periodontal charting (if applicable)
  4. Any additional supporting documentation

If you require any additional information, please contact our office at ${practice?.phone ?? "(303) 555-0142"}.

Sincerely,

${providerName}
${practiceName}
NPI: ${provider?.npi ?? "N/A"}
${practice?.address ?? ""}
${practice?.city ?? ""}, ${practice?.state ?? ""} ${practice?.zip ?? ""}`;

    // Log the appeal letter
    await ctx.db.insert("claimActivities", {
      practiceId: claim.practiceId,
      claimId,
      type: "appeal_letter",
      content: "Appeal letter generated",
      metadata: { appealLetterText: letter },
      createdBy: userId ?? undefined,
    });

    // Update status to appealed if currently denied
    if (claim.status === "denied") {
      await ctx.db.patch(claimId, { status: "appealed" });

      await ctx.db.insert("claimActivities", {
        practiceId: claim.practiceId,
        claimId,
        type: "status_change",
        content: "Status changed from denied to appealed",
        metadata: { oldStatus: "denied", newStatus: "appealed" },
        createdBy: userId ?? undefined,
      });
    }

    return letter;
  },
});
