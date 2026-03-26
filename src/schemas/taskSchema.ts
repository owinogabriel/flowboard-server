import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.number().int().positive().optional().nullable()
})

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.number().int().positive().optional().nullable(),
  position: z.number().int().optional()
})