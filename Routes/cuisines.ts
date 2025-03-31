import express from "express"
import { InitializeClient } from "../utils/client"
import { cuisineKey, cuisinesKey, restrauntKeyById } from "../utils/keys";
import { sucessResponse } from "../utils/responses";
const router=express.Router()
router.get("/",async(req,res,next)=>{
    try {
        const client=await InitializeClient();
        const cuisines=await client.sMembers(cuisinesKey)
        sucessResponse(res,cuisines)
    } catch (error) {
        next(error)
    }
})
router.get("/:cuisine",async(req,res,next)=>{
    const {cuisine}=req.params
    try {
        const client=await InitializeClient();
        const cuisines=await client.sMembers(cuisineKey(cuisine))
        const restarunts=await Promise.all(
            cuisines.map((id)=> client.hGet(restrauntKeyById(id),"name")// It waits for all hGet calls to resolve proper
            //This version uses curly braces, which means you're starting a block body — but you're not returning anything! So this will return undefined for each item in map, like: ((id)=> { client.hGet(restrauntKeyById(id),"name")}
            )
        )
        sucessResponse(res,restarunts)
    } catch (error) {
        next(error)
    }
})

export default router

