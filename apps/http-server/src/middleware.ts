import { NextFunction, Request, Response } from "express";
import jwt,{ verify } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";

export const middleware = (req:Request,res:Response,next:NextFunction) => {
    const token = req.headers['authorization']
    if(!token){
        return
    }

    try {
        const decoded = jwt.verify(token,JWT_SECRET)
        if(decoded){
            //@ts-ignore
            req.id = decoded.userId
            next()
        } 
    }catch (error) {
         res.status(401).json({
            message : 'auth failed',
            error:error
        })
    }
    }
