import express from "express"
import { validateHandler } from "../middlewares/validate"
import { RestaruntSchema, type Restaurant } from "../schemas/restraunt"
import { InitializeClient } from "../utils/client"
const router=express.Router()
router.post('/',validateHandler(RestaruntSchema),async(req ,res)=>{
    const data=req.body as Restaurant
    const client=await InitializeClient();
    res.send("hello")
})
export default router