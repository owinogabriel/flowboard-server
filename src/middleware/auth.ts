import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../types/index.js'

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: "No token provided" })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
    req.userId = decoded.userId
    next()

  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" })
  }
}

export default requireAuth