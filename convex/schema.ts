import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Dental practices
  practices: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    phone: v.string(),
    email: v.string(),
    npi: v.string(), // National Provider Identifier
    taxId: v.string(),
    pmsType: v.union(
      v.literal("open_dental"),
      v.literal("dentrix"),
      v.literal("eaglesoft"),
      v.literal("curve"),
      v.literal("other")
    ),
    status: v.union(v.literal("active"), v.literal("onboarding"), v.literal("inactive")),
    monthlyCollectionTarget: v.number(),
    ownerId: v.id("users"),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  // Providers (dentists) within a practice
  providers: defineTable({
    practiceId: v.id("practices"),
    firstName: v.string(),
    lastName: v.string(),
    npi: v.string(),
    specialty: v.union(
      v.literal("general"),
      v.literal("orthodontics"),
      v.literal("oral_surgery"),
      v.literal("periodontics"),
      v.literal("endodontics"),
      v.literal("pediatric"),
      v.literal("prosthodontics"),
      v.literal("other")
    ),
    licenseNumber: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_practice", ["practiceId"])
    .index("by_npi", ["npi"]),

  // Patients
  patients: defineTable({
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
    balance: v.number(), // outstanding patient balance
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_practice", ["practiceId"])
    .index("by_name", ["lastName", "firstName"])
    .index("by_practice_and_status", ["practiceId", "status"]),

  // Insurance claims
  claims: defineTable({
    practiceId: v.id("practices"),
    patientId: v.id("patients"),
    providerId: v.id("providers"),
    claimNumber: v.string(),
    dateOfService: v.string(),
    submissionDate: v.optional(v.string()),
    procedures: v.array(
      v.object({
        cdtCode: v.string(),
        description: v.string(),
        toothNumber: v.optional(v.string()),
        surface: v.optional(v.string()),
        fee: v.number(),
        units: v.number(),
      })
    ),
    totalFee: v.number(),
    insurancePayer: v.string(),
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
    aiScrubResult: v.optional(
      v.object({
        score: v.number(), // 0-100 clean claim score
        issues: v.array(
          v.object({
            severity: v.union(v.literal("error"), v.literal("warning"), v.literal("info")),
            code: v.string(),
            message: v.string(),
            suggestion: v.string(),
          })
        ),
        scrubDate: v.string(),
      })
    ),
    paidAmount: v.optional(v.number()),
    adjustmentAmount: v.optional(v.number()),
    patientResponsibility: v.optional(v.number()),
    denialReason: v.optional(v.string()),
    denialCode: v.optional(v.string()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
  })
    .index("by_practice", ["practiceId"])
    .index("by_patient", ["patientId"])
    .index("by_status", ["status"])
    .index("by_practice_and_status", ["practiceId", "status"])
    .index("by_assigned", ["assignedTo"])
    .index("by_claim_number", ["claimNumber"]),

  // Payments / ERA records
  payments: defineTable({
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
    status: v.union(v.literal("pending"), v.literal("posted"), v.literal("reconciled")),
    notes: v.optional(v.string()),
  })
    .index("by_practice", ["practiceId"])
    .index("by_claim", ["claimId"])
    .index("by_patient", ["patientId"])
    .index("by_status", ["status"])
    .index("by_practice_and_status", ["practiceId", "status"]),

  // Billing tasks for specialists
  tasks: defineTable({
    practiceId: v.id("practices"),
    claimId: v.optional(v.id("claims")),
    patientId: v.optional(v.id("patients")),
    assignedTo: v.optional(v.id("users")),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("claim_submission"),
      v.literal("claim_followup"),
      v.literal("denial_appeal"),
      v.literal("payment_posting"),
      v.literal("eligibility_verification"),
      v.literal("patient_billing"),
      v.literal("credentialing"),
      v.literal("other")
    ),
    priority: v.union(v.literal("urgent"), v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    dueDate: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  })
    .index("by_practice", ["practiceId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_practice_and_status", ["practiceId", "status"])
    .index("by_priority", ["priority"]),
  // Audit log for compliance tracking
  auditLogs: defineTable({
    practiceId: v.id("practices"),
    entityType: v.union(
      v.literal("claim"),
      v.literal("payment"),
      v.literal("patient"),
      v.literal("provider"),
      v.literal("task"),
      v.literal("practice"),
      v.literal("member")
    ),
    entityId: v.string(), // ID of the affected record
    action: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("delete"),
      v.literal("status_change"),
      v.literal("reconcile"),
      v.literal("batch_post"),
      v.literal("role_change"),
      v.literal("ai_scrub"),
      v.literal("appeal"),
      v.literal("eligibility_check")
    ),
    description: v.string(),
    changes: v.optional(v.string()), // JSON-stringified before/after
    performedBy: v.optional(v.id("users")),
    performedByName: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_practice", ["practiceId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_performed_by", ["performedBy"]),

  // Practice team members with roles
  practiceMembers: defineTable({
    practiceId: v.id("practices"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("billing_manager"),
      v.literal("billing_specialist"),
      v.literal("viewer")
    ),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("deactivated")),
    invitedAt: v.optional(v.string()),
    lastActiveAt: v.optional(v.string()),
  })
    .index("by_practice", ["practiceId"])
    .index("by_user", ["userId"])
    .index("by_practice_and_user", ["practiceId", "userId"]),

  // Claim activity log (notes, status changes, scrub results, appeal letters)
  claimActivities: defineTable({
    practiceId: v.id("practices"),
    claimId: v.id("claims"),
    type: v.union(
      v.literal("note"),
      v.literal("status_change"),
      v.literal("scrub_result"),
      v.literal("appeal_letter"),
      v.literal("system")
    ),
    content: v.string(),
    metadata: v.optional(v.object({
      oldStatus: v.optional(v.string()),
      newStatus: v.optional(v.string()),
      scrubScore: v.optional(v.number()),
      appealLetterText: v.optional(v.string()),
    })),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_claim", ["claimId"])
    .index("by_practice", ["practiceId"]),
});

export default schema;
