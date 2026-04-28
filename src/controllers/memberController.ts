import { Response } from "express";
import db from "../db/index.js";
import { workspaceMembers, users, workspaces } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../types/index.js";

/**
 * Safely parses a route parameter to an integer.
 * Express types req.params values as `string | string[]`, so we unwrap
 * arrays by taking the first element before passing to parseInt.
 */
const parseId = (id: string | string[]): number =>
  parseInt(Array.isArray(id) ? id[0] : id, 10);

/**
 * POST /workspaces/:workspaceId/members
 * Adds a new member to a workspace by email address.
 * Only owners and admins are permitted to invite new members.
 * Role defaults to 'member' if not specified in the request body.
 */
export const addMember = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const workspaceId = parseId(req.params.workspaceId);
    const { email, role } = req.body;

    // Verify the requester exists in this workspace and holds a privileged role
    const requester = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, req.userId!),
        ),
      );

    if (!requester.length || !["owner", "admin"].includes(requester[0].role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Look up the invitee by email — they must already have an account
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user.length) {
      res.status(404).json({
        success: false,
        message:
          "No Flowboard account found with that email. Ask them to sign up first.",
      });
      return;
    }

    // Prevent duplicate membership entries
    const existing = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, user[0].id),
        ),
      );

    if (existing.length) {
      res
        .status(400)
        .json({ success: false, message: "User is already a member" });
      return;
    }

    const newMember = await db
      .insert(workspaceMembers)
      .values({ workspaceId, userId: user[0].id, role: role || "member" })
      .returning();

    res.status(201).json({ success: true, data: newMember[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /workspaces/:workspaceId/members/:userId
 * Removes a member from a workspace.
 * Only the workspace owner can remove members.
 */
export const removeMember = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const workspaceId = parseId(req.params.workspaceId);
    const userId = parseId(req.params.userId);

    // Only the owner may remove members — admins cannot
    const workspace = await db
      .select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, workspaceId),
          eq(workspaces.ownerId, req.userId!),
        ),
      );

    if (!workspace.length) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    res.json({ success: true, message: "Member removed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /workspaces/:workspaceId/members/:userId
 * Updates the role of an existing workspace member.
 * Only the workspace owner can change member roles.
 */
export const updateMemberRole = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const workspaceId = parseId(req.params.workspaceId);
    const userId = parseId(req.params.userId);
    const { role } = req.body;

    // Only the owner may reassign roles — admins cannot elevate or demote others
    const workspace = await db
      .select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, workspaceId),
          eq(workspaces.ownerId, req.userId!),
        ),
      );

    if (!workspace.length) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const updated = await db
      .update(workspaceMembers)
      .set({ role })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      )
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
