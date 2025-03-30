import type { Request,Response,NextFunction } from "express";
import { InitializeClient } from "../utils/client";
import { errorHandler } from "./erroHandler";
import { errorResponse } from "../utils/responses";
import { restrauntKeyById } from "../utils/keys";
export const checkRestaurants = async(
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {resturantId} = req.params
    
    if(!resturantId) {
         errorResponse(res, 400, "Restaurant ID not found")
    }
    
    const client = await InitializeClient();
    const restaurantKey = restrauntKeyById(resturantId)
    const exist = await client.exists(restaurantKey)
    
    if(!exist) {
         errorResponse(res, 404, "Restaurant not found")
    }
    
    next();
}