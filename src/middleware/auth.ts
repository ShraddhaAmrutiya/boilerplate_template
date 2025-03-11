import { Request ,Response, NextFunction } from "express";
import  Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

interface UserPayload{
    id?:number;
 }

 declare module"express" {
    export interface Request{
        user?: UserPayload
    }
 }

 export const verifyToken=(req:Request, res:Response , next:NextFunction)=>{
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified =Jwt.verify(token,process.env.JWT_SECRET as string) as UserPayload
        req.user =verified
        next()
    } catch (error) {
        res.status(400).json({message:"Invalid token"})
    }
 }


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
