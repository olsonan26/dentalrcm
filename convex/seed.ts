import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDemoData = internalMutation({
  args: { userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    // Check if data already seeded
    const existing = await ctx.db.query("practices").withIndex("by_owner", (q) => q.eq("ownerId", userId)).first();
    if (existing) return null;

    // Create practice
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

    // Create providers
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

    // Create patients
    const patients = [
      { firstName: "James", lastName: "Wilson", dateOfBirth: "1985-03-15", gender: "male" as const, phone: "(303) 555-0201", email: "j.wilson@email.com", address: "456 Elm St", city: "Denver", state: "CO", zip: "80203", insurancePayer: "Delta Dental", insurancePlan: "PPO Plus", memberId: "DD-98765432", groupNumber: "GRP-5001", subscriberName: "James Wilson", subscriberRelation: "Self", balance: 245.00 },
      { firstName: "Maria", lastName: "Garcia", dateOfBirth: "1990-07-22", gender: "female" as const, phone: "(303) 555-0202", email: "m.garcia@email.com", address: "789 Pine Ave", city: "Denver", state: "CO", zip: "80204", insurancePayer: "Cigna Dental", insurancePlan: "DHMO", memberId: "CIG-12345678", groupNumber: "GRP-5002", subscriberName: "Maria Garcia", subscriberRelation: "Self", balance: 0 },
      { firstName: "Robert", lastName: "Thompson", dateOfBirth: "1972-11-08", gender: "male" as const, phone: "(303) 555-0203", email: "r.thompson@email.com", address: "321 Maple Dr", city: "Aurora", state: "CO", zip: "80010", insurancePayer: "MetLife Dental", insurancePlan: "PPO", memberId: "ML-45678901", groupNumber: "GRP-5003", subscriberName: "Robert Thompson", subscriberRelation: "Self", balance: 892.50 },
      { firstName: "Emily", lastName: "Davis", dateOfBirth: "1998-01-30", gender: "female" as const, phone: "(303) 555-0204", email: "e.davis@email.com", address: "654 Oak Ct", city: "Lakewood", state: "CO", zip: "80226", insurancePayer: "Delta Dental", insurancePlan: "Premier", memberId: "DD-56789012", groupNumber: "GRP-5004", subscriberName: "John Davis", subscriberRelation: "Dependent", balance: 125.00 },
      { firstName: "William", lastName: "Martinez", dateOfBirth: "1965-09-12", gender: "male" as const, phone: "(303) 555-0205", email: "w.martinez@email.com", address: "987 Cedar Ln", city: "Denver", state: "CO", zip: "80205", insurancePayer: "Aetna", insurancePlan: "DMO Plus", memberId: "AET-78901234", groupNumber: "GRP-5005", subscriberName: "William Martinez", subscriberRelation: "Self", balance: 1560.00 },
      { firstName: "Jennifer", lastName: "Anderson", dateOfBirth: "1988-04-18", gender: "female" as const, phone: "(303) 555-0206", email: "j.anderson@email.com", address: "147 Birch Way", city: "Denver", state: "CO", zip: "80206", insurancePayer: "United Concordia", insurancePlan: "Tricare Dental", memberId: "UC-23456789", groupNumber: "GRP-5006", subscriberName: "Jennifer Anderson", subscriberRelation: "Self", balance: 0 },
      { firstName: "David", lastName: "Lee", dateOfBirth: "1979-12-25", gender: "male" as const, phone: "(303) 555-0207", email: "d.lee@email.com", address: "258 Spruce Rd", city: "Englewood", state: "CO", zip: "80111", insurancePayer: "Guardian", insurancePlan: "PPO Select", memberId: "GRD-34567890", groupNumber: "GRP-5007", subscriberName: "David Lee", subscriberRelation: "Self", balance: 340.00 },
      { firstName: "Sarah", lastName: "Brown", dateOfBirth: "1995-06-03", gender: "female" as const, phone: "(303) 555-0208", email: "s.brown@email.com", address: "369 Willow Pl", city: "Denver", state: "CO", zip: "80207", insurancePayer: "Cigna Dental", insurancePlan: "PPO", memberId: "CIG-67890123", groupNumber: "GRP-5008", subscriberName: "Sarah Brown", subscriberRelation: "Self", balance: 0 },
    ];

    const patientIds: string[] = [];
    for (const p of patients) {
      const id = await ctx.db.insert("patients", { practiceId, ...p, status: "active" });
      patientIds.push(id);
    }

    // Create claims with various statuses
    const claims = [
      {
        patientIdx: 0, providerId: drJohnson, claimNumber: "CLM-2026-0001", dateOfService: "2026-05-15", submissionDate: "2026-05-16",
        procedures: [
          { cdtCode: "D0120", description: "Periodic oral evaluation", fee: 65, units: 1 },
          { cdtCode: "D1110", description: "Prophylaxis - adult", fee: 115, units: 1 },
          { cdtCode: "D0274", description: "Bitewings - four films", fee: 85, units: 1 },
        ],
        totalFee: 265, insurancePayer: "Delta Dental", status: "paid" as const,
        paidAmount: 212, adjustmentAmount: 28, patientResponsibility: 25,
      },
      {
        patientIdx: 1, providerId: drChen, claimNumber: "CLM-2026-0002", dateOfService: "2026-05-17", submissionDate: "2026-05-18",
        procedures: [
          { cdtCode: "D8080", description: "Comprehensive orthodontic treatment", fee: 5500, units: 1 },
          { cdtCode: "D0330", description: "Panoramic radiograph", fee: 135, units: 1 },
        ],
        totalFee: 5635, insurancePayer: "Cigna Dental", status: "submitted" as const,
      },
      {
        patientIdx: 2, providerId: drPatel, claimNumber: "CLM-2026-0003", dateOfService: "2026-05-10", submissionDate: "2026-05-11",
        procedures: [
          { cdtCode: "D3330", description: "Endodontic therapy, molar", toothNumber: "19", fee: 1250, units: 1 },
          { cdtCode: "D2740", description: "Crown - porcelain/ceramic", toothNumber: "19", fee: 1350, units: 1 },
        ],
        totalFee: 2600, insurancePayer: "MetLife Dental", status: "denied" as const,
        denialReason: "Missing pre-operative radiograph", denialCode: "CO-50",
      },
      {
        patientIdx: 3, providerId: drJohnson, claimNumber: "CLM-2026-0004", dateOfService: "2026-05-19",
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
        patientIdx: 4, providerId: drJohnson, claimNumber: "CLM-2026-0005", dateOfService: "2026-05-20",
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
        patientIdx: 5, providerId: drChen, claimNumber: "CLM-2026-0006", dateOfService: "2026-05-12", submissionDate: "2026-05-13",
        procedures: [
          { cdtCode: "D0150", description: "Comprehensive oral evaluation", fee: 95, units: 1 },
          { cdtCode: "D8070", description: "Comprehensive orthodontic treatment", fee: 4800, units: 1 },
        ],
        totalFee: 4895, insurancePayer: "United Concordia", status: "accepted" as const,
      },
      {
        patientIdx: 6, providerId: drPatel, claimNumber: "CLM-2026-0007", dateOfService: "2026-05-08", submissionDate: "2026-05-09",
        procedures: [
          { cdtCode: "D3310", description: "Endodontic therapy, anterior", toothNumber: "8", fee: 850, units: 1 },
        ],
        totalFee: 850, insurancePayer: "Guardian", status: "paid" as const,
        paidAmount: 680, adjustmentAmount: 85, patientResponsibility: 85,
      },
      {
        patientIdx: 0, providerId: drJohnson, claimNumber: "CLM-2026-0008", dateOfService: "2026-05-21",
        procedures: [
          { cdtCode: "D2391", description: "Resin composite - one surface, posterior", toothNumber: "30", surface: "O", fee: 225, units: 1 },
          { cdtCode: "D2392", description: "Resin composite - two surfaces, posterior", toothNumber: "31", surface: "MO", fee: 295, units: 1 },
        ],
        totalFee: 520, insurancePayer: "Delta Dental", status: "draft" as const,
      },
      {
        patientIdx: 7, providerId: drJohnson, claimNumber: "CLM-2026-0009", dateOfService: "2026-05-05", submissionDate: "2026-05-06",
        procedures: [
          { cdtCode: "D0120", description: "Periodic oral evaluation", fee: 65, units: 1 },
          { cdtCode: "D1110", description: "Prophylaxis - adult", fee: 115, units: 1 },
        ],
        totalFee: 180, insurancePayer: "Cigna Dental", status: "paid" as const,
        paidAmount: 162, adjustmentAmount: 18, patientResponsibility: 0,
      },
      {
        patientIdx: 2, providerId: drJohnson, claimNumber: "CLM-2026-0010", dateOfService: "2026-04-28", submissionDate: "2026-04-29",
        procedures: [
          { cdtCode: "D7210", description: "Extraction, erupted tooth - surgical", toothNumber: "1", fee: 350, units: 1 },
          { cdtCode: "D9230", description: "Inhalation of nitrous oxide", fee: 75, units: 1 },
        ],
        totalFee: 425, insurancePayer: "MetLife Dental", status: "appealed" as const,
        denialReason: "Procedure not covered under current plan", denialCode: "CO-96",
      },
    ];

    for (const c of claims) {
      const { patientIdx, ...claimData } = c;
      await ctx.db.insert("claims", {
        practiceId,
        patientId: patientIds[patientIdx] as any,
        providerId: claimData.providerId,
        claimNumber: claimData.claimNumber,
        dateOfService: claimData.dateOfService,
        submissionDate: claimData.submissionDate,
        procedures: claimData.procedures.map((p: any) => ({ cdtCode: p.cdtCode, description: p.description, toothNumber: p.toothNumber, surface: p.surface, fee: p.fee, units: p.units })),
        totalFee: claimData.totalFee,
        insurancePayer: claimData.insurancePayer,
        status: claimData.status,
        paidAmount: (claimData as any).paidAmount,
        adjustmentAmount: (claimData as any).adjustmentAmount,
        patientResponsibility: (claimData as any).patientResponsibility,
        denialReason: (claimData as any).denialReason,
        denialCode: (claimData as any).denialCode,
        aiScrubResult: (claimData as any).aiScrubResult,
        notes: (claimData as any).notes,
      });
    }

    // Create payments for paid claims
    await ctx.db.insert("payments", {
      practiceId,
      patientId: patientIds[0] as any,
      paymentDate: "2026-05-20",
      amount: 212,
      paymentType: "insurance",
      payerName: "Delta Dental",
      checkNumber: "EFT-88901",
      eraReferenceNumber: "ERA-2026-0501",
      status: "posted",
    });
    await ctx.db.insert("payments", {
      practiceId,
      patientId: patientIds[6] as any,
      paymentDate: "2026-05-18",
      amount: 680,
      paymentType: "insurance",
      payerName: "Guardian",
      checkNumber: "EFT-88902",
      eraReferenceNumber: "ERA-2026-0502",
      status: "reconciled",
    });
    await ctx.db.insert("payments", {
      practiceId,
      patientId: patientIds[7] as any,
      paymentDate: "2026-05-14",
      amount: 162,
      paymentType: "insurance",
      payerName: "Cigna Dental",
      checkNumber: "EFT-88903",
      eraReferenceNumber: "ERA-2026-0503",
      status: "reconciled",
    });
    await ctx.db.insert("payments", {
      practiceId,
      patientId: patientIds[2] as any,
      paymentDate: "2026-05-16",
      amount: 500,
      paymentType: "patient",
      payerName: "Robert Thompson",
      checkNumber: "CHK-4401",
      status: "posted",
    });

    // Create tasks
    const taskData = [
      { title: "Appeal denied claim CLM-2026-0003", description: "Gather pre-op radiograph and submit appeal for endodontic therapy claim denied for missing documentation.", category: "denial_appeal" as const, priority: "urgent" as const, status: "open" as const, dueDate: "2026-05-24" },
      { title: "Submit claim CLM-2026-0005", description: "Claim has passed AI scrubbing with 96% score. Ready for submission to Aetna.", category: "claim_submission" as const, priority: "high" as const, status: "open" as const, dueDate: "2026-05-23" },
      { title: "Follow up on CLM-2026-0002", description: "Ortho claim submitted to Cigna 5 days ago. Check claim status and ensure it's in adjudication.", category: "claim_followup" as const, priority: "medium" as const, status: "in_progress" as const, dueDate: "2026-05-25" },
      { title: "Verify eligibility - New patient consult", description: "Verify dental benefits for upcoming new patient consultation on 05/28.", category: "eligibility_verification" as const, priority: "medium" as const, status: "open" as const, dueDate: "2026-05-26" },
      { title: "Post ERA payment batch", description: "New ERA received from Delta Dental. Reconcile and post payments to patient ledgers.", category: "payment_posting" as const, priority: "high" as const, status: "open" as const, dueDate: "2026-05-23" },
      { title: "Send patient statements", description: "Generate and send monthly statements for patients with outstanding balances > $100.", category: "patient_billing" as const, priority: "low" as const, status: "open" as const, dueDate: "2026-05-30" },
    ];

    for (const t of taskData) {
      await ctx.db.insert("tasks", {
        practiceId,
        assignedTo: userId,
        ...t,
      });
    }

    return null;
  },
});
