import express from "express"
import { validateHandler } from "../middlewares/validate"
import { RestaruntSchema, type Restaurant } from "../schemas/restraunt"
const router=express.Router()
router.post('/',validateHandler(RestaruntSchema),async(req ,res)=>{
    const data=req.body as Restaurant
})
export default router