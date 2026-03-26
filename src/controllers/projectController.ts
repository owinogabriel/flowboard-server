import { Response } from "express";
import db from "../db/index.js";
import { projects, workspaceMembers, tasks } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { AuthRequest } from "../types/index.js";

/**
 * Safely parses a route parameter to an integer.
 * Express types req.params values as `string | string[]`, so we unwrap
 * arrays by taking the first element before passing to parseInt.
 */
const parseId = (id: string | string[]): number =>
  parseInt(Array.isArray(id) ? id[0] : id, 10);

/**
 * Checks whether a user is a member of the given workspace.
 * Used as a lightweight access guard across all project endpoints.
 *
 * @returns true if the user belongs to the workspace, false otherwise.
 */
const isWorkspaceMember = async (
  workspaceId: number,
  userId: number,
): Promise<boolean> => {
  const member = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    );
  return member.length > 0;
};

/**
 * GET /workspaces/:workspaceId/projects
 * Returns all projects belonging to the given workspace.
 * Requires the authenticated user to be a member of the workspace.
 */
export const getProjects = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const workspaceId = parseId(req.params.workspaceId);

    if (!(await isWorkspaceMember(workspaceId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    res.json({ success: true, count: allProjects.length, data: allProjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /projects/:id
 * Returns a single project by ID, along with a breakdown of task counts per status.
 * Requires the authenticated user to be a member of the project's workspace.
 */
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    const project = await db.select().from(projects).where(eq(projects.id, id));

    if (!project.length) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Access check is done after fetching the project so we have workspaceId available
    if (!(await isWorkspaceMember(project[0].workspaceId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Aggregate task counts grouped by status (todo / in_progress / completed)
    // so the client can render progress indicators without a separate request
    const taskCounts = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .groupBy(tasks.status);

    res.json({ success: true, data: { ...project[0], taskCounts } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /workspaces/:workspaceId/projects
 * Creates a new project inside the given workspace.
 * The authenticated user becomes the project owner.
 * deadline is optional and defaults to null if omitted.
 * Requires the authenticated user to be a member of the workspace.
 */
export const createProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const workspaceId = parseId(req.params.workspaceId);

    if (!(await isWorkspaceMember(workspaceId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const { name, description, color, deadline } = req.body;

    const newProject = await db
      .insert(projects)
      .values({
        name,
        description,
        color,
        workspaceId,
        ownerId: req.userId!,
        deadline: deadline ? new Date(deadline) : null, // coerce ISO string → Date
      })
      .returning();

    res.status(201).json({ success: true, data: newProject[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /projects/:id
 * Partially updates a project. All fields are optional — only provided fields are written.
 * Any workspace member may update a project, not just the owner.
 * Requires the authenticated user to be a member of the project's workspace.
 */
export const updateProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    const project = await db.select().from(projects).where(eq(projects.id, id));

    if (!project.length) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Access check after fetch so we have workspaceId available
    if (!(await isWorkspaceMember(project[0].workspaceId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const { name, description, color, deadline } = req.body;

    // Sparse update: only include keys explicitly sent in the request body
    const updated = await db
      .update(projects)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /projects/:id
 * Permanently deletes a project and (via cascade) its tasks and comments.
 * Only the project owner is permitted to delete it — workspace members cannot.
 */
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    // Ownership check: filter by both id and ownerId in one query to avoid a separate fetch
    const project = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, req.userId!)));

    if (!project.length) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    await db.delete(projects).where(eq(projects.id, id));

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
