//this is to validate the schema is proper or not
import type { Request,Response,NextFunction } from "express";
import { ZodSchema } from "zod";
import { errorResponse } from "../utils/responses";
export const validateHandler =
<T>(schema:ZodSchema<T>)=>
    (
   
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    const result=schema.safeParse(req.body)
    if(!result.success){
        res.status(400).json({success:false,errors:result.error.errors})
    }
    next()
}