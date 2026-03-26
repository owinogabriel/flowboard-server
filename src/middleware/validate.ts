import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
    res.status(400).json({ success: false, message: "Validation failed", errors })
    return
  }

  req.body = result.data
  next()
}