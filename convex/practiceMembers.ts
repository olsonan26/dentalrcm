import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all members for a practice
export const listByPractice = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const members = await ctx.db
      .query("practiceMembers")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .collect();

    return members.sort((a, b) => {
      // Sort: owner first, then by role weight, then name
      const roleOrder: Record<string, number> = {
        owner: 0,
        admin: 1,
        billing_manager: 2,
        billing_specialist: 3,
        viewer: 4,
      };
      const ra = roleOrder[a.role] ?? 99;
      const rb = roleOrder[b.role] ?? 99;
      if (ra !== rb) return ra - rb;
      return a.lastName.localeCompare(b.lastName);
    });
  },
});

// Add a member (invite)
export const addMember = mutation({
  args: {
    practiceId: v.id("practices"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("billing_manager"),
      v.literal("billing_specialist"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    // Check if this user already exists
    const existing = await ctx.db
      .query("practiceMembers")
      .withIndex("by_practice", (q) => q.eq("practiceId", args.practiceId))
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      throw new Error("A member with this email already exists in this practice");
    }

    // We create the member entry — in production, this would trigger an invite email
    // For now, create with a placeholder userId
    const identity = await ctx.auth.getUserIdentity(); // May be null (Supabase auth)

    // Look up the user by email, or use the current user as placeholder
    const users = await ctx.db.query("users").collect();
    const existingUser = users.find(
      (u: any) => u.email === args.email
    );

    const memberId = await ctx.db.insert("practiceMembers", {
      practiceId: args.practiceId,
      userId: existingUser?._id ?? (identity?.subject as any),
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      role: args.role,
      status: existingUser ? "active" : "invited",
      invitedAt: new Date().toISOString().split("T")[0],
    });

    // Audit
    await ctx.db.insert("auditLogs", {
      practiceId: args.practiceId,
      entityType: "member",
      entityId: memberId,
      action: "create",
      description: `Invited ${args.firstName} ${args.lastName} (${args.email}) as ${args.role.replace("_", " ")}`,
      performedByName: identity?.name ?? "System",
    });

    return memberId;
  },
});

// Update member role
export const updateRole = mutation({
  args: {
    memberId: v.id("practiceMembers"),
    role: v.union(
      v.literal("admin"),
      v.literal("billing_manager"),
      v.literal("billing_specialist"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, { memberId, role }) => {
    const member = await ctx.db.get(memberId);
    if (!member) throw new Error("Member not found");
    if (member.role === "owner") throw new Error("Cannot change the owner's role");

    const oldRole = member.role;
    await ctx.db.patch(memberId, { role });

    const user = await ctx.auth.getUserIdentity();
    await ctx.db.insert("auditLogs", {
      practiceId: member.practiceId,
      entityType: "member",
      entityId: memberId,
      action: "role_change",
      description: `Changed ${member.firstName} ${member.lastName}'s role from ${oldRole.replace("_", " ")} to ${role.replace("_", " ")}`,
      changes: JSON.stringify({ oldRole, newRole: role }),
      performedByName: user?.name ?? "System",
    });
  },
});

// Deactivate a member
export const deactivate = mutation({
  args: { memberId: v.id("practiceMembers") },
  handler: async (ctx, { memberId }) => {
    const member = await ctx.db.get(memberId);
    if (!member) throw new Error("Member not found");
    if (member.role === "owner") throw new Error("Cannot deactivate the owner");

    await ctx.db.patch(memberId, { status: "deactivated" });

    const user = await ctx.auth.getUserIdentity();
    await ctx.db.insert("auditLogs", {
      practiceId: member.practiceId,
      entityType: "member",
      entityId: memberId,
      action: "status_change",
      description: `Deactivated ${member.firstName} ${member.lastName}`,
      performedByName: user?.name ?? "System",
    });
  },
});

// Reactivate a member
export const reactivate = mutation({
  args: { memberId: v.id("practiceMembers") },
  handler: async (ctx, { memberId }) => {
    const member = await ctx.db.get(memberId);
    if (!member) throw new Error("Member not found");

    await ctx.db.patch(memberId, { status: "active" });

    const user = await ctx.auth.getUserIdentity();
    await ctx.db.insert("auditLogs", {
      practiceId: member.practiceId,
      entityType: "member",
      entityId: memberId,
      action: "status_change",
      description: `Reactivated ${member.firstName} ${member.lastName}`,
      performedByName: user?.name ?? "System",
    });
  },
});

// Get current user's role for a practice
export const getMyRole = query({
  args: { practiceId: v.id("practices") },
  handler: async (ctx, { practiceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Check if user is the practice owner
    const practice = await ctx.db.get(practiceId);
    if (practice) {
      // For practice owners, return owner role
      const users = await ctx.db.query("users").collect();
      const currentUser = users.find(
        (u: any) => u.email === identity?.email
      );
      if (currentUser && practice.ownerId === currentUser._id) {
        return { role: "owner" as const, memberId: null };
      }
    }

    const member = await ctx.db
      .query("practiceMembers")
      .withIndex("by_practice", (q) => q.eq("practiceId", practiceId))
      .filter((q) => q.eq(q.field("email"), identity?.email ?? ""))
      .first();

    return member
      ? { role: member.role, memberId: member._id }
      : null;
  },
});
