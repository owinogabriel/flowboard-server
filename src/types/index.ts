import { Request } from "express";

// Extend Express Request to include userId
export interface AuthRequest extends Request {
  userId?: number;
}
