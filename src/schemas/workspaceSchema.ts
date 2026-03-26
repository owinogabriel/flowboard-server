import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
})

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
})