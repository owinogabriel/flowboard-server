import { Request, Response, NextFunction } from 'express'

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  })
}

export default errorHandler