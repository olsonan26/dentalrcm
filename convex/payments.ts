import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new payment
export const create = mutation({
  args: {
    practiceId: v.id("practices"),
    claimId: v.optional(v.id("claims")),
    patientId: v.id("patients"),
    paymentDate: v.string(),
    amount: v.number(),
    paymentType: v.union(
      v.literal("insurance"),
      v.literal("patient"),
      v.literal("adjustment")
    ),
    payerName: v.string(),
    checkNumber: v.optional(v.string()),
    eraReferenceNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      status: "pending",
    });

    // Get patient name for audit log
    const patient = await ctx.db.get(args.patientId);
    const patientName = patient
      ? `${patient.firstName} ${patient.lastName}`
      : "Unknown";

    // Audit log
    const user = await ctx.auth.getUserIdentity();
    await ctx.db.insert("auditLogs", {
      practiceId: args.practiceId,
      entityType: "payment",
      entityId: paymentId,
      action: "create",
      description: `Payment of $${args.amount.toFixed(2)} posted for ${patientName} from ${args.payerName}`,
      performedByName: user?.name ?? "System",
    });

    return paymentId;
  },
});

// Update payment status (post or reconcile)
export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("posted"),
      v.literal("reconciled")
    ),
  },
  handler: async (ctx, { paymentId, status }) => {
    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new Error("Payment not found");

    const oldStatus = payment.status;
    await ctx.db.patch(paymentId, { status });

    // If reconciling, update linked claim to "paid"
    if (status === "reconciled" && payment.claimId) {
      const claim = await ctx.db.get(payment.claimId);
      if (claim && claim.status !== "paid" && claim.status !== "closed") {
        await ctx.db.patch(payment.claimId, {
          status: "paid",
          paidAmount: (claim.paidAmount ?? 0) + payment.amount,
        });
      }
    }

    const user = await ctx.auth.getUserIdentity();
    await ctx.db.insert("auditLogs", {
      practiceId: payment.practiceId,
      entityType: "payment",
      entityId: paymentId,
      action: status === "reconciled" ? "reconcile" : "status_change",
      description: `Payment status changed from ${oldStatus} to ${status}`,
      changes: JSON.stringify({ oldStatus, newStatus: status }),
      performedByName: user?.name ?? "System",
    });
  },
});

// Batch post multiple payments
export const batchPost = mutation({
  args: {
    paymentIds: v.array(v.id("payments")),
  },
  handler: async (ctx, { paymentIds }) => {
    const user = await ctx.auth.getUserIdentity();
    let practiceId: any = null;
    let count = 0;

    for (const id of paymentIds) {
      const payment = await ctx.db.get(id);
      if (payment && payment.status === "pending") {
        await ctx.db.patch(id, { status: "posted" });
        practiceId = payment.practiceId;
        count++;
      }
    }

    if (practiceId) {
      await ctx.db.insert("auditLogs", {
        practiceId,
        entityType: "payment",
        entityId: "batch",
        action: "batch_post",
        description: `Batch posted ${count} payment(s)`,
        changes: JSON.stringify({ paymentIds: paymentIds.map(String), count }),
        performedByName: user?.name ?? "System",
      });
    }

    return { posted: count };
  },
});

// Batch reconcile multiple payments
export const batchReconcile = mutation({
  args: {
    paymentIds: v.array(v.id("payments")),
  },
  handler: async (ctx, { paymentIds }) => {
    const user = await ctx.auth.getUserIdentity();
    let practiceId: any = null;
    let count = 0;

    for (const id of paymentIds) {
      const payment = await ctx.db.get(id);
      if (payment && payment.status === "posted") {
        await ctx.db.patch(id, { status: "reconciled" });
        practiceId = payment.practiceId;
        count++;

        // Update linked claim
        if (payment.claimId) {
          const claim = await ctx.db.get(payment.claimId);
          if (claim && claim.status !== "paid" && claim.status !== "closed") {
            await ctx.db.patch(payment.claimId, {
              status: "paid",
              paidAmount: (claim.paidAmount ?? 0) + payment.amount,
            });
          }
        }
      }
    }

    if (practiceId) {
      await ctx.db.insert("auditLogs", {
        practiceId,
        entityType: "payment",
        entityId: "batch",
        action: "reconcile",
        description: `Batch reconciled ${count} payment(s)`,
        changes: JSON.stringify({ paymentIds: paymentIds.map(String), count }),
        performedByName: user?.name ?? "System",
      });
    }

    return { reconciled: count };
  },
});

// Get unmatched payments for reconciliation view
export const getUnreconciled = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_practice_and_status", (q) =>
        q.eq("practiceId", practiceId).eq("status", "posted")
      )
      .collect();

    const enriched = await Promise.all(
      payments.map(async (p) => {
        const patient = await ctx.db.get(p.patientId);
        const claim = p.claimId ? await ctx.db.get(p.claimId) : null;
        return {
          ...p,
          patientName: patient
            ? `${patient.firstName} ${patient.lastName}`
            : "Unknown",
          claimNumber: claim?.claimNumber ?? null,
          claimStatus: claim?.status ?? null,
        };
      })
    );

    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});
