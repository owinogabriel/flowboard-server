import { Response } from "express";
import db from "../db/index.js";
import {
  tasks,
  projects,
  workspaceMembers,
  users,
  comments,
} from "../db/schema.js";
import { eq, and, asc } from "drizzle-orm";
import { AuthRequest } from "../types/index.js";

/**
 * Safely parses a route parameter to an integer.
 * Express types req.params values as `string | string[]`, so we unwrap
 * arrays by taking the first element before passing to parseInt.
 */
const parseId = (id: string | string[]): number =>
  parseInt(Array.isArray(id) ? id[0] : id, 10);

/**
 * Checks whether a user is a member of the workspace that owns the given project.
 * Used as a lightweight access guard across all task endpoints.
 *
 * @returns true if the user belongs to the project's workspace, false otherwise.
 */
const isProjectMember = async (
  projectId: number,
  userId: number,
): Promise<boolean> => {
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project.length) return false;

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, project[0].workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    );
  return member.length > 0;
};

/**
 * GET /projects/:projectId/tasks
 * Returns all tasks for a project, ordered by position.
 * Also returns a pre-grouped kanban view (todo / in_progress / completed).
 * Requires the authenticated user to be a member of the project's workspace.
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectId = parseId(req.params.projectId);

    if (!(await isProjectMember(projectId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Fetch tasks with their assignee details via a left join
    // (left join so tasks without an assignee are still returned)
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        position: tasks.position,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.projectId, projectId))
      .orderBy(asc(tasks.position));

    // Group tasks by status for kanban board consumption on the client
    const kanban = {
      todo: allTasks.filter((t) => t.status === "todo"),
      in_progress: allTasks.filter((t) => t.status === "in_progress"),
      completed: allTasks.filter((t) => t.status === "completed"),
    };

    res.json({ success: true, data: allTasks, kanban });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /tasks/:id
 * Returns a single task by ID, including its assignee and all comments.
 * Requires the authenticated user to be a member of the task's project workspace.
 */
export const getTaskById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    // Fetch the task with its assignee in one query
    const task = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        status: tasks.status,
        dueDate: tasks.dueDate,
        projectId: tasks.projectId,
        createdAt: tasks.createdAt,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.id, id));

    if (!task.length) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    // Access check is done after fetching the task so we have the projectId available
    if (!(await isProjectMember(task[0].projectId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Fetch comments for this task, each joined with the author's user details
    const taskComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, id));

    res.json({ success: true, data: { ...task[0], comments: taskComments } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /projects/:projectId/tasks
 * Creates a new task inside the given project.
 * assigneeId and dueDate are optional; both default to null if omitted.
 * Requires the authenticated user to be a member of the project's workspace.
 */
export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectId = parseId(req.params.projectId);

    if (!(await isProjectMember(projectId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const { title, description, priority, status, dueDate, assigneeId } =
      req.body;

    const newTask = await db
      .insert(tasks)
      .values({
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null, // coerce ISO string → Date
        assigneeId: assigneeId || null,
        projectId,
        createdById: req.userId!,
      })
      .returning();

    res.status(201).json({ success: true, data: newTask[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /tasks/:id
 * Partially updates a task. All fields are optional — only provided fields are written.
 * Supports updating position, which drives kanban column ordering on the client.
 * Requires the authenticated user to be a member of the task's project workspace.
 */
export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    const task = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task.length) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    if (!(await isProjectMember(task[0].projectId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assigneeId,
      position,
    } = req.body;

    // Sparse update: only include keys that were explicitly sent in the request body
    const updated = await db
      .update(tasks)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(position !== undefined && { position }),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    res.json({ success: true, data: updated[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /tasks/:id
 * Permanently deletes a task and (via cascade) its comments.
 * Requires the authenticated user to be a member of the task's project workspace.
 */
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    const task = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task.length) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    if (!(await isProjectMember(task[0].projectId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /tasks/:id/comments
 * Adds a comment to a task on behalf of the authenticated user.
 * Requires the authenticated user to be a member of the task's project workspace.
 */
export const addComment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const { content } = req.body;

    if (!content) {
      res
        .status(400)
        .json({ success: false, message: "Comment content is required" });
      return;
    }

    const task = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task.length) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    if (!(await isProjectMember(task[0].projectId, req.userId!))) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const newComment = await db
      .insert(comments)
      .values({
        content,
        taskId: id,
        userId: req.userId!,
      })
      .returning();

    res.status(201).json({ success: true, data: newComment[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
