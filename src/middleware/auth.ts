import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types";
import jwt from 'jsonwebtoken'

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if(!authHeader || !!authHeader.startsWith('Bearer')){
      res.status(401).json({success:false, message: "No token provided"})
    }

    const token = authHeader?.split(' ')[1]
     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number }
    req.userId = decoded.userId
    next()

  }catch (error){
    res.status(400).json({succes:false, message: 'Invalida or expired token'})
  }
}