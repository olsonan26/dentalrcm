import { mutation } from "./_generated/server";
import { v } from "convex/values";
// Auth import removed — userId passed as arg

export const ensureSeedData = mutation({
  args: { userId: v.optional(v.id("users")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = args.userId ?? null;
    if (!userId) return null;

    // Check if this user already has a practice
    const existing = await ctx.db
      .query("practices")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();

    // Seed audit logs and practice members for existing practices that predate Batch 4
    if (existing) {
      const existingMembers = await ctx.db
        .query("practiceMembers")
        .withIndex("by_practice", (q) => q.eq("practiceId", existing._id))
        .first();

      if (!existingMembers) {
        const practiceId = existing._id;

        // Practice Members (RBAC)
        await ctx.db.insert("practiceMembers", {
          practiceId,
          userId,
          role: "owner",
          firstName: "Practice",
          lastName: "Owner",
          email: "owner@brightsmile.dental",
          status: "active",
        });
        await ctx.db.insert("practiceMembers", {
          practiceId,
          userId,
          role: "billing_manager",
          firstName: "Lisa",
          lastName: "Rodriguez",
          email: "l.rodriguez@brightsmile.dental",
          status: "active",
        });
        await ctx.db.insert("practiceMembers", {
          practiceId,
          userId,
          role: "billing_specialist",
          firstName: "Kevin",
          lastName: "Nguyen",
          email: "k.nguyen@brightsmile.dental",
          status: "active",
        });
        await ctx.db.insert("practiceMembers", {
          practiceId,
          userId,
          role: "viewer",
          firstName: "Amanda",
          lastName: "Foster",
          email: "a.foster@brightsmile.dental",
          status: "invited",
          invitedAt: "2026-05-20",
        });

        // Audit Logs
        const auditEntries = [
          { entityType: "claim" as const, entityId: "seed", action: "create" as const, description: "Created claim CLM-2026-0001 for James Wilson", performedByName: "Lisa Rodriguez" },
          { entityType: "claim" as const, entityId: "seed", action: "ai_scrub" as const, description: "AI scrub completed for CLM-2026-0004 — Score: 72%", performedByName: "System" },
          { entityType: "claim" as const, entityId: "seed", action: "status_change" as const, description: "Claim CLM-2026-0001 status changed from submitted to paid", performedByName: "Lisa Rodriguez" },
          { entityType: "payment" as const, entityId: "seed", action: "create" as const, description: "Payment of $212.00 posted for James Wilson from Delta Dental", performedByName: "Kevin Nguyen" },
          { entityType: "payment" as const, entityId: "seed", action: "reconcile" as const, description: "Payment reconciled — ERA-2026-0502 matched to CLM-2026-0007", performedByName: "Kevin Nguyen" },
          { entityType: "claim" as const, entityId: "seed", action: "status_change" as const, description: "Claim CLM-2026-0003 denied — Missing pre-operative radiograph", performedByName: "System" },
          { entityType: "claim" as const, entityId: "seed", action: "appeal" as const, description: "Appeal submitted for CLM-2026-0010 — Procedure coverage dispute", performedByName: "Lisa Rodriguez" },
          { entityType: "patient" as const, entityId: "seed", action: "create" as const, description: "New patient registered: Emily Davis (DOB: 01/30/1998)", performedByName: "Lisa Rodriguez" },
          { entityType: "patient" as const, entityId: "seed", action: "eligibility_check" as const, description: "Eligibility verified for Jennifer Anderson — United Concordia Tricare Dental", performedByName: "Kevin Nguyen" },
          { entityType: "member" as const, entityId: "seed", action: "create" as const, description: "Invited Amanda Foster (a.foster@brightsmile.dental) as viewer", performedByName: "Practice Owner" },
          { entityType: "payment" as const, entityId: "seed", action: "batch_post" as const, description: "Batch posted 3 payment(s)", performedByName: "Kevin Nguyen" },
          { entityType: "claim" as const, entityId: "seed", action: "create" as const, description: "Created claim CLM-2026-0002 for Maria Garcia — Ortho treatment $5,635.00", performedByName: "Lisa Rodriguez" },
        ];
        for (const entry of auditEntries) {
          await ctx.db.insert("auditLogs", { practiceId, ...entry });
        }
      }
    }

    if (!existing) {
      // Seed demo data inline (calling internal mutation not allowed from mutation)
      // Instead, we'll seed directly here
      const practiceId = await ctx.db.insert("practices", {
        name: "Bright Smile Dental",
        address: "1234 Oak Street, Suite 200",
        city: "Denver",
        state: "CO",
        zip: "80202",
        phone: "(303) 555-0142",
        email: "office@brightsmile.dental",
        npi: "1234567890",
        taxId: "84-1234567",
        pmsType: "open_dental",
        status: "active",
        monthlyCollectionTarget: 120000,
        ownerId: userId,
      });

      // Providers
      const drJohnson = await ctx.db.insert("providers", {
        practiceId,
        firstName: "Sarah",
        lastName: "Johnson",
        npi: "1234567891",
        specialty: "general",
        licenseNumber: "DEN-CO-45678",
        status: "active",
      });

      const drChen = await ctx.db.insert("providers", {
        practiceId,
        firstName: "Michael",
        lastName: "Chen",
        npi: "1234567892",
        specialty: "orthodontics",
        licenseNumber: "DEN-CO-45679",
        status: "active",
      });

      const drPatel = await ctx.db.insert("providers", {
        practiceId,
        firstName: "Priya",
        lastName: "Patel",
        npi: "1234567893",
        specialty: "endodontics",
        licenseNumber: "DEN-CO-45680",
        status: "active",
      });

      // Patients
      const patientsData = [
        { firstName: "James", lastName: "Wilson", dateOfBirth: "1985-03-15", gender: "male" as const, phone: "(303) 555-0201", email: "j.wilson@email.com", address: "456 Elm St", city: "Denver", state: "CO", zip: "80203", insurancePayer: "Delta Dental", insurancePlan: "PPO Plus", memberId: "DD-98765432", groupNumber: "GRP-5001", subscriberName: "James Wilson", subscriberRelation: "Self", balance: 245.00 },
        { firstName: "Maria", lastName: "Garcia", dateOfBirth: "1990-07-22", gender: "female" as const, phone: "(303) 555-0202", email: "m.garcia@email.com", address: "789 Pine Ave", city: "Denver", state: "CO", zip: "80204", insurancePayer: "Cigna Dental", insurancePlan: "DHMO", memberId: "CIG-12345678", groupNumber: "GRP-5002", subscriberName: "Maria Garcia", subscriberRelation: "Self", balance: 0 },
        { firstName: "Robert", lastName: "Thompson", dateOfBirth: "1972-11-08", gender: "male" as const, phone: "(303) 555-0203", email: "r.thompson@email.com", address: "321 Maple Dr", city: "Aurora", state: "CO", zip: "80010", insurancePayer: "MetLife Dental", insurancePlan: "PPO", memberId: "ML-45678901", groupNumber: "GRP-5003", subscriberName: "Robert Thompson", subscriberRelation: "Self", balance: 892.50 },
        { firstName: "Emily", lastName: "Davis", dateOfBirth: "1998-01-30", gender: "female" as const, phone: "(303) 555-0204", email: "e.davis@email.com", address: "654 Oak Ct", city: "Lakewood", state: "CO", zip: "80226", insurancePayer: "Delta Dental", insurancePlan: "Premier", memberId: "DD-56789012", groupNumber: "GRP-5004", subscriberName: "John Davis", subscriberRelation: "Dependent", balance: 125.00 },
        { firstName: "William", lastName: "Martinez", dateOfBirth: "1965-09-12", gender: "male" as const, phone: "(303) 555-0205", email: "w.martinez@email.com", address: "987 Cedar Ln", city: "Denver", state: "CO", zip: "80205", insurancePayer: "Aetna", insurancePlan: "DMO Plus", memberId: "AET-78901234", groupNumber: "GRP-5005", subscriberName: "William Martinez", subscriberRelation: "Self", balance: 1560.00 },
        { firstName: "Jennifer", lastName: "Anderson", dateOfBirth: "1988-04-18", gender: "female" as const, phone: "(303) 555-0206", email: "j.anderson@email.com", address: "147 Birch Way", city: "Denver", state: "CO", zip: "80206", insurancePayer: "United Concordia", insurancePlan: "Tricare Dental", memberId: "UC-23456789", groupNumber: "GRP-5006", subscriberName: "Jennifer Anderson", subscriberRelation: "Self", balance: 0 },
        { firstName: "David", lastName: "Lee", dateOfBirth: "1979-12-25", gender: "male" as const, phone: "(303) 555-0207", email: "d.lee@email.com", address: "258 Spruce Rd", city: "Englewood", state: "CO", zip: "80111", insurancePayer: "Guardian", insurancePlan: "PPO Select", memberId: "GRD-34567890", groupNumber: "GRP-5007", subscriberName: "David Lee", subscriberRelation: "Self", balance: 340.00 },
        { firstName: "Sarah", lastName: "Brown", dateOfBirth: "1995-06-03", gender: "female" as const, phone: "(303) 555-0208", email: "s.brown@email.com", address: "369 Willow Pl", city: "Denver", state: "CO", zip: "80207", insurancePayer: "Cigna Dental", insurancePlan: "PPO", memberId: "CIG-67890123", groupNumber: "GRP-5008", subscriberName: "Sarah Brown", subscriberRelation: "Self", balance: 0 },
      ];

      const patientIds: any[] = [];
      for (const p of patientsData) {
        const id = await ctx.db.insert("patients", { practiceId, ...p, status: "active" });
        patientIds.push(id);
      }

      // Claims
      const claimsData = [
        {
          pIdx: 0, provId: drJohnson, claimNumber: "CLM-2026-0001", dateOfService: "2026-05-15", submissionDate: "2026-05-16",
          procedures: [
            { cdtCode: "D0120", description: "Periodic oral evaluation", fee: 65, units: 1 },
            { cdtCode: "D1110", description: "Prophylaxis - adult", fee: 115, units: 1 },
            { cdtCode: "D0274", description: "Bitewings - four films", fee: 85, units: 1 },
          ],
          totalFee: 265, insurancePayer: "Delta Dental", status: "paid" as const,
          paidAmount: 212, adjustmentAmount: 28, patientResponsibility: 25,
        },
        {
          pIdx: 1, provId: drChen, claimNumber: "CLM-2026-0002", dateOfService: "2026-05-17", submissionDate: "2026-05-18",
          procedures: [
            { cdtCode: "D8080", description: "Comprehensive orthodontic treatment", fee: 5500, units: 1 },
            { cdtCode: "D0330", description: "Panoramic radiograph", fee: 135, units: 1 },
          ],
          totalFee: 5635, insurancePayer: "Cigna Dental", status: "submitted" as const,
        },
        {
          pIdx: 2, provId: drPatel, claimNumber: "CLM-2026-0003", dateOfService: "2026-05-10", submissionDate: "2026-05-11",
          procedures: [
            { cdtCode: "D3330", description: "Endodontic therapy, molar", toothNumber: "19", fee: 1250, units: 1 },
            { cdtCode: "D2740", description: "Crown - porcelain/ceramic", toothNumber: "19", fee: 1350, units: 1 },
          ],
          totalFee: 2600, insurancePayer: "MetLife Dental", status: "denied" as const,
          denialReason: "Missing pre-operative radiograph", denialCode: "CO-50",
        },
        {
          pIdx: 3, provId: drJohnson, claimNumber: "CLM-2026-0004", dateOfService: "2026-05-19",
          procedures: [
            { cdtCode: "D0120", description: "Periodic oral evaluation", fee: 65, units: 1 },
            { cdtCode: "D4341", description: "Periodontal scaling, per quadrant", fee: 285, units: 4 },
          ],
          totalFee: 1205, insurancePayer: "Delta Dental", status: "scrubbing" as const,
          aiScrubResult: {
            score: 72,
            issues: [
              { severity: "error" as const, code: "NARR-001", message: "Missing clinical narrative for D4341", suggestion: "Add periodontal charting documentation showing pocket depths ≥ 4mm to support medical necessity." },
              { severity: "warning" as const, code: "FREQ-002", message: "D4341 frequency limitation may apply", suggestion: "Verify patient's last SRP date — most plans allow once per quadrant every 24 months." },
              { severity: "info" as const, code: "ATT-001", message: "Consider attaching current periapical radiographs", suggestion: "Including recent radiographs improves first-pass acceptance rate by 34%." },
            ],
            scrubDate: "2026-05-19",
          },
        },
        {
          pIdx: 4, provId: drJohnson, claimNumber: "CLM-2026-0005", dateOfService: "2026-05-20",
          procedures: [
            { cdtCode: "D2750", description: "Crown - porcelain fused to high noble metal", toothNumber: "14", fee: 1450, units: 1 },
            { cdtCode: "D2950", description: "Core buildup, including any pins", toothNumber: "14", fee: 325, units: 1 },
          ],
          totalFee: 1775, insurancePayer: "Aetna", status: "ready" as const,
          aiScrubResult: {
            score: 96,
            issues: [
              { severity: "info" as const, code: "DOC-001", message: "All documentation complete", suggestion: "Claim is clean and ready for submission." },
            ],
            scrubDate: "2026-05-20",
          },
        },
        {
          pIdx: 5, provId: drChen, claimNumber: "CLM-2026-0006", dateOfService: "2026-05-12", submissionDate: "2026-05-13",
          procedures: [
            { cdtCode: "D0150", description: "Comprehensive oral evaluation", fee: 95, units: 1 },
            { cdtCode: "D8070", description: "Comprehensive orthodontic treatment", fee: 4800, units: 1 },
          ],
          totalFee: 4895, insurancePayer: "United Concordia", status: "accepted" as const,
        },
        {
          pIdx: 6, provId: drPatel, claimNumber: "CLM-2026-0007", dateOfService: "2026-05-08", submissionDate: "2026-05-09",
          procedures: [
            { cdtCode: "D3310", description: "Endodontic therapy, anterior", toothNumber: "8", fee: 850, units: 1 },
          ],
          totalFee: 850, insurancePayer: "Guardian", status: "paid" as const,
          paidAmount: 680, adjustmentAmount: 85, patientResponsibility: 85,
        },
        {
          pIdx: 0, provId: drJohnson, claimNumber: "CLM-2026-0008", dateOfService: "2026-05-21",
          procedures: [
            { cdtCode: "D2391", description: "Resin composite - one surface, posterior", toothNumber: "30", surface: "O", fee: 225, units: 1 },
            { cdtCode: "D2392", description: "Resin composite - two surfaces, posterior", toothNumber: "31", surface: "MO", fee: 295, units: 1 },
          ],
          totalFee: 520, insurancePayer: "Delta Dental", status: "draft" as const,
        },
        {
          pIdx: 7, provId: drJohnson, claimNumber: "CLM-2026-0009", dateOfService: "2026-05-05", submissionDate: "2026-05-06",
          procedures: [
            { cdtCode: "D0120", description: "Periodic oral evaluation", fee: 65, units: 1 },
            { cdtCode: "D1110", description: "Prophylaxis - adult", fee: 115, units: 1 },
          ],
          totalFee: 180, insurancePayer: "Cigna Dental", status: "paid" as const,
          paidAmount: 162, adjustmentAmount: 18, patientResponsibility: 0,
        },
        {
          pIdx: 2, provId: drJohnson, claimNumber: "CLM-2026-0010", dateOfService: "2026-04-28", submissionDate: "2026-04-29",
          procedures: [
            { cdtCode: "D7210", description: "Extraction, erupted tooth - surgical", toothNumber: "1", fee: 350, units: 1 },
            { cdtCode: "D9230", description: "Inhalation of nitrous oxide", fee: 75, units: 1 },
          ],
          totalFee: 425, insurancePayer: "MetLife Dental", status: "appealed" as const,
          denialReason: "Procedure not covered under current plan", denialCode: "CO-96",
        },
      ];

      for (const c of claimsData) {
        await ctx.db.insert("claims", {
          practiceId,
          patientId: patientIds[c.pIdx],
          providerId: c.provId,
          claimNumber: c.claimNumber,
          dateOfService: c.dateOfService,
          submissionDate: c.submissionDate,
          procedures: c.procedures.map((p: any) => ({ cdtCode: p.cdtCode, description: p.description, toothNumber: p.toothNumber, surface: p.surface, fee: p.fee, units: p.units })),
          totalFee: c.totalFee,
          insurancePayer: c.insurancePayer,
          status: c.status,
          paidAmount: (c as any).paidAmount,
          adjustmentAmount: (c as any).adjustmentAmount,
          patientResponsibility: (c as any).patientResponsibility,
          denialReason: (c as any).denialReason,
          denialCode: (c as any).denialCode,
          aiScrubResult: (c as any).aiScrubResult,
        });
      }

      // Payments
      await ctx.db.insert("payments", { practiceId, patientId: patientIds[0], paymentDate: "2026-05-20", amount: 212, paymentType: "insurance", payerName: "Delta Dental", checkNumber: "EFT-88901", eraReferenceNumber: "ERA-2026-0501", status: "posted" });
      await ctx.db.insert("payments", { practiceId, patientId: patientIds[6], paymentDate: "2026-05-18", amount: 680, paymentType: "insurance", payerName: "Guardian", checkNumber: "EFT-88902", eraReferenceNumber: "ERA-2026-0502", status: "reconciled" });
      await ctx.db.insert("payments", { practiceId, patientId: patientIds[7], paymentDate: "2026-05-14", amount: 162, paymentType: "insurance", payerName: "Cigna Dental", checkNumber: "EFT-88903", eraReferenceNumber: "ERA-2026-0503", status: "reconciled" });
      await ctx.db.insert("payments", { practiceId, patientId: patientIds[2], paymentDate: "2026-05-16", amount: 500, paymentType: "patient", payerName: "Robert Thompson", checkNumber: "CHK-4401", status: "posted" });

      // Tasks
      const tasksData = [
        { title: "Appeal denied claim CLM-2026-0003", description: "Gather pre-op radiograph and submit appeal for endodontic therapy claim denied for missing documentation.", category: "denial_appeal" as const, priority: "urgent" as const, status: "open" as const, dueDate: "2026-05-24" },
        { title: "Submit claim CLM-2026-0005", description: "Claim has passed AI scrubbing with 96% score. Ready for submission to Aetna.", category: "claim_submission" as const, priority: "high" as const, status: "open" as const, dueDate: "2026-05-23" },
        { title: "Follow up on CLM-2026-0002", description: "Ortho claim submitted to Cigna 5 days ago. Check claim status and ensure it's in adjudication.", category: "claim_followup" as const, priority: "medium" as const, status: "in_progress" as const, dueDate: "2026-05-25" },
        { title: "Verify eligibility - New patient consult", description: "Verify dental benefits for upcoming new patient consultation on 05/28.", category: "eligibility_verification" as const, priority: "medium" as const, status: "open" as const, dueDate: "2026-05-26" },
        { title: "Post ERA payment batch", description: "New ERA received from Delta Dental. Reconcile and post payments to patient ledgers.", category: "payment_posting" as const, priority: "high" as const, status: "open" as const, dueDate: "2026-05-23" },
        { title: "Send patient statements", description: "Generate and send monthly statements for patients with outstanding balances > $100.", category: "patient_billing" as const, priority: "low" as const, status: "open" as const, dueDate: "2026-05-30" },
      ];

      for (const t of tasksData) {
        await ctx.db.insert("tasks", { practiceId, assignedTo: userId, ...t });
      }

      // Practice Members (RBAC)
      await ctx.db.insert("practiceMembers", {
        practiceId,
        userId,
        role: "owner",
        firstName: "Practice",
        lastName: "Owner",
        email: "owner@brightsmile.dental",
        status: "active",
      });

      await ctx.db.insert("practiceMembers", {
        practiceId,
        userId,
        role: "billing_manager",
        firstName: "Lisa",
        lastName: "Rodriguez",
        email: "l.rodriguez@brightsmile.dental",
        status: "active",
      });

      await ctx.db.insert("practiceMembers", {
        practiceId,
        userId,
        role: "billing_specialist",
        firstName: "Kevin",
        lastName: "Nguyen",
        email: "k.nguyen@brightsmile.dental",
        status: "active",
      });

      await ctx.db.insert("practiceMembers", {
        practiceId,
        userId,
        role: "viewer",
        firstName: "Amanda",
        lastName: "Foster",
        email: "a.foster@brightsmile.dental",
        status: "invited",
        invitedAt: "2026-05-20",
      });

      // Audit Logs (sample entries)
      const auditEntries = [
        { entityType: "claim" as const, entityId: "seed", action: "create" as const, description: "Created claim CLM-2026-0001 for James Wilson", performedByName: "Lisa Rodriguez" },
        { entityType: "claim" as const, entityId: "seed", action: "ai_scrub" as const, description: "AI scrub completed for CLM-2026-0004 — Score: 72%", performedByName: "System" },
        { entityType: "claim" as const, entityId: "seed", action: "status_change" as const, description: "Claim CLM-2026-0001 status changed from submitted to paid", performedByName: "Lisa Rodriguez" },
        { entityType: "payment" as const, entityId: "seed", action: "create" as const, description: "Payment of $212.00 posted for James Wilson from Delta Dental", performedByName: "Kevin Nguyen" },
        { entityType: "payment" as const, entityId: "seed", action: "reconcile" as const, description: "Payment reconciled — ERA-2026-0502 matched to CLM-2026-0007", performedByName: "Kevin Nguyen" },
        { entityType: "claim" as const, entityId: "seed", action: "status_change" as const, description: "Claim CLM-2026-0003 denied — Missing pre-operative radiograph", performedByName: "System" },
        { entityType: "claim" as const, entityId: "seed", action: "appeal" as const, description: "Appeal submitted for CLM-2026-0010 — Procedure coverage dispute", performedByName: "Lisa Rodriguez" },
        { entityType: "patient" as const, entityId: "seed", action: "create" as const, description: "New patient registered: Emily Davis (DOB: 01/30/1998)", performedByName: "Lisa Rodriguez" },
        { entityType: "patient" as const, entityId: "seed", action: "eligibility_check" as const, description: "Eligibility verified for Jennifer Anderson — United Concordia Tricare Dental", performedByName: "Kevin Nguyen" },
        { entityType: "member" as const, entityId: "seed", action: "create" as const, description: "Invited Amanda Foster (a.foster@brightsmile.dental) as viewer", performedByName: "Practice Owner" },
        { entityType: "payment" as const, entityId: "seed", action: "batch_post" as const, description: "Batch posted 3 payment(s)", performedByName: "Kevin Nguyen" },
        { entityType: "claim" as const, entityId: "seed", action: "create" as const, description: "Created claim CLM-2026-0002 for Maria Garcia — Ortho treatment $5,635.00", performedByName: "Lisa Rodriguez" },
      ];

      for (const entry of auditEntries) {
        await ctx.db.insert("auditLogs", { practiceId, ...entry });
      }

      // Appointments (seed data)
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];

      // Get first 4 patients and 2 providers for appointments
      const seedPatients = await ctx.db
        .query("patients")
        .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
        .take(6);
      const seedProviders = await ctx.db
        .query("providers")
        .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
        .take(3);

      if (seedPatients.length >= 4 && seedProviders.length >= 2) {
        const appointmentSeeds = [
          { patientId: seedPatients[0]._id, providerId: seedProviders[0]._id, title: "Routine Cleaning", date: today, startTime: "09:00", endTime: "09:45", type: "cleaning" as const, status: "confirmed" as const, insuranceVerified: true, estimatedCost: 150 },
          { patientId: seedPatients[1]._id, providerId: seedProviders[0]._id, title: "Crown Prep — #14", date: today, startTime: "10:00", endTime: "11:00", type: "crown" as const, status: "checked_in" as const, insuranceVerified: true, estimatedCost: 1200 },
          { patientId: seedPatients[2]._id, providerId: seedProviders[1]._id, title: "Composite Filling — #19 MOD", date: today, startTime: "11:30", endTime: "12:15", type: "filling" as const, status: "scheduled" as const, insuranceVerified: false, estimatedCost: 280 },
          { patientId: seedPatients[3]._id, providerId: seedProviders[0]._id, title: "Comprehensive Exam + X-Rays", date: today, startTime: "14:00", endTime: "14:45", type: "exam" as const, status: "scheduled" as const, insuranceVerified: true, estimatedCost: 200 },
          { patientId: seedPatients[0]._id, providerId: seedProviders[1]._id, title: "Root Canal — #30", date: tomorrow, startTime: "09:00", endTime: "10:30", type: "root_canal" as const, status: "scheduled" as const, insuranceVerified: true, estimatedCost: 950 },
          { patientId: seedPatients[1]._id, providerId: seedProviders[0]._id, title: "Follow-Up — Post-Crown Check", date: tomorrow, startTime: "11:00", endTime: "11:30", type: "follow_up" as const, status: "scheduled" as const, insuranceVerified: true, estimatedCost: 0 },
          { patientId: seedPatients[2]._id, providerId: seedProviders[1]._id, title: "Emergency — Cracked Tooth", date: tomorrow, startTime: "14:00", endTime: "15:00", type: "emergency" as const, status: "confirmed" as const, insuranceVerified: false, estimatedCost: 400 },
          { patientId: seedPatients[3]._id, providerId: seedProviders[0]._id, title: "Prophylaxis + Fluoride", date: dayAfter, startTime: "09:00", endTime: "09:45", type: "cleaning" as const, status: "scheduled" as const, insuranceVerified: true, estimatedCost: 175 },
          { patientId: seedPatients.length > 4 ? seedPatients[4]._id : seedPatients[0]._id, providerId: seedProviders[1]._id, title: "Extraction — #1 (Wisdom)", date: dayAfter, startTime: "10:00", endTime: "11:00", type: "extraction" as const, status: "scheduled" as const, insuranceVerified: true, estimatedCost: 350 },
          { patientId: seedPatients.length > 5 ? seedPatients[5]._id : seedPatients[1]._id, providerId: seedProviders[0]._id, title: "Ortho Consultation", date: dayAfter, startTime: "13:00", endTime: "13:45", type: "consultation" as const, status: "scheduled" as const, insuranceVerified: false, estimatedCost: 150 },
        ];

        for (const appt of appointmentSeeds) {
          await ctx.db.insert("appointments", { practiceId, ...appt });
        }
      }
    }

    return null;
  },
});
