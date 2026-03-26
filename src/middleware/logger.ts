import { NextFunction, Request, Response } from "express";


const logger = (req:Request, res:Response, next:NextFunction):void => {
  console.log(`[${new Date().toISOString()}]  ${req.method} ${req.url}`)
  next()
}

export default logger