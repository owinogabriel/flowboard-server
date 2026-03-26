import { Response } from "express";
import db from "../db/index.js";
import { workspaces, workspaceMembers, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../types/index.js";

/**
 * Safely parses a route parameter to an integer.
 * Express types req.params values as `string | string[]`, but parseInt only
 * accepts `string`, so we unwrap arrays by taking the first element.
 */
const parseId = (id: string | string[]): number =>
  parseInt(Array.isArray(id) ? id[0] : id, 10);

/**
 * GET /workspaces
 * Returns all workspaces the authenticated user is a member of,
 * including their role in each workspace.
 */
export const getWorkspaces = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Join workspaceMembers → workspaces to get only workspaces this user belongs to
    const myWorkspaces = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        color: workspaces.color,
        ownerId: workspaces.ownerId,
        createdAt: workspaces.createdAt,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, req.userId!));

    res.json({ success: true, count: myWorkspaces.length, data: myWorkspaces });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /workspaces/:id
 * Returns a single workspace by ID, along with its full member list.
 * Requires the authenticated user to be a member of the workspace.
 */
export const getWorkspaceById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    // check if workspace exist
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));

    if (!workspace.length) {
      res.status(404).json({ success: false, message: "Workspace not found" });
      return;
    }

    // Ensure the requesting user is a member (guards against unauthorised access)
    const member = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, id),
          eq(workspaceMembers.userId, req.userId!),
        ),
      );

    if (!member.length) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    // Fetch all members with their user details and role
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, id));

    res.json({ success: true, data: { ...workspace[0], members } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /workspaces
 * Creates a new workspace owned by the authenticated user.
 * Automatically adds the creator as a member with the 'owner' role.
 */
export const createWorkspace = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    const newWorkspace = await db
      .insert(workspaces)
      .values({ name, description, color, ownerId: req.userId! })
      .returning();
    // Auto-enrol the creator so they appear in member queries
    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace[0].id,
      userId: req.userId!,
      role: "owner",
    });

    res.status(201).json({ success: true, data: newWorkspace[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /workspaces/:id
 * Updates name, description, and/or color of a workspace.
 * Only the workspace owner is permitted to make changes.
 */
export const updateWorksapce = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { name, description, color } = req.body;

    // verify ownership
    const workspace = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, id), eq(workspaces.ownerId, req.userId!)));

    if (!workspace.length) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Only include fields that were actually provided in the request body
    const updated = await db
      .update(workspaces)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }), // Only include description in the object if it’s not undefined.
        ...and(color && { color }),
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /workspaces/:id
 * Permanently deletes a workspace and (via cascade) its members and data.
 * Only the workspace owner is permitted to delete it.
 */
export const deleteWorkspace = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    // Verify ownership before allowing deletion
    const workspace = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, id), eq(workspaces.ownerId, req.userId!)));

    if (!workspace.length) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    await db.delete(workspaces).where(eq(workspaces.id, id));
    res.json({ succes: true, message: "Workspace deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
