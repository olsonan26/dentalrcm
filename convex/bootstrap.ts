import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const bootstrapUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { email, name }) => {
    // Find existing user by email
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    let userId;
    if (existingUser) {
      userId = existingUser._id;
      // Update name if changed
      if (existingUser.name !== name) {
        await ctx.db.patch(userId, { name });
      }
    } else {
      // Create new user record
      userId = await ctx.db.insert("users", {
        email,
        name,
      });
    }

    // Find practice owned by this user
    let practice = await ctx.db
      .query("practices")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();

    // If no practice, check if user is a member of any practice
    if (!practice) {
      const membership = await ctx.db
        .query("practiceMembers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      if (membership) {
        practice = await ctx.db.get(membership.practiceId);
      }
    }

    return {
      userId,
      practiceId: practice?._id ?? null,
    };
  },
});
