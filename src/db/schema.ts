import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const statusEnum = pgEnum("status", [
  "todo",
  "in_progress",
  "completed",
]);
export const roleEnum = pgEnum("role", ["owner", "admin", "member"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1"),
  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  role: roleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1"),
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: statusEnum("status").default("todo").notNull(),
  position: integer("position").default(0).notNull(),
  dueDate: timestamp("due_date"),
  projectId: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  taskId: integer("task_id")
    .references(() => tasks.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
